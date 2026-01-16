import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Projects.css';
import './Tickets.css'; // Import shared ticket styles

const BACKEND_URL = 'http://localhost:5000';

const ProjectDetails = ({ project, user, onBack }) => {
    const [tickets, setTickets] = useState([]);
    const [ticketsLoading, setTicketsLoading] = useState(true);
    const [showCreateTicket, setShowCreateTicket] = useState(false);
    const [members, setMembers] = useState([]);

    // Ticket Selection & Modal State
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

    // New Ticket State
    const [newTicket, setNewTicket] = useState({
        title: '',
        description: '',
        status: 'Open',
        assignee: ''
    });
    const [creating, setCreating] = useState(false);
    const [deletingTicketId, setDeletingTicketId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    // Permissions
    const canCreateTicket = user.role === 'ADMIN' || user.role === 'MANAGER';
    const canDeleteTicket = user.role === 'ADMIN'; // Admin only
    // canEditTicket logic: Admin/Manager OR the Assignee
    const canEditTicket = (ticket) => {
        if (!ticket) return false;
        if (user.role === 'ADMIN' || user.role === 'MANAGER') return true;
        if (user.role === 'DESIGNER' && ticket.assignee && ticket.assignee._id === user._id) return true;
        return false;
    };

    useEffect(() => {
        fetchTickets();
        if (canCreateTicket) {
            fetchMembers();
        }
    }, [project._id]);

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${BACKEND_URL}/api/tickets?project=${project._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(res.data);
        } catch (err) {
            console.error("Failed to fetch tickets", err);
        } finally {
            setTicketsLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${BACKEND_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMembers(res.data);
        } catch (err) {
            console.error("Failed to fetch members", err);
        }
    };

    const handleCreateTicket = async () => {
        if (!newTicket.title.trim()) return;

        setCreating(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...newTicket,
                project: project._id,
                assignee: newTicket.assignee || null
            };

            const res = await axios.post(`${BACKEND_URL}/api/tickets`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets([res.data, ...tickets]);
            setShowCreateTicket(false);
            setNewTicket({ title: '', description: '', status: 'Open', assignee: '' });
        } catch (err) {
            console.error("Failed to create ticket", err);
            alert("Failed to create ticket");
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteTicket = async (ticketId) => {
        setDeletingTicketId(ticketId);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${BACKEND_URL}/api/tickets/${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(tickets.filter(t => t._id !== ticketId));
            setShowDeleteConfirm(null);
            closeTicketModal(); // Close detail modal if open
        } catch (err) {
            console.error("Failed to delete ticket", err);
            alert(err.response?.data?.error || "Failed to delete ticket");
        } finally {
            setDeletingTicketId(null);
        }
    };

    const handleStatusChange = async (ticketId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${BACKEND_URL}/api/tickets/${ticketId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state
            const updatedTicket = res.data;
            setTickets(tickets.map(t => t._id === ticketId ? updatedTicket : t));

            // If the updated ticket is currently selected in the modal, update it there too
            if (selectedTicket && selectedTicket._id === ticketId) {
                setSelectedTicket(updatedTicket);
            }
        } catch (err) {
            console.error("Failed to update status", err);
            alert(err.response?.data?.error || "Failed to update status");
        }
    };

    const handleTicketClick = (ticket) => {
        setSelectedTicket(ticket);
        setIsTicketModalOpen(true);
    };

    const closeTicketModal = () => {
        setSelectedTicket(null);
        setIsTicketModalOpen(false);
    };

    // Helper to get initials
    const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';

    return (
        <div className="project-details-container">
            <div className="project-header">
                <button className="back-button" onClick={onBack}>
                    &larr; Back to Projects
                </button>
                <div className="project-title-row">
                    <h1>{project.name}</h1>
                    {canCreateTicket && (
                        <button className="btn-primary" onClick={() => setShowCreateTicket(true)}>
                            + New Ticket
                        </button>
                    )}
                </div>
                <p className="project-desc">{project.description}</p>
            </div>

            <div className="tickets-section">
                <h2>Tickets ({tickets.length})</h2>
                {ticketsLoading ? (
                    <p>Loading tickets...</p>
                ) : tickets.length === 0 ? (
                    <div className="no-tickets">
                        <p>No tickets in this project yet.</p>
                    </div>
                ) : (
                    <div className="tickets-list">
                        {tickets.map(ticket => (
                            <div
                                key={ticket._id}
                                className="ticket-card"
                                onClick={() => handleTicketClick(ticket)}
                            >
                                <div className="ticket-main">
                                    <div className="ticket-title">{ticket.title}</div>
                                    <div className="ticket-description">{ticket.description}</div>
                                    <div className="ticket-footer">
                                        <span>Assigned to: {ticket.assignee ? ticket.assignee.displayName : 'Unassigned'}</span>
                                        <span>Updated {ticket.updated_at ? new Date(ticket.updated_at).toLocaleDateString() : '—'}</span>
                                    </div>
                                </div>
                                <span className={`status-badge status-${ticket.status.toLowerCase()}`}>
                                    {ticket.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* TICKET DETAIL MODAL */}
            {isTicketModalOpen && selectedTicket && (
                <div className="modal-overlay" onClick={closeTicketModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="modal-header">
                            <h2>{selectedTicket.title}</h2>
                            <span className={`status-badge status-${selectedTicket.status.toLowerCase()}`}>
                                {selectedTicket.status}
                            </span>
                        </div>

                        {/* Description */}
                        <div className="modal-section">
                            <h4>Description</h4>
                            <p>{selectedTicket.description || 'No description provided.'}</p>
                        </div>

                        {/* Details Grid */}
                        <div className="modal-grid">
                            <div>
                                <label>Assignee</label>
                                <p>{selectedTicket.assignee ? selectedTicket.assignee.displayName : 'Unassigned'}</p>
                            </div>
                            <div>
                                <label>Created By</label>
                                <p>{selectedTicket.createdBy ? selectedTicket.createdBy.displayName : '—'}</p>
                            </div>
                            <div>
                                <label>Created At</label>
                                <p>{selectedTicket.created_at ? new Date(selectedTicket.created_at).toLocaleString() : '—'}</p>
                            </div>
                            <div>
                                <label>Last Updated</label>
                                <p>{selectedTicket.updated_at ? new Date(selectedTicket.updated_at).toLocaleString() : '—'}</p>
                            </div>
                        </div>

                        {/* Actions Section */}
                        {(canEditTicket(selectedTicket) || canDeleteTicket) && (
                            <div className="modal-section" style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '24px' }}>
                                <h4>Actions</h4>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' }}>

                                    {/* Status Change */}
                                    {canEditTicket(selectedTicket) && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <label style={{ fontSize: '12px', color: '#666' }}>Change Status:</label>
                                            <select
                                                className="form-input"
                                                style={{ width: 'auto', padding: '4px 8px', margin: 0 }}
                                                value={selectedTicket.status}
                                                onChange={(e) => handleStatusChange(selectedTicket._id, e.target.value)}
                                            >
                                                <option value="Open">Open</option>
                                                <option value="InProgress">In Progress</option>
                                                <option value="Review">Review</option>
                                                <option value="Done">Done</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Delete Button */}
                                    {canDeleteTicket && (
                                        <button
                                            className="btn-secondary"
                                            style={{ background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', marginLeft: 'auto' }}
                                            onClick={() => setShowDeleteConfirm(selectedTicket._id)}
                                        >
                                            Delete Ticket
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={closeTicketModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Ticket Modal */}
            {showCreateTicket && (
                <div className="modal-overlay" onClick={() => setShowCreateTicket(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Ticket</h2>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newTicket.title}
                                    onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                                    placeholder="Task title"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-input"
                                    value={newTicket.description}
                                    onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                                    placeholder="Task description"
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Assignee</label>
                                <select
                                    className="form-input"
                                    value={newTicket.assignee}
                                    onChange={e => setNewTicket({ ...newTicket, assignee: e.target.value })}
                                >
                                    <option value="">Unassigned</option>
                                    {members.map(member => (
                                        <option key={member._id} value={member._id}>
                                            {member.displayName} ({member.role})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    className="form-input"
                                    value={newTicket.status}
                                    onChange={e => setNewTicket({ ...newTicket, status: e.target.value })}
                                >
                                    <option value="Open">Open</option>
                                    <option value="InProgress">In Progress</option>
                                    <option value="Review">Review</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="modal-button cancel-button"
                                onClick={() => setShowCreateTicket(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="modal-button confirm-button"
                                onClick={handleCreateTicket}
                                disabled={creating || !newTicket.title.trim()}
                            >
                                {creating ? 'Creating...' : 'Create Ticket'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => !deletingTicketId && setShowDeleteConfirm(null)}>
                    <div className="modal-content delete-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>Delete Ticket</h2>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete this ticket?</p>
                            <p className="warning-text">
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="modal-button cancel-button"
                                onClick={() => setShowDeleteConfirm(null)}
                                disabled={deletingTicketId !== null}
                            >
                                Cancel
                            </button>
                            <button
                                className="modal-button delete-confirm-button"
                                onClick={() => handleDeleteTicket(showDeleteConfirm)}
                                disabled={deletingTicketId !== null}
                            >
                                {deletingTicketId === showDeleteConfirm ? 'Deleting...' : 'Delete Ticket'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetails;
