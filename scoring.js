export function calculateScore(patterns) {
  const weights = {
    cycle_length_3: 40,
    cycle_length_4: 50,
    cycle_length_5: 60,
    high_velocity: 30
  };

  let score = 0;
  patterns.forEach(p => {
    score += weights[p] || 20;
  });

  return Math.min(100, score);
}
