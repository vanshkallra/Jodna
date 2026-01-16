import React from 'react';
import './NoOrganizationMessage.css';

const NoOrganizationMessage = () => {
    return (
        <div className="no-org-container">
            <div className="no-org-content">
                <h2>Organization Required</h2>
                <p>You are not currently part of any organization.</p>
                <p>Please ask the administrator to add you to an organization to access the dashboard.</p>
            </div>
        </div>
    );
};

export default NoOrganizationMessage;
