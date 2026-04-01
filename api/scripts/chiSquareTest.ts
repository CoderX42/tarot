import crypto from 'crypto';

const CARD_COUNT = 22;
const TRIALS = 100000;

function drawOneCard() {
  const randomIndex = crypto.randomInt(0, CARD_COUNT);
  const isReversed = crypto.randomInt(0, 2) === 1;
  return { index: randomIndex, isReversed };
}

function runTest() {
  console.log(`Running Chi-Square Test for Randomness (${TRIALS} trials)...`);
  
  const counts = new Array(CARD_COUNT).fill(0);
  let reversedCount = 0;

  for (let i = 0; i < TRIALS; i++) {
    const { index, isReversed } = drawOneCard();
    counts[index]++;
    if (isReversed) reversedCount++;
  }

  const expectedCount = TRIALS / CARD_COUNT;
  
  let chiSquareStat = 0;
  for (let i = 0; i < CARD_COUNT; i++) {
    const diff = counts[i] - expectedCount;
    chiSquareStat += (diff * diff) / expectedCount;
  }

  // Degrees of freedom for card selection = 22 - 1 = 21
  // Critical value for alpha = 0.05, df = 21 is ~32.671
  const isUniform = chiSquareStat < 32.671;

  console.log('--- Results ---');
  console.log(`Chi-Square Statistic: ${chiSquareStat.toFixed(4)}`);
  console.log(`Degrees of Freedom: ${CARD_COUNT - 1}`);
  console.log(`Is Uniformly Distributed (alpha=0.05): ${isUniform ? 'YES ✅' : 'NO ❌'}`);
  console.log(`Reversed Ratio: ${(reversedCount / TRIALS * 100).toFixed(2)}% (Expected: 50%)`);
  
  if (isUniform && Math.abs(reversedCount / TRIALS - 0.5) < 0.01) {
    console.log('\n🎉 Randomness Test Passed! The crypto algorithm provides high-quality randomness for drawing cards.');
  } else {
    console.log('\n⚠️ Randomness Test Failed!');
  }
}

runTest();