/**
 * Calculates Jaccard similarity score (0 to 1) based on word token overlap.
 */
function calculateTextSimilarity(text1 = '', text2 = '') {
  const tokenize = (str) =>
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const words1 = new Set(tokenize(text1));
  const words2 = new Set(tokenize(text2));

  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  words1.forEach((word) => {
    if (words2.has(word)) intersection++;
  });

  const union = new Set([...words1, ...words2]).size;
  return intersection / union;
}

module.exports = {
  calculateTextSimilarity,
};
