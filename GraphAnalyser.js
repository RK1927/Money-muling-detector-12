import { detectPatterns } from "./patternDetector.js";
import { calculateScore } from "./scoring.js";
import { v4 as uuidv4 } from "uuid";

export function analyzeGraph(transactions) {
  const accounts = new Set();
  const adjacency = {};
  const incoming = {};

  transactions.forEach(tx => {
    accounts.add(tx.sender_id);
    accounts.add(tx.receiver_id);

    if (!adjacency[tx.sender_id]) adjacency[tx.sender_id] = [];
    if (!incoming[tx.receiver_id]) incoming[tx.receiver_id] = [];

    adjacency[tx.sender_id].push(tx);
    incoming[tx.receiver_id].push(tx);
  });

  const patternResults = detectPatterns(transactions, adjacency, incoming);

  const suspiciousAccounts = [];
  const fraudRings = [];

  patternResults.rings.forEach((ring, index) => {
    const ringId = `RING_${String(index + 1).padStart(3, "0")}`;
    const riskScore = calculateScore(ring.patterns);

    fraudRings.push({
      ring_id: ringId,
      member_accounts: ring.members,
      pattern_type: ring.type,
      risk_score: riskScore
    });

    ring.members.forEach(acc => {
      suspiciousAccounts.push({
        account_id: acc,
        suspicion_score: riskScore,
        detected_patterns: ring.patterns,
        ring_id: ringId
      });
    });
  });

  suspiciousAccounts.sort((a, b) => b.suspicion_score - a.suspicion_score);

  return {
    suspicious_accounts: suspiciousAccounts,
    fraud_rings: fraudRings,
    summary: {
      total_accounts_analyzed: accounts.size,
      suspicious_accounts_flagged: suspiciousAccounts.length,
      fraud_rings_detected: fraudRings.length,
      processing_time_seconds: 0
    }
  };
}
