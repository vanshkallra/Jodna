import React, { useState } from 'react';
import './Tickets.css';

const Tickets = ({ user }) => {
  const [filter, setFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockTickets = [
    {
      id: 1,
      title: 'Design homepage hero section',
      description: 'Create engaging hero design with brand colors',
      status: 'Open',
      assignee: 'Jane Doe',
      createdBy: 'Manager Name'
    },
    {
      id: 2,
      title: 'Update color palette',
      description: 'Refresh brand colors based on new guidelines',
      status: 'InProgress',
      assignee: user.displayName,
      createdBy: 'Manager Name'
    },
    {
      id: 3,
      title: 'Create icon set',
      description: '20 custom icons needed for dashboard',
      status: 'Review',
      assignee: 'John Smith',
      createdBy: 'Manager Name'
    },
    {
      id: 4,
      title: 'Mobile responsive fixes',
      description: 'Fix layout issues on mobile devices',
      status: 'Done',
      assignee: user.displayName,
      createdBy: 'Manager Name'
    }
  ];

  const canCreateTicket = user.role === 'ADMIN' || user.role === 'MANAGER';

  const filteredTickets = filter === 'All'
    ? mockTickets
    : mockTickets.filter(ticket => ticket.status === filter);

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTicket(null);
    setIsModalOpen(false);
  };

  return (
    <div className="tickets-container">
      <div className="tickets-header">

        {canCreateTicket && (
          <button className="btn-primary">+ New Ticket</button>
        )}
      </div>

      <div className="tickets-filters">
        {['All', 'Open', 'InProgress', 'Review', 'Done'].map(status => (
          <button
            key={status}
            className={`filter-btn ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="tickets-list">
        {filteredTickets.map(ticket => (
          <div
            key={ticket.id}
            className="ticket-card"
            onClick={() => handleTicketClick(ticket)}
          >
            <div className="ticket-main">
              <div className="ticket-title">{ticket.title}</div>
              <div className="ticket-description">{ticket.description}</div>
              <div className="ticket-footer">
                <span>Assigned to: {ticket.assignee}</span>
                <span>Updated 3h ago</span>
              </div>
            </div>
            <span className={`status-badge status-${ticket.status.toLowerCase()}`}>
              {ticket.status}
            </span>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && selectedTicket && (
        <div className="modal-overlay" onClick={closeModal}>
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

            {/* Details */}
            <div className="modal-grid">
              <div>
                <label>Assignee (Designer)</label>
                <p>{selectedTicket.assignee?.name || selectedTicket.assignee}</p>
              </div>

              <div>
                <label>Created By</label>
                <p>{selectedTicket.created_by?.name || selectedTicket.createdBy}</p>
              </div>

              <div>
                <label>Organization</label>
                <p>{selectedTicket.organization?.name || '—'}</p>
              </div>

              <div>
                <label>Created At</label>
                <p>
                  {selectedTicket.created_at
                    ? new Date(selectedTicket.created_at).toLocaleString()
                    : '—'}
                </p>
              </div>

              <div>
                <label>Last Updated</label>
                <p>
                  {selectedTicket.updated_at
                    ? new Date(selectedTicket.updated_at).toLocaleString()
                    : '—'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
