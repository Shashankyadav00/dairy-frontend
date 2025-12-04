// src/pages/PaymentSummary.js
import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Switch,
  Box,
  TextField,
} from "@mui/material";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function PaymentSummary() {
  const navigate = useNavigate();
  const shift = localStorage.getItem("selectedShift") || "Morning";

  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);

  const [morningTime, setMorningTime] = useState("08:00");
  const [nightTime, setNightTime] = useState("20:00");

  const [enabledMorning, setEnabledMorning] = useState(false);
  const [enabledNight, setEnabledNight] = useState(false);

  const [durationMorning, setDurationMorning] = useState(1);
  const [durationNight, setDurationNight] = useState(1);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCustomers();
    loadPayments();
    loadReminderTimes();
  }, [shift]);

  // Load customers
  const loadCustomers = async () => {
    try {
      const res = await api.get(`/api/customers/${shift}`);
      setCustomers(res.data.customers || res.data || []);
    } catch {
      setCustomers([]);
    }
  };

  // Load payment status
  const loadPayments = async () => {
    try {
      const res = await api.get(`/api/payments/${shift}`);
      if (res.data?.success) setPayments(res.data.payments);
    } catch {
      setPayments([]);
    }
  };

  // Load reminder settings
  const loadReminderTimes = async () => {
    try {
      const res = await api.get("/api/payments/reminder-times");
      if (res.data.success) {
        setMorningTime(res.data.morning);
        setNightTime(res.data.night);
        setEnabledMorning(res.data.enabledMorning);
        setEnabledNight(res.data.enabledNight);
      }
    } catch {}
  };

  const getPaymentRow = (name) => payments.find((p) => p.customerName === name);

  const handlePaymentToggle = async (name) => {
    const row = getPaymentRow(name);
    const current = row ? row.paid : false;

    // Update UI immediately
    setPayments((prev) =>
      prev.map((p) => (p.customerName === name ? { ...p, paid: !current } : p))
    );

    // Save to backend
    await api.post("/api/payments", {
      customerName: name,
      shift,
      paid: !current,
    });
  };

  // Save email reminder settings
  const saveReminder = async (shiftName, enabled, time, days) => {
    setSaving(true);
    try {
      await api.post("/api/payments/save-reminder", {
        shift: shiftName,
        enabled,
        time,
        durationDays: days,
      });

      alert(`Saved ${shiftName} reminder (${enabled ? "Enabled" : "Disabled"})`);
    } catch {
      alert("Failed to save reminder");
    }
    setSaving(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", padding: 30 }}>
      <Card style={{ width: 900, padding: 24 }}>
        <Button variant="outlined" color="secondary" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </Button>

        <Typography variant="h5" sx={{ mt: 2 }}>
          💰 Payment Summary ({shift})
        </Typography>

        {/* REMINDER SECTION */}
        <Box mt={2} mb={3} p={2} sx={{ background: "#f1f5f9", borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            ⏰ Email Reminder Settings
          </Typography>

          {/* Morning reminder */}
          {shift === "Morning" && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>🌅 Morning Shift</Typography>
                <Switch checked={enabledMorning} onChange={(e) => setEnabledMorning(e.target.checked)} />
              </Box>

              {enabledMorning && (
                <Box mt={1} display="flex" gap={2} alignItems="center">
                  <TextField
                    type="time"
                    size="small"
                    label="Reminder Time"
                    value={morningTime}
                    onChange={(e) => setMorningTime(e.target.value)}
                  />

                  <TextField
                    type="number"
                    size="small"
                    label="Days Active"
                    value={durationMorning}
                    onChange={(e) => setDurationMorning(Number(e.target.value))}
                  />

                  <Button
                    variant="contained"
                    color="success"
                    disabled={saving}
                    onClick={() =>
                      saveReminder("Morning", enabledMorning, morningTime, durationMorning)
                    }
                  >
                    {saving ? "Saving..." : "Save Morning"}
                  </Button>
                </Box>
              )}
            </>
          )}

          {/* Night reminder */}
          {shift === "Night" && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>🌙 Night Shift</Typography>
                <Switch checked={enabledNight} onChange={(e) => setEnabledNight(e.target.checked)} />
              </Box>

              {enabledNight && (
                <Box mt={1} display="flex" gap={2} alignItems="center">
                  <TextField
                    type="time"
                    size="small"
                    label="Reminder Time"
                    value={nightTime}
                    onChange={(e) => setNightTime(e.target.value)}
                  />

                  <TextField
                    type="number"
                    size="small"
                    label="Days Active"
                    value={durationNight}
                    onChange={(e) => setDurationNight(Number(e.target.value))}
                  />

                  <Button
                    variant="contained"
                    color="success"
                    disabled={saving}
                    onClick={() =>
                      saveReminder("Night", enabledNight, nightTime, durationNight)
                    }
                  >
                    {saving ? "Saving..." : "Save Night"}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>

        {/* PAYMENT TABLE */}
        <Paper>
          <Table>
            <TableHead>
              <TableRow style={{ background: "#e3f2fd" }}>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell align="center"><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {customers.map((c) => {
                const name = c.fullName || c.nickname;
                const row = getPaymentRow(name);
                const paid = row ? row.paid : false;

                return (
                  <TableRow key={c.id}>
                    <TableCell>{name}</TableCell>

                    <TableCell align="center">
                      {paid ? (
                        <span style={{ color: "green", fontWeight: "700" }}>Paid</span>
                      ) : (
                        <span style={{ color: "red", fontWeight: "700" }}>Unpaid</span>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Switch checked={paid} onChange={() => handlePaymentToggle(name)} color="success" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      </Card>
    </div>
  );
}

export default PaymentSummary;
