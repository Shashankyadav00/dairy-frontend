import React, { useState } from "react";
import api from "../api/axios";
import {
  TextField,
  Button,
  Card,
  Typography,
  Box,
  Fade,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  // ----------------------------
  // SEND OTP
  // ----------------------------
  const sendOtp = async () => {
    try {
      const res = await api.post("/api/auth/forgot", { email });

      if (res.data.success) {
        setStep(2);
      }
      alert(res.data.message || res.data.error);
    } catch (err) {
      alert("Error sending OTP");
    }
  };

  // ----------------------------
  // RESET PASSWORD
  // ----------------------------
  const resetPassword = async () => {
    try {
      const res = await api.post("/api/auth/reset", {
        email,
        otp,
        newPassword,
      });

      // show message from server
      alert(res.data.message || res.data.error);

      // if server confirms success, navigate to login
      if (res.data && res.data.success) {
        // clear fields
        setEmail("");
        setOtp("");
        setNewPassword("");
        setStep(1);
        // navigate to login page
        navigate("/");
      }
    } catch (err) {
      alert("Invalid OTP or server error");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #6a11cb, #2575fc)",
        padding: 2,
      }}
    >
      <Fade in={true} timeout={800}>
        <Card
          sx={{
            width: "100%",
            maxWidth: 420,
            padding: 4,
            textAlign: "center",
            borderRadius: 4,
            backdropFilter: "blur(16px)",
            background: "rgba(255,255,255,0.15)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            color: "white",
          }}
        >
          <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
            🔐 Forgot Password
          </Typography>
          <Typography sx={{ opacity: 0.9, mb: 3 }}>
            Enter your registered email to receive a verification OTP.
          </Typography>

          {/* STEP 1 — ENTER EMAIL */}
          {step === 1 && (
            <Fade in={step === 1} timeout={500}>
              <Box>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  variant="outlined"
                  sx={{
                    mb: 2,
                    background: "white",
                    borderRadius: 1,
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    background: "#ffdd00",
                    color: "#000",
                    fontWeight: 700,
                    "&:hover": { background: "#f1c40f" },
                  }}
                  onClick={sendOtp}
                >
                  Send OTP
                </Button>
              </Box>
            </Fade>
          )}

          {/* STEP 2 — ENTER OTP + NEW PASSWORD */}
          {step === 2 && (
            <Fade in={step === 2} timeout={500}>
              <Box>
                <TextField
                  label="Enter OTP"
                  fullWidth
                  variant="outlined"
                  sx={{
                    mb: 2,
                    background: "white",
                    borderRadius: 1,
                  }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <TextField
                  label="New Password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  sx={{
                    mb: 2,
                    background: "white",
                    borderRadius: 1,
                  }}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    background: "#00e676",
                    color: "#000",
                    fontWeight: 700,
                    "&:hover": { background: "#00c853" },
                  }}
                  onClick={resetPassword}
                >
                  Reset Password
                </Button>

                <Button
                  fullWidth
                  sx={{
                    mt: 1,
                    color: "white",
                    opacity: 0.8,
                    "&:hover": { opacity: 1 },
                  }}
                  onClick={() => setStep(1)}
                >
                  ← Back
                </Button>
              </Box>
            </Fade>
          )}
        </Card>
      </Fade>
    </Box>
  );
}

export default ForgotPassword;
