import React from "react";
import Avatar from "react-avatar";

const Client = ({ username }) => {
  return (
    <div className="flex items-center mb-2">
      <Avatar name={username} size={50} round="14px" />
      <span className="ml-2 text-white">{username}</span>
    </div>
  );
};

export default Client;