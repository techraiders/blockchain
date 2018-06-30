const Blockchain = require('./blockchain');
const bitcoin = new Blockchain();

bitcoin.createNewBlock(2389, 'hsd76hjds98', 'hd786kjh84');
bitcoin.createNewBlock(111, 'hsd76hdskjh8', 'hdjfdhjh84');
bitcoin.createNewBlock(2389, 'hsdds98', 'hd7sdjh84');

console.log(bitcoin);