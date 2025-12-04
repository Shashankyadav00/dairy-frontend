import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { TextField, Button, Card, Typography } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Auto redirect if already logged in
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      navigate("/dashboard");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/login", { email, password });

      if (res.data.success === true) {
        // Save userId so customers load only for this user
        localStorage.setItem("userId", res.data.userId);
        localStorage.setItem("email", email);

        alert("Login successful!");
        navigate("/dashboard");
      } else {
        setMessage(res.data.message);
      }
    } catch (error) {
      console.error("Login failed:", error);
      setMessage("Something went wrong. Try again!");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #81ecec, #74b9ff)",
      }}
    >
      <Card style={{ padding: "30px", width: "350px", textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          🥛 Milk Attendance Login
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Typography
            variant="body2"
            style={{
              marginTop: "5px",
              textAlign: "right",
              cursor: "pointer",
              color: "#0984e3",
              fontWeight: "500",
            }}
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </Typography>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginTop: "20px" }}
          >
            Login
          </Button>
        </form>

        <Typography color="error" style={{ marginTop: "15px" }}>
          {message}
        </Typography>

        <Typography variant="body2" style={{ marginTop: "10px" }}>
          Don’t have an account? <Link to="/register">Register</Link>
        </Typography>
      </Card>
    </div>
  );
}

export default LoginPage;
