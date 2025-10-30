import React from "react";
// import "../MainDash/MainDash.css";
import "../Customers/Custormers.css";
import {toast} from "react-toastify";
import { useEffect, useState } from "react";

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("http://localhost:8080/auth/customers");
        const data = await response.json();
        if(response.ok){
          setCustomers(data.data || []);
        }
        else{
          toast.error(data.message || "Failed to fetch customers");
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("An error occurred while fetching customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);


  const handleStatusChange = async(_id, newStatus) => {
    const customer = customers.find((c) => c._id === _id);
    if (!customer) return;

    const confirmChange = window.confirm(
      `Are you sure you want to change the status of ${customer.name} to ${newStatus}?`
    );
    if (!confirmChange) return;

    try{
      const res = await fetch(`http://localhost:8080/auth/customers/${_id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setCustomers((prevCustomers) =>
          prevCustomers.map((c) =>
            c._id === _id ? { ...c, status: newStatus } : c
          )
        );
      } else {
        toast.error(result.message || "Failed to update customer status");
      }
    } catch (error) {
      console.error("Error updating customer status:", error);
      toast.error("An error occurred while updating customer status");
    }
  };

  if (loading) return <div>Loading customers...</div>;
  return (
    <div className="CustomersList">
      <h1>Customers</h1>
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c._id}>
              <td>{c._id.slice(-4)}</td>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>
                <select
                  value={c.status}
                  onChange={(e) => handleStatusChange(c._id, e.target.value)}
                  className={`status ${c.status}`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="new">New</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomersList;
