import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Button, MenuItem, Select, Grid } from "@mui/material";

function Dashboard() {
  const navigate = useNavigate();

  const [shift, setShift] = useState(localStorage.getItem("selectedShift") || "Morning");

  useEffect(() => {
    localStorage.setItem("selectedShift", shift);
  }, [shift]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("selectedShift");
    navigate("/");
  };

  const cards = [
    { id: 1, title: "Add Customer", color: "#6c5ce7", path: "/dashboard/add-customer" },
    { id: 2, title: "Day Wise Entry", color: "#00b894", path: "/dashboard/day-wise" },
    { id: 3, title: "Overview", color: "#fdcb6e", path: "/dashboard/overview" },
    { id: 4, title: "💰 Payment Summary", color: "#0984e3", path: "/dashboard/payments" },
    { id: 5, title: "PDF Download", color: "#e84393", path: "/dashboard/pdf" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          background: "white",
          borderRadius: "20px",
          padding: "20px 30px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <Typography variant="h5" style={{ color: "#27ae60", fontWeight: "bold" }}>
            🥛 Milk Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage deliveries efficiently
          </Typography>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Typography variant="body1" style={{ fontWeight: "bold" }}>
            Select Shift
          </Typography>
          <Select
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            size="small"
            style={{ background: "#f7f9fa", borderRadius: "8px", width: "130px" }}
          >
            <MenuItem value="Morning">Morning</MenuItem>
            <MenuItem value="Night">Night</MenuItem>
          </Select>

          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
            style={{ fontWeight: "bold", borderRadius: "10px" }}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Cards Section */}
      <Grid
        container
        spacing={3}
        justifyContent="center"
        style={{ marginTop: "40px", maxWidth: "900px" }}
      >
        {cards.map((card) => (
          <Grid key={card.id} item xs={12} sm={6} md={4}>
            <Card
              onClick={() => navigate(card.path)}
              style={{
                padding: "30px",
                textAlign: "center",
                background: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                borderRadius: "20px",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Typography
                variant="h6"
                style={{
                  color: card.color,
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                {card.title}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default Dashboard;
