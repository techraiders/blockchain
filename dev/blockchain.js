"use strict";

function Blockchain() {
  this.chain = [];
  this.pendingTransactions = [];
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

module.exports = Blockchain;

/** Features of this BlockChain:
 * Proof of work
 * Mine new blocks
 * Create transactions
 * Validate the chain
 * Retrieve address data
 */
