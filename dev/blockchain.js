"use strict";

const sha256 = require("sha256");
const currentNodeUrl = process.argv[3];

function Blockchain() {
  this.chain = [];
  this.pendingTransactions = [];
  this.currentNodeUrl = currentNodeUrl;
  this.networkNodes = [];

  // Since we don't have value of previousBlockHash, and hash for genesis block, we pass some arbitary parameters.
  this.createNewBlock(100, "0", "0");
}

/**
 * nonce: A number that comes from proof of work
 * previousBlockHash:
 * hash: All the transactions will be compressed into a single string that string will be hash.
 */
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
  const newBlock = {
    index: this.chain.length + 1,
    timestamp: Date.now(),
    transations: this.pendingTransactions,
    nonce,
    hash,
    previousBlockHash
  };
  this.pendingTransactions = [];
  this.chain.push(newBlock);
  return newBlock;
};

Blockchain.prototype.getLastBlock = function() {
  if (this.chain.length) return this.chain[this.chain.length - 1];
};

Blockchain.prototype.createNewTransaction = function(
  amount,
  sender,
  recipient
) {
  const newTransaction = {
    amount,
    sender,
    recipient
  };
  this.pendingTransactions.push(newTransaction);
  return this.getLastBlock()["index"] + 1;
};

Blockchain.prototype.hashBlock = function(
  previousBlockHash,
  currentBlockData,
  nonce
) {
  const dataAsString =
    previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);

  const hash = sha256(dataAsString);
  return hash;
};

/** PROOF OF Work: We don't want any invalid block created and added to the chain, we want to make sure every block that is added to the chain is legitimate, and has the correct transaction and correct data inside of it.
 *
 * Because if it doesn't have the correct transaction and the correct data, then people could fake how much bitcoin they have, and can cause fraud, and steal money from other people.
 *
 * So, everytime we create a new block, we first have to make sure, that is is a legitimate block by mining it through proof of work.
 */

Blockchain.prototype.proofOfWork = function(
  previousBlockHash,
  currentBlockData
) {
  let nonce = 0;
  let hash = this.hashBlock(this.previousBlockHash, currentBlockData, nonce);

  while (hash.substr(0, 4) !== "0000") {
    hash = this.hashBlock(previousBlockHash, currentBlockData, ++nonce);
  }
  return nonce;
};

module.exports = Blockchain;

/** Features of this BlockChain:
 * Proof of work
 * Mine new blocks
 * Create transactions
 * Validate the chain
 * Retrieve address data
 */
