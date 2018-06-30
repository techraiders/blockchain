const Blockchain = require('./blockchain');
const bitcoin = new Blockchain();

bitcoin.createNewBlock(2389, 'hsd76hjds98', 'hd786kjh84');
bitcoin.createNewTransaction(111, 'hsd76hdskjh8', 'hdjfdhjh84');

console.log(bitcoin);