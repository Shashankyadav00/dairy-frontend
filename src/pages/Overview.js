// src/pages/Overview.js
import React, { useState, useEffect } from "react";
import {
  Card,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Table,
  Button,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Box,
  Popover,
  ButtonGroup,
} from "@mui/material";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function Overview() {
  const [shift, setShift] = useState(localStorage.getItem("selectedShift") || "Morning");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const navigate = useNavigate();

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  useEffect(() => {
    loadOverview();
  }, [shift, month, year]);

  const loadOverview = async () => {
    try {
      const res = await api.get("/api/overview", {
        params: { shift, month, year },
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to load overview", err);
      setData(null);
    }
  };

  const currency = (n) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleQuickAction = async (litresValue) => {
    if (!selectedCell) return;
    const { day, customer } = selectedCell;

    const entryDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isReset = litresValue === 0;
    const currentLitres = Number(data?.matrix?.[day]?.[customer.id]?.litres || 0);
    const newLitres = isReset ? 0 : currentLitres + Number(litresValue);

    const entry = {
      customerName: customer.name || customer.fullName || customer.nickname,
      shift,
      litres: newLitres,
      rate: customer.pricePerLitre,
      date: entryDate,
    };

    try {
      await api.post("/api/overview/add", entry);
      await loadOverview();

      if (isReset) {
        setAnchorEl(null);
        setSelectedCell(null);
      }
    } catch (err) {
      alert("Error saving entry");
    }
  };

  const handleCellClick = (event, day, customer) => {
    if (selectedCell && selectedCell.day === day && selectedCell.customer?.id === customer.id) {
      if (anchorEl) {
        setAnchorEl(null);
        setSelectedCell(null);
      } else {
        setAnchorEl(event.currentTarget);
        setSelectedCell({ day, customer });
      }
      return;
    }

    setAnchorEl(event.currentTarget);
    setSelectedCell({ day, customer });
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedCell(null);
  };

  const open = Boolean(anchorEl);

  if (!data) {
    return (
      <div style={{ padding: 30, textAlign: "center" }}>
        <Typography variant="h6">Loading Overview...</Typography>
      </div>
    );
  }

  const days = Number(data.daysInMonth || 0);
  const customers = data.customers || [];
  const matrix = data.matrix || {};
  const totalAmountPerCustomer = data.totalAmountPerCustomer || {};
  const totalLitresPerCustomer = data.totalLitresPerCustomer || {};

  const dayNumbers = Array.from({ length: days }).map((_, i) => i + 1);

  return (
    <div
      style={{
        padding: 20,
        background: "linear-gradient(135deg, #f8fffc, #ecfdf5)",
        minHeight: "100vh",
      }}
    >
      <Card style={{ padding: 20, borderRadius: "20px" }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate("/dashboard")}
          style={{ marginBottom: "20px" }}
        >
          ← Back to Dashboard
        </Button>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" style={{ color: "#2e8b57", fontWeight: "bold" }}>
            🧾 Overview ({shift})
          </Typography>

          <Box display="flex" gap={2}>
            <FormControl size="small">
              <InputLabel>Shift</InputLabel>
              <Select
                value={shift}
                label="Shift"
                onChange={(e) => {
                  setShift(e.target.value);
                  localStorage.setItem("selectedShift", e.target.value);
                }}
              >
                <MenuItem value="Morning">Morning</MenuItem>
                <MenuItem value="Night">Night</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Month</InputLabel>
              <Select value={month} label="Month" onChange={(e) => setMonth(Number(e.target.value))}>
                {months.map((m, i) => (
                  <MenuItem key={i} value={i + 1}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Year</InputLabel>
              <Select value={year} label="Year" onChange={(e) => setYear(Number(e.target.value))}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const y = new Date().getFullYear() - 2 + i;
                  return (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* MAIN TABLE */}
        <Paper style={{ overflowX: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow style={{ backgroundColor: "#e6f7ef" }}>
                <TableCell
                  style={{
                    minWidth: 180,
                    fontWeight: "bold",
                    position: "sticky",
                    left: 0,
                    zIndex: 5,
                    background: "#e6f7ef",
                    borderRight: "1px solid #ccc",
                  }}
                >
                  Customer
                </TableCell>

                {dayNumbers.map((d) => (
                  <TableCell key={d} align="center" style={{ fontWeight: "bold", minWidth: 70 }}>
                    {d}
                  </TableCell>
                ))}

                <TableCell align="center" style={{ fontWeight: "bold", minWidth: 120 }}>
                  Total Litres
                </TableCell>

                <TableCell align="center" style={{ fontWeight: "bold", minWidth: 140 }}>
                  Total Amount
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell
                    style={{
                      whiteSpace: "nowrap",
                      fontWeight: 600,
                      position: "sticky",
                      left: 0,
                      zIndex: 4,
                      background: "#fafafa",
                      borderRight: "1px solid #ccc",
                    }}
                  >
                    {c.name || c.fullName || c.nickname}
                  </TableCell>

                  {dayNumbers.map((day) => {
                    const cell = matrix[day]?.[c.id] || {};
                    const litres = Number(cell.litres || 0);
                    return (
                      <TableCell
                        key={day}
                        align="center"
                        onClick={(e) => handleCellClick(e, day, c)}
                        style={{
                          cursor: "pointer",
                          background: litres ? "#f9fff9" : "#fff",
                        }}
                      >
                        {litres ? `${litres.toFixed(2)} L` : "-"}
                      </TableCell>
                    );
                  })}

                  <TableCell align="center">
                    <strong>{(totalLitresPerCustomer[c.id] || 0).toFixed(2)}</strong>
                  </TableCell>

                  <TableCell align="center">
                    ₹{currency(totalAmountPerCustomer[c.id] || 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Quick Entry Popover */}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Box p={2} textAlign="center">
            <Typography variant="subtitle2" gutterBottom>
              Quick Entry (Litres)
            </Typography>
            <ButtonGroup variant="contained" size="small">
              {[0.25, 0.5, 0.75, 1, 2].map((amt) => (
                <Button key={amt} onClick={() => handleQuickAction(amt)} color="success">
                  +{amt}
                </Button>
              ))}
              <Button onClick={() => handleQuickAction(0)} color="error" variant="outlined">
                Reset
              </Button>
            </ButtonGroup>
          </Box>
        </Popover>
      </Card>
    </div>
  );
}

export default Overview;
