import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Organization.css';

const BACKEND_URL = 'http://localhost:5000';

const Organization = ({ organization, user, onLeave }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user.role === 'ADMIN';

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BACKEND_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMembers(res.data);
      } catch (err) {
        console.error("Failed to fetch members", err);
      } finally {
        setLoading(false);
      }
    };

    if (organization) {
      fetchMembers();
    }
  }, [organization]);

  const handleLeave = async () => {
    if (window.confirm("Are you sure you want to leave this organization?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${BACKEND_URL}/api/organizations/leave`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (onLeave) onLeave();
      } catch (err) {
        console.error("Error leaving organization:", err);
        alert(err.response?.data?.error || "Failed to leave organization");
      }
    }
  };

  return (
    <div className="organization-container">
      <div className="organization-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>{organization?.name || 'My Organization'}</h1>
            <p>Manage your organization settings and team members</p>
          </div>
          {!isAdmin && (
            <button
              onClick={handleLeave}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ffebeb',
                color: '#d32f2f',
                border: '1px solid #ffcdd2',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Leave Organization
            </button>
          )}
        </div>

        {isAdmin && organization?.inviteCode && (
          <div className="invite-section">
            <strong>Invite Code:</strong>
            <div className="invite-code">{organization.inviteCode}</div>
            <p style={{ fontSize: '13px', color: '#6e6e6e', marginTop: '8px' }}>
              Share this code with team members to join. They can enter this code upon signup.
            </p>
          </div>
        )}
      </div>

      <div className="members-section">
        <h2>Team Members ({members.length})</h2>
        {loading ? (
          <p>Loading members...</p>
        ) : (
          <div className="members-list">
            {members.map(member => (
              <div key={member._id} className="member-card">
                <div className="member-info">
                  <div className="user-avatar">
                    {member.displayName ? member.displayName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <div className="member-name">{member.displayName}</div>
                    <div className="member-email">{member.email}</div>
                  </div>
                </div>
                <span className={`role-badge role-${member.role?.toLowerCase()}`}>
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Organization;