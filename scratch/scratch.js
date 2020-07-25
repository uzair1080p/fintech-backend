const { QuickScore } = require('quick-score');
const txs = require('./tx_all').transactions;
const fs = require('fs');
// console.log(txs.length)

const processors = [
  {
    name: 'TRANSFIRST',
  }
];


/*const filtered = txs.filter(tx => {
  const qs = new QuickScore(processors, ['name']);
  const results = qs.search('transfirsts');
  if(results.length){
    console.log('results', results)
  }

  const highestScore = results.reduce((acc, item) => {
    // console.log(item)
    return item.score > acc.score ? item : acc;
  }, {score: 0});
  return highestScore.score > 0.5;
});*/

const filtered = processors.map(p => {
  const qs = new QuickScore(txs, ['name']);
  const results = qs.search(p.name);
  // console.log(results)
  return results; //results.filter(res => res.score > 0.65);
});


console.log(filtered[0].length)
fs.writeFileSync('tx_scored.json', JSON.stringify(filtered, null, 2));

