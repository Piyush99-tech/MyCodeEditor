import React from 'react';

const Client = ({ username }) => {
    // Create a unique seed using username
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;

    return (
        <div className="client flex flex-col items-center gap-1">
            <img
                src={avatarUrl}
                alt="avatar"
                className="w-12 h-12 rounded-xl shadow-md"
            />
            <span className="userName text-sm font-medium text-center">{username}</span>
        </div>
    );
};

export default Client;
