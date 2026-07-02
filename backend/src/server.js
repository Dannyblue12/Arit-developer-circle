require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "savi-api", time: new Date().toISOString() })
);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/spending", require("./routes/spending"));
app.use("/api/goals", require("./routes/goals"));
app.use("/api/prices", require("./routes/prices"));
app.use("/api/watch", require("./routes/watch"));

// 404 + error handling
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 4000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`✓ Savi API running on :${PORT}`));
});
