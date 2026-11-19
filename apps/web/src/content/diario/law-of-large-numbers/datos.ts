// Content of this sub-article's optional <Dato /> panels. Each line accepts inline HTML.
// Dates and figures from well-known history of probability (Bernoulli, Ars Conjectandi; Poisson,
// Recherches sur la probabilité des jugements; the experiments of Buffon, Pearson and Kerrich).

export const historia = [
  `<strong>16th century.</strong> Gerolamo Cardano, a physician and gambler, notes in his book on games of chance that with many throws the results get close to what you'd expect. He senses it, but doesn't prove it.`,
  `<strong>1713.</strong> Jacob Bernoulli's <em>Ars Conjectandi</em> is published, eight years after his death. It has the first proof: he called it his "golden theorem" and spent about twenty years on it.`,
  `<strong>1837.</strong> Siméon Denis Poisson gives it the name we use today: <em>loi des grands nombres</em>, "the law of large numbers".`,
  `<strong>1867.</strong> Pafnuty Chebyshev proves it in a few lines and for many more cases, with the inequality that bears his name.`,
  `<strong>1909.</strong> Émile Borel proves the "strong" version for the coin: almost surely, the share ends up at 1/2. Andrey Kolmogorov generalizes it in the 1930s.`,
];

export const curiosos = [
  `In the 18th century, the Comte de Buffon flipped a coin <strong>4,040</strong> times: 2,048 heads, 50.7%.`,
  `Karl Pearson, in the early 20th century, flipped it <strong>24,000</strong> times: 12,012 heads, 50.05%.`,
  `John Kerrich, held prisoner in Denmark during World War II, flipped it <strong>10,000</strong> times: 5,067 heads. Notice: 67 "extra" heads, but only 0.67 points in proportion.`,
  `At the Monte Carlo casino, on August 18, 1913, black came up <strong>26 times in a row</strong> at roulette. Many bet on red thinking it was "due" and lost fortunes: that's the gambler's fallacy, exactly what the law does <em>not</em> say.`,
];

export const usos = [
  `<strong>Insurance.</strong> Nobody knows who will crash their car this year, but with thousands of policyholders the total number of crashes is almost predictable. That's what an insurer lives on.`,
  `<strong>Casinos.</strong> In European roulette the house wins on average 2.7% of every bet (1 of 37 pockets is the zero). On any given night it can lose; over millions of bets, almost never.`,
  `<strong>Polls.</strong> With 1,000 people chosen at random, the margin of error is about ±3 points. To cut it in half you need to ask <strong>four</strong> times as many people: the square root again.`,
  `<strong>The Monte Carlo method.</strong> To estimate π, throw random points into a square and count how many land inside the circle. The error shrinks like 1/√n: the same idea is used in finance, physics and to compute the light in a 3D scene.`,
];
