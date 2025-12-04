import React, { useState } from "react";
import { TextField, Button, Card, Typography } from "@mui/material";
import api from "../api/axios";
import { Link } from "react-router-dom";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });
      setMessage(res.data);
    } catch (err) {
      setMessage("Error during registration. Try again.");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #a8edea, #fed6e3)",
      }}
    >
      <Card style={{ padding: "30px", width: "350px", textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          📝 Register
        </Typography>

        <form onSubmit={handleRegister}>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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

          <Button
            type="submit"
            variant="contained"
            color="secondary"
            fullWidth
            style={{ marginTop: "20px" }}
          >
            Register
          </Button>
        </form>

        <Typography color="primary" style={{ marginTop: "15px" }}>
          {message}
        </Typography>

        <Typography variant="body2" style={{ marginTop: "10px" }}>
          Already have an account? <Link to="/">Login</Link>
        </Typography>
      </Card>
    </div>
  );
}

export default RegisterPage;
