import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "./Table.css";
const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  "http://localhost:8080";

const makeStyle = (status) => {
  if (status === "Đã giao") {
    return {
      background: "rgb(145 254 159 / 47%)",
      color: "green",
    };
  } else if (status === "Đang vận chuyển") {
    return {
      background: "#59bfff",
      color: "white",
    };
  } else if (status === "Chờ xác nhận") {
    return {
      background: "#ffadad8f",
      color: "red",
    };
  }
  return {};
};

export default function BasicTable() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
   fetch(`${API_BASE}/orders`)

      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          // chỉ lấy đơn đã giao
          const delivered = res.data.filter((o) => o.status === "Đã giao");
          setOrders(delivered);
        }
      });
  }, []);

  return (
    <div className="Table">
      <h3>Completed Orders</h3>

      <TableContainer
        component={Paper}
        style={{ boxShadow: "0px 13px 20px 0px #80808029" }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="orders table">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell align="left">Order Code</TableCell>
              <TableCell align="left">Date</TableCell>
              <TableCell align="left">Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody style={{ color: "white" }}>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell component="th" scope="row">
                  {order.contact?.fullName || "Không có sản phẩm"}
                </TableCell>

                <TableCell align="left">{order.code}</TableCell>

                <TableCell align="left">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </TableCell>

                <TableCell align="left">
                  <span className="status" style={makeStyle(order.status)}>
                    {order.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}

            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} style={{ textAlign: "center" }}>
                  Không có đơn hàng đã giao
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
