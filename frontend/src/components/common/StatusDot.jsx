import React from "react";

const StatusDot = ({ status }) => {
  return (
    <span
      className={
        "status-dot " + (status === "online" ? "status-online" : "status-offline")
      }
    ></span>
  );
};

export default StatusDot;
