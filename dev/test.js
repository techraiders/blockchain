const Blockchain = require("./blockchain");
const bitcoin = new Blockchain();

const previousBlockHash = `SDLFKJHXJV68764KJHKSDJFH7W46`;
const currentBlockData = [
  {
    amount: 10,
    sender: `NAVIlkfjl`,
    recipient: `GARG8435987JHFDKJ`
  },
  {
    amount: 20,
    sender: `RAHULlkfjl`,
    recipient: `VIKASH8435987JHFDKJ`
  }
];

console.log(bitcoin.proofOfWork(previousBlockHash, currentBlockData));
console.log(bitcoin.hashBlock(previousBlockHash, currentBlockData, 252685));
