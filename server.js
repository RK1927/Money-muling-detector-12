import express from "express";
import multer from "multer";
import fs from "fs";
import csv from "csv-parser";
import { analyzeGraph } from "./utils/graphAnalyzer.js";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(express.static("public"));

app.post("/upload", upload.single("file"), async (req, res) => {
  const startTime = Date.now();
  const transactions = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      transactions.push({
        transaction_id: row.transaction_id,
        sender_id: row.sender_id,
        receiver_id: row.receiver_id,
        amount: parseFloat(row.amount),
        timestamp: new Date(row.timestamp)
      });
    })
    .on("end", async () => {
      const result = analyzeGraph(transactions);
      const processingTime = (Date.now() - startTime) / 1000;

      result.summary.processing_time_seconds = Number(processingTime.toFixed(2));

      fs.unlinkSync(req.file.path);
      res.json(result);
    });
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
