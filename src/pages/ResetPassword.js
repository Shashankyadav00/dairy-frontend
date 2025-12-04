// src/pages/ResetPassword.js
import React, { useState, useEffect } from "react";
import { Card, TextField, Button, Typography } from "@mui/material";
import api from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
  const query = useQuery();
  const navigate = useNavigate();
  const emailFromQuery = query.get("email") || "";

  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [emailFromQuery]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (password.length < 6) {
      setMsg("Password should be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setMsg("Passwords do not match.");
      return;
    }
    if (!otp || otp.length < 4) {
      setMsg("Enter the OTP you received.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/reset", {
        email,
        otp,
        newPassword: password,
      });

      if (res.data && res.data.success) {
        alert("Password reset successful. Please login.");
        navigate("/");
      } else {
        setMsg(res.data?.error || "Reset failed");
      }
    } catch (err) {
      console.error(err);
      setMsg("Network or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #81ecec, #74b9ff)",
      }}
    >
      <Card style={{ width: 420, padding: 24 }}>
        <Typography variant="h6" gutterBottom>
          Reset Password
        </Typography>

        <form onSubmit={submit}>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            label="OTP"
            fullWidth
            margin="normal"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            style={{ marginTop: 12 }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        {msg && (
          <Typography color="error" style={{ marginTop: 12 }}>
            {msg}
          </Typography>
        )}
      </Card>
    </div>
  );
}
