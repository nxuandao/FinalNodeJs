import React, { useEffect, useState } from "react";
import "./Cards.css";
import Card from "../Card/Card";

const Cards = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    revenue: 0,
  });

  useEffect(() => {
    fetch("http://localhost:8080/orders/stats/all")
      .then(res => res.json())
      .then(res => {
        if (res.success) setStats(res.data);
      });
  }, []);

  const cardsData = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      color: {
        backGround: "#1e90ff",
        boxShadow: "0px 10px 20px #1e90ff50",
      },
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders,
      color: {
        backGround: "#00c851",
        boxShadow: "0px 10px 20px #00c85150",
      },
    },
    {
      title: "Revenue (VND)",
      value: stats.revenue.toLocaleString(),
      color: {
        backGround: "#ff4444",
        boxShadow: "0px 10px 20px #ff444450",
      },
    },
  ];

  return (
    <div className="Cards">
      {cardsData.map((card, id) => (
        <div className="parentContainer" key={id}>
          <Card {...card} />
        </div>
      ))}
    </div>
  );
};

export default Cards;
