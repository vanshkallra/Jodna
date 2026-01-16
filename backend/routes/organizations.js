const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Organization = require('../models/Organization');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// @desc    Create Organization
// @route   POST /api/organizations
router.get('/my', protect, async (req, res) => {
    try {
        if (!req.user.organization) {
            return res.status(404).json({ error: 'User does not belong to an organization' });
        }
        const org = await Organization.findById(req.user.organization);
        res.json(org);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/', protect, async (req, res) => {
    try {
        // 1. Check if user already has an org
        if (req.user.organization) {
            return res.status(400).json({ error: 'User already belongs to an organization' });
        }

        // 2. Create Org
        const org = await Organization.create({
            name: req.body.name,
            owner: req.user.id,
            inviteCode: uuidv4().slice(0, 8), // Simple 8-char code e.g., 'a1b2c3d4'
            domain: req.body.domain
        });

        // 3. Update User: Assign Org & Make Admin
        await User.findByIdAndUpdate(req.user.id, {
            organization: org._id,
            role: 'ADMIN'
        });

        res.status(201).json(org);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @desc    Join Organization via Code
// @route   POST /api/organizations/join
router.post('/join', protect, async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const org = await Organization.findOne({ inviteCode });

        if (!org) {
            return res.status(404).json({ error: 'Invalid invite code' });
        }

        // Add user to org with default role DESIGNER
        await User.findByIdAndUpdate(req.user.id, {
            organization: org._id,
            role: 'DESIGNER'
        });

        res.json(org);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @desc    Leave Organization
// @route   POST /api/organizations/leave
router.post('/leave', protect, async (req, res) => {
    try {
        if (!req.user.organization) {
            return res.status(400).json({ error: 'User is not in an organization' });
        }

        // Check if user is owner
        const org = await Organization.findById(req.user.organization);

        // If org exists and user is owner
        if (org && org.owner.toString() === req.user.id) {
            return res.status(400).json({ error: 'Owners cannot leave their organization. You must delete it or transfer ownership.' });
        }

        // Remove user from org
        await User.findByIdAndUpdate(req.user.id, {
            organization: null,
            role: 'DESIGNER' // Reset to default role
        });

        res.json({ message: 'Successfully left organization' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
