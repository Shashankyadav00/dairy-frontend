import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Card,
  Typography,
  IconButton,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function AddCustomer() {
  const userId = localStorage.getItem("userId"); // ✅ Required for filtering

  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [pricePerLitre, setPricePerLitre] = useState("");
  const [shift, setShift] = useState(localStorage.getItem("selectedShift") || "Morning");
  const [customers, setCustomers] = useState([]);

  const [openEdit, setOpenEdit] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);

  const navigate = useNavigate();

  // Load customers for logged-in user
 const loadCustomers = async () => {
  try {
    const res = await api.get("/api/customers", {
      params: { shift, userId }
    });

    setCustomers(res.data);
  } catch (err) {
    console.error("Error loading customers:", err);
  }
};


  useEffect(() => {
    loadCustomers();
  }, [shift]);

  // Add customer
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert("Please enter customer name.");
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      nickname: nickname.trim() || null,
      shift,
      pricePerLitre: pricePerLitre ? parseFloat(pricePerLitre) : null,
      userId: userId, // ✅ Attach logged-in user's ID
    };

    try {
      await api.post("/api/customers", payload); // ✅ Includes userId
      setFullName("");
      setNickname("");
      setPricePerLitre("");
      loadCustomers();
    } catch (err) {
      console.error("Error adding customer:", err);
      alert("Failed to add customer!");
    }
  };

  // Delete customer
  const deleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    await api.delete(`/api/customers/${id}`);
    loadCustomers();
  };

  // Edit customer
  const handleEditClick = (customer) => {
    setEditCustomer(customer);
    setOpenEdit(true);
  };

  const handleUpdate = async () => {
    if (!editCustomer) return;

    try {
      const updated = {
        ...editCustomer,
        pricePerLitre: editCustomer.pricePerLitre
          ? parseFloat(editCustomer.pricePerLitre)
          : null,
      };

      await api.put(`/api/customers/${editCustomer.id}`, updated);
      alert("Customer updated successfully!");
      setOpenEdit(false);
      loadCustomers();
    } catch (err) {
      console.error("Error updating customer:", err);
      alert("Failed to update customer!");
    }
  };

  const handleEditChange = (field, value) => {
    setEditCustomer({ ...editCustomer, [field]: value });
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
      <Card
        style={{
          width: "550px",
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate("/dashboard")}
          style={{ marginBottom: "20px" }}
        >
          ← Back to Dashboard
        </Button>

        <Typography variant="h5" style={{ color: "#27ae60", fontWeight: "bold" }}>
          🧾 Manage Customers ({shift})
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Full Name"
            fullWidth
            margin="normal"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <TextField
            label="Nickname"
            fullWidth
            margin="normal"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <TextField
            label="Price per Litre (optional)"
            fullWidth
            type="number"
            margin="normal"
            value={pricePerLitre}
            onChange={(e) => setPricePerLitre(e.target.value)}
          />

          <Select
            value={shift}
            fullWidth
            onChange={(e) => {
              setShift(e.target.value);
              localStorage.setItem("selectedShift", e.target.value);
            }}
            style={{ marginTop: "15px" }}
          >
            <MenuItem value="Morning">Morning</MenuItem>
            <MenuItem value="Night">Night</MenuItem>
          </Select>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            style={{
              marginTop: "20px",
              background: "linear-gradient(135deg, #6ee7b7, #3b82f6)",
              color: "white",
              fontWeight: "bold",
            }}
          >
            ➕ Add Customer
          </Button>
        </form>

        <Typography variant="h6" style={{ marginTop: "25px" }}>
          Existing Customers
        </Typography>

        {customers.length === 0 ? (
          <Typography variant="body2" style={{ marginTop: "10px" }}>
            No customers found.
          </Typography>
        ) : (
          customers.map((c) => (
            <Card
              key={c.id}
              style={{
                marginTop: "10px",
                padding: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Typography>{c.fullName || c.nickname}</Typography>
                {c.pricePerLitre && (
                  <Typography variant="body2" color="textSecondary">
                    ₹{c.pricePerLitre?.toFixed(2)} / litre
                  </Typography>
                )}
              </div>

              <div>
                <IconButton color="primary" onClick={() => handleEditClick(c)}>
                  <Edit />
                </IconButton>
                <IconButton color="error" onClick={() => deleteCustomer(c.id)}>
                  <Delete />
                </IconButton>
              </div>
            </Card>
          ))
        )}
      </Card>

      {/* Edit Modal */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
          {editCustomer && (
            <>
              <TextField
                label="Full Name"
                fullWidth
                margin="dense"
                value={editCustomer.fullName || ""}
                onChange={(e) => handleEditChange("fullName", e.target.value)}
              />
              <TextField
                label="Nickname"
                fullWidth
                margin="dense"
                value={editCustomer.nickname || ""}
                onChange={(e) => handleEditChange("nickname", e.target.value)}
              />
              <TextField
                label="Price per Litre (optional)"
                type="number"
                fullWidth
                margin="dense"
                value={editCustomer.pricePerLitre || ""}
                onChange={(e) => handleEditChange("pricePerLitre", e.target.value)}
              />
              <Select
                fullWidth
                margin="dense"
                value={editCustomer.shift || "Morning"}
                onChange={(e) => handleEditChange("shift", e.target.value)}
                style={{ marginTop: "15px" }}
              >
                <MenuItem value="Morning">Morning</MenuItem>
                <MenuItem value="Night">Night</MenuItem>
              </Select>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdate}
            style={{
              background: "linear-gradient(135deg, #4ade80, #16a34a)",
              color: "white",
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AddCustomer;
