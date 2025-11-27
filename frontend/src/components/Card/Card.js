import React from "react";
import "./Card.css";

const Card = ({ title, value, color }) => {
  return (
    <div
      className="CompactCard"
      style={{
        background: color.backGround,
        boxShadow: color.boxShadow,
        padding: "20px",
        borderRadius: "10px",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <span style={{ fontSize: "20px", fontWeight: "bold" }}>{title}</span>
      <span style={{ fontSize: "30px", fontWeight: "bold" }}>{value}</span>
    </div>
  );
};

export default Card;
