import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Organization.css';

const BACKEND_URL = 'http://localhost:5000';

const Organization = ({ organization, user }) => {
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

  return (
    <div className="organization-container">
      <div className="organization-header">
        <h1>{organization?.name || 'My Organization'}</h1>
        <p>Manage your organization settings and team members</p>

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