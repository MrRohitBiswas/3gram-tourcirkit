const fs = require('fs');
const csv = require('csv-parser');
const natural = require('natural');
let flag =0;
const reviews = [];
fs.createReadStream('reviews.csv')
  .pipe(csv())
  .on('data', (row) => {
    reviews.push(row);
  })
  .on('end', () => {
    const tokenizer = new natural.WordTokenizer();
    function tokenize(text) {
      return tokenizer.tokenize(text.toLowerCase().replace(/[^\w\s]/g, ''));
    }

    function generate3Grams(tokens) {
      const grams = [];
      for (let i = 0; i < tokens.length - 2; i++) {
        grams.push(tokens.slice(i, i + 3));
      }
      return grams;
    }

    // OUR SEARCH TOKENS
    const keywords = ['Kolkata', 'Cheap', 'hill']; 
    const placeCounts = {};
    reviews.forEach((review) => {
      const tokens = tokenize(review.Review);
      const grams = generate3Grams(tokens);
      grams.forEach((gram) => {
        if (keywords.some((kw) => gram.includes(kw))) {
          const place = review.Place;
          placeCounts[place] = (placeCounts[place] || 0) + 1;
        }
      });
    });
    
    const totalCounts = Object.values(placeCounts).reduce((acc, count) => acc + count, 0);
    const placeProbs = {};
    Object.entries(placeCounts).forEach(([place, count]) => {
      placeProbs[place] = count / totalCounts;
    });
    // if(flag<10){
    //   console.log(placeCounts);
    //   flag++
    // }
    const sortedPlaces = Object.keys(placeProbs).sort((a, b) => placeProbs[b] - placeProbs[a]);
    
    console.log(sortedPlaces);
  });
