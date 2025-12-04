// src/pages/PdfDownload.js
import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  Typography,
  Button,
  Select,
  MenuItem,
  Box,
  Paper,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function PdfDownload() {
  const navigate = useNavigate();
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [shift, setShift] = useState(
    localStorage.getItem("selectedShift") || "Morning"
  );
  const [data, setData] = useState(null);
  const printableRef = useRef();

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  useEffect(() => {
    loadOverviewData();
  }, [month, year, shift]);

  const loadOverviewData = async () => {
    try {
      const res = await api.get("/api/overview", {
        params: { shift, month, year },
      });
      setData(res.data);
    } catch (err) {
      console.error("Error loading overview:", err);
    }
  };

  const currency = (n) =>
    n?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // --------------------------------------------------------
  // DOWNLOAD SCROLLABLE HTML ONLY
  // --------------------------------------------------------
  const downloadScrollableHtml = () => {
    if (!data) return;

    const {
      daysInMonth,
      customers,
      matrix,
      totalLitresPerCustomer,
      totalAmountPerCustomer
    } = data;

    const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const css = `
      body { font-family: Arial; margin: 16px; background: #fff; }
      .table-wrapper { overflow: auto; border: 1px solid #ccc; max-height: 85vh; }
      table { border-collapse: collapse; width: max-content; font-size: 13px; }
      th, td { border: 1px solid #ccc; padding: 6px 10px; white-space: nowrap; text-align: center; }
      thead th { position: sticky; top: 0; background: #e8f5e9; z-index: 10; }
      .name { position: sticky; left: 0; background: #fafafa; font-weight: 600; z-index: 11; }
    `;

    const title = `Overview — ${shift} | ${months[month - 1]} ${year}`;

    const htmlRows = customers
      .map((c) => {
        return `
        <tr>
          <td class="name">${c.name || c.fullName || c.nickname}</td>
          ${dayNumbers
            .map((d) => {
              const cell = matrix[d]?.[c.id] || {};
              const litres = Number(cell.litres || 0);
              return `<td>${litres ? litres.toFixed(2) + " L" : "-"}</td>`;
            })
            .join("")}
          <td><b>${(totalLitresPerCustomer[c.id] || 0).toFixed(2)}</b></td>
          <td><b>₹${currency(totalAmountPerCustomer[c.id] || 0)}</b></td>
        </tr>
      `;
      })
      .join("");

    const finalHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>${css}</style>
      </head>
      <body>
        <h2>${title}</h2>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th class="name">Customer</th>
                ${dayNumbers.map((d) => `<th>${d}</th>`).join("")}
                <th>Total Litres</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>${htmlRows}</tbody>
          </table>
        </div>
        <p style="margin-top:10px;font-size:12px;">
          Generated on: ${new Date().toLocaleString()}
        </p>
      </body>
      </html>
    `;

    const blob = new Blob([finalHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Overview_${shift}_${year}_${String(month).padStart(2, "0")}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // UI -------------------------------
  if (!data) {
    return (
      <div style={{ padding: 30, textAlign: "center" }}>
        <Typography variant="h6">Loading...</Typography>
      </div>
    );
  }

  const { daysInMonth, customers, matrix, totalLitresPerCustomer, totalAmountPerCustomer } = data;
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
      <Card style={{ width: "95%", maxWidth: 1300, padding: 24 }}>
        <Typography variant="h5">📄 HTML Download — Overview</Typography>

        {/* FILTERS */}
        <Box display="flex" gap={2} my={2} alignItems="center">
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
            <Select value={month} label="Month" onChange={(e) => setMonth(e.target.value)}>
              {months.map((m, i) => (
                <MenuItem key={i} value={i + 1}>
                  {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Year</InputLabel>
            <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
              {Array.from({ length: 6 }).map((_, i) => {
                const y = today.getFullYear() - 2 + i;
                return (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={loadOverviewData}>
            VIEW
          </Button>

          <Box flexGrow={1} />

          <Button variant="outlined" color="secondary" onClick={downloadScrollableHtml}>
            DOWNLOAD SCROLLABLE HTML
          </Button>

          <Button variant="text" onClick={() => navigate("/dashboard")}>
            ← BACK
          </Button>
        </Box>

        {/* TABLE */}
        <Paper style={{ padding: 12 }}>
          <div ref={printableRef}>
            <Typography variant="subtitle1" style={{ marginBottom: 12 }}>
              Overview — {shift} | {months[month - 1]} {year}
            </Typography>

            <div
              style={{
                overflowX: "auto",
                border: "1px solid #ccc",
                borderRadius: 6,
                paddingBottom: 12,
              }}
            >
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "max-content",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        minWidth: 180,
                        textAlign: "left",
                        background: "#e8f5e9",
                        position: "sticky",
                        left: 0,
                        zIndex: 10,
                      }}
                    >
                      Customer
                    </th>

                    {dayNumbers.map((d) => (
                      <th key={d} style={{ background: "#e8f5e9", minWidth: 50 }}>
                        {d}
                      </th>
                    ))}

                    <th style={{ background: "#e8f5e9" }}>Total Litres</th>
                    <th style={{ background: "#e8f5e9" }}>Total Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td
                        style={{
                          background: "#fafafa",
                          textAlign: "left",
                          fontWeight: 600,
                          position: "sticky",
                          left: 0,
                          zIndex: 9,
                          borderRight: "1px solid #bbb",
                        }}
                      >
                        {c.name || c.fullName || c.nickname}
                      </td>

                      {dayNumbers.map((d) => {
                        const cell = matrix[d]?.[c.id] || {};
                        const litres = Number(cell.litres || 0);
                        return (
                          <td key={d} style={{ textAlign: "center" }}>
                            {litres ? `${litres.toFixed(2)} L` : "-"}
                          </td>
                        );
                      })}

                      <td>
                        <b>{(totalLitresPerCustomer[c.id] || 0).toFixed(2)}</b>
                      </td>
                      <td>
                        <b>₹{currency(totalAmountPerCustomer[c.id] || 0)}</b>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Typography variant="caption" style={{ marginTop: 8, display: "block" }}>
              Generated on: {new Date().toLocaleString()}
            </Typography>
          </div>
        </Paper>
      </Card>
    </div>
  );
}

export default PdfDownload;
