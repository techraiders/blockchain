const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  BlockChain = require("./blockchain"),
  uuid = require("uuid/v1");

const port = process.argv[2];

const nodeAddress = uuid()
  .split("-")
  .join("");

const bitcoin = new BlockChain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/blockchain", (req, res) => {
  res.send(bitcoin);
});

app.post("/transaction", (req, res) => {
  const { amount, sender, recipient } = req.body;

  const blockIndex = bitcoin.createNewTransaction(amount, sender, recipient);

  res.send({ note: `Transaction will be added in block ${blockIndex}.` });
});

/** mines i.e creates a new block */
app.get("/mine", (req, res) => {
  const lastBlock = bitcoin.getLastBlock();
  const previousBlockHash = lastBlock.hash;
  const currentBlockData = {
    transactions: bitcoin.pendingTransactions,
    index: lastBlock.index + 1
  };

  const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);

  const blockHash = bitcoin.hashBlock(
    previousBlockHash,
    currentBlockData,
    nonce
  );

  bitcoin.createNewTransaction(12.5, "00", nodeAddress);

  const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

  res.send({ note: "New block mined successfully", block: newBlock });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
