import React from "react";

const StatCard = ({ label, value }) => {
  return (
    <div className="card">
      <div className="card-title">{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>
        {value}
      </div>
    </div>
  );
};

export default StatCard;
