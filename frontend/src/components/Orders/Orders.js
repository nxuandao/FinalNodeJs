import React from "react";
import "./Orders.css";

const orders = [
  { id: 1, name: "Andrew Thomas", product: "Apple Watch", date: "2 March 2022", status: "Delivered" },
  { id: 2, name: "James Bond", product: "Samsung Charger", date: "3 March 2022", status: "Pending" },
  { id: 3, name: "Iron Man", product: "Gear Battery", date: "4 March 2022", status: "Approved" },
  { id: 1, name: "Andrew Thomas", product: "Apple Watch", date: "2 March 2022", status: "Delivered" },
  { id: 2, name: "James Bond", product: "Samsung Charger", date: "3 March 2022", status: "Pending" },
  { id: 3, name: "Iron Man", product: "Gear Battery", date: "4 March 2022", status: "Approved" },
  { id: 1, name: "Andrew Thomas", product: "Apple Watch", date: "2 March 2022", status: "Delivered" },
  { id: 2, name: "James Bond", product: "Samsung Charger", date: "3 March 2022", status: "Pending" },
  { id: 3, name: "Iron Man", product: "Gear Battery", date: "4 March 2022", status: "Approved" },
  { id: 1, name: "Andrew Thomas", product: "Apple Watch", date: "2 March 2022", status: "Delivered" },
  { id: 2, name: "James Bond", product: "Samsung Charger", date: "3 March 2022", status: "Pending" },
  { id: 3, name: "Iron Man", product: "Gear Battery", date: "4 March 2022", status: "Approved" },
  { id: 1, name: "Andrew Thomas", product: "Apple Watch", date: "2 March 2022", status: "Delivered" },
  { id: 2, name: "James Bond", product: "Samsung Charger", date: "3 March 2022", status: "Pending" },
  { id: 3, name: "Iron Man", product: "Gear Battery", date: "4 March 2022", status: "Approved" },
];

const OrdersList = () => {
  return (
    <div className="OrdersList">
      <h2>Orders List</h2>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Product</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.name}</td>
              <td>{o.product}</td>
              <td>{o.date}</td>
              <td className={`status ${o.status.toLowerCase()}`}>{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersList;
