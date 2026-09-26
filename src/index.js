require("dotenv").config();
const express = require("express");
const cors = require("cors");

const categoriesRouter = require("./routes/categories");
const businessesRouter = require("./routes/businesses");
const authRouter = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "vycinty-api" });
});

app.use("/categories", categoriesRouter);
app.use("/businesses", businessesRouter);
app.use("/auth", authRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`vycinty-api listening on http://localhost:${PORT}`);
});
