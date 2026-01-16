const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Project = require('../models/Project');

// Helper for roles (Simple inline or better in middleware)
const ensureRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Not authorized for this action' });
    }
    next();
};

// @desc    Get All Projects (Scoped to Org)
// @route   GET /api/projects
router.get('/', protect, async (req, res) => {
    try {
        // Check if user has an organization
        if (!req.user.organization) {
            return res.json([]); // Return empty array if no organization
        }

        const projects = await Project.find({ organization: req.user.organization })
            .populate('created_by', 'displayName')
            .sort({ updated_at: -1 });
        res.json(projects);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// @desc    Get Single Project
// @route   GET /api/projects/:id
router.get('/:id', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('created_by', 'displayName');

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (!project.organization.equals(req.user.organization)) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @desc    Create Project (Manager/Admin only)
// @route   POST /api/projects
router.post('/', protect, ensureRole(['ADMIN', 'MANAGER']), async (req, res) => {
    try {
        const project = await Project.create({
            ...req.body,
            created_by: req.user.id,
            organization: req.user.organization
        });
        res.status(201).json(project);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
