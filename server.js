const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

/*
Transaction Format:
{
  sender: "A",
  receiver: "B",
  amount: 1000,
  timestamp: "2026-02-19T10:00:00"
}
*/

function analyzeTransactions(transactions) {
    let graph = {};
    let suspiciousAccounts = new Set();
    let patterns = [];

    // Build Graph
    transactions.forEach(tx => {
        if (!graph[tx.sender]) graph[tx.sender] = [];
        graph[tx.sender].push(tx.receiver);
    });

    // Detect Fan-out (one sender to many receivers)
    for (let sender in graph) {
        if (graph[sender].length >= 3) {
            suspiciousAccounts.add(sender);
            patterns.push({
                type: "Fan-Out",
                account: sender
            });
        }
    }

    // Detect Simple Cycles
    transactions.forEach(tx => {
        let reverse = transactions.find(
            t => t.sender === tx.receiver && t.receiver === tx.sender
        );
        if (reverse) {
            suspiciousAccounts.add(tx.sender);
            suspiciousAccounts.add(tx.receiver);
            patterns.push({
                type: "Cycle",
                accounts: [tx.sender, tx.receiver]
            });
        }
    });

    return {
        suspiciousAccounts: Array.from(suspiciousAccounts),
        detectedPatterns: patterns
    };
}

app.post("/analyze", (req, res) => {
    try {
        const { transactions } = req.body;

        if (!transactions || !Array.isArray(transactions)) {
            return res.status(400).json({ error: "Invalid data format" });
        }

        const result = analyzeTransactions(transactions);
        res.json(result);

    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/", (req, res) => {
    res.send("Money Muling Detection Backend Running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
