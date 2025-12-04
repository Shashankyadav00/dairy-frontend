import React, { useState, useEffect } from "react";
import api from "../api/axios";
import {
  Card,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Popover,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function DayWiseEntry() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [shift, setShift] = useState(localStorage.getItem("selectedShift") || "Morning");
  const [litres, setLitres] = useState(0);
  const [rate, setRate] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  // Load customers
  const loadCustomers = async () => {
    try {
      const res = await api.get(`/api/customers/${shift}`);
      setCustomers(res.data);
    } catch (err) {
      console.error("Error loading customers:", err);
    }
  };

  // Load entries
  const loadEntries = async () => {
    try {
      const res = await api.get(`/api/milk/${shift}`);
      setEntries(res.data);
    } catch (err) {
      console.error("Error loading entries:", err);
    }
  };

  useEffect(() => {
    loadCustomers();
    loadEntries();
  }, [shift]);

  useEffect(() => {
    const cust = customers.find(
      (c) => c.fullName === selectedCustomer || c.nickname === selectedCustomer
    );
    if (cust) setRate(cust.pricePerLitre);
  }, [selectedCustomer, customers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || !litres || !rate || !date) {
      alert("Please fill all fields");
      return;
    }

    try {
      const entry = {
        customerName: selectedCustomer,
        shift,
        litres: parseFloat(litres),
        rate: parseFloat(rate),
        amount: parseFloat(litres) * parseFloat(rate),
        date: date,
      };

      await api.post("/api/milk", entry);

      alert("✅ Entry added successfully!");
      setLitres(0);
      loadEntries();
    } catch (err) {
      console.error("Error saving entry:", err);
      alert("❌ Failed to save entry!");
    }
  };

  // Delete entry
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await api.delete(`/api/milk/${id}`);
      alert("🗑 Entry deleted successfully!");
      loadEntries();
    } catch (err) {
      console.error("Error deleting entry:", err);
      alert("❌ Failed to delete entry!");
    }
  };

  // Popover logic
  const handleOpenPopover = (event) => setAnchorEl(event.currentTarget);
  const handleClosePopover = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  const handleAddLitre = (value) => {
    setLitres((prev) => parseFloat((parseFloat(prev) + value).toFixed(2)));
  };

  const litreOptions = [0.25, 0.5, 0.75, 1, 2];

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
      <Card style={{ padding: "25px", width: "850px", borderRadius: "16px" }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate("/dashboard")}
          style={{ marginBottom: "20px" }}
        >
          ← Back to Dashboard
        </Button>

        <Typography
          variant="h5"
          style={{
            marginBottom: "20px",
            color: "#27ae60",
            fontWeight: "bold",
          }}
        >
          🥛 Day Wise Entry ({shift})
        </Typography>

        <TextField
          label="Select Date"
          type="date"
          fullWidth
          margin="normal"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <form onSubmit={handleSubmit}>
          <TextField
            select
            label="Customer"
            fullWidth
            margin="normal"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            {customers.length === 0 ? (
              <MenuItem disabled>No customers found</MenuItem>
            ) : (
              customers.map((cust) => (
                <MenuItem key={cust.id} value={cust.fullName}>
                  {cust.fullName || cust.nickname}
                </MenuItem>
              ))
            )}
          </TextField>

          <TextField
            label="Litres"
            value={litres}
            fullWidth
            margin="normal"
            onClick={handleOpenPopover}
            InputProps={{ readOnly: true }}
            helperText="Click to add litres"
          />

          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClosePopover}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 1,
                p: 1,
                bgcolor: "#f9f9f9",
                borderRadius: 2,
              }}
            >
              {litreOptions.map((value) => (
                <Button
                  key={value}
                  variant="contained"
                  size="small"
                  onClick={() => handleAddLitre(value)}
                  sx={{
                    bgcolor: "#4caf50",
                    "&:hover": { bgcolor: "#43a047" },
                  }}
                >
                  +{value}L
                </Button>
              ))}
              <Button
                variant="outlined"
                size="small"
                color="error"
                onClick={() => setLitres(0)}
              >
                Reset
              </Button>
            </Box>
          </Popover>

          <TextField
            label="Rate"
            type="number"
            fullWidth
            margin="normal"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{
              marginTop: "20px",
              background: "linear-gradient(135deg, #6ee7b7, #3b82f6)",
              color: "white",
              fontWeight: "bold",
            }}
          >
            ➕ Add Entry
          </Button>
        </form>

        <Typography variant="h6" style={{ marginTop: "30px" }}>
          Recent Entries ({shift})
        </Typography>

        <TableContainer component={Paper} style={{ marginTop: "10px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell><strong>Litres</strong></TableCell>
                <TableCell><strong>Rate</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell align="center"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No entries yet
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.date}</TableCell>
                    <TableCell>{e.customerName}</TableCell>
                    <TableCell>{e.litres}</TableCell>
                    <TableCell>{e.rate}</TableCell>
                    <TableCell>₹{(e.litres * e.rate).toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(e.id)}
                      >
                        🗑 Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </div>
  );
}

export default DayWiseEntry;
