const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  BlockChain = require("./blockchain"),
  uuid = require("uuid/v1"),
  port = process.argv[2],
  rp = require("request-promise");

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
  const newTransaction = req.body;
  const blockIndex = bitcoin.addTransactionToPendingTransactions(
    newTransaction
  );

  res.send({ note: `Transaction will be added in block ${blockIndex}` });
});

app.post(`/transaction/broadcast`, (req, res) => {
  const {
    body: { amount, sender, recipient }
  } = req;
  const newTransaction = bitcoin.createNewTransaction(
    amount,
    sender,
    recipient
  );

  bitcoin.addTransactionToPendingTransactions(newTransaction);
  const requestPromises = [];

  bitcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: `${networkNodeUrl}/transaction`,
      method: `POST`,
      body: newTransaction,
      json: true
    };

    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises).then(data => {
    res.send({ note: `Transaction created and broadcasted successfully.` });
  });
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

  // bitcoin.createNewTransaction(12.5, "00", nodeAddress);

  const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

  const requestPromises = [];
  bitcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: `${networkNodeUrl}/receive-new-block`,
      method: `POST`,
      body: { newBlock },
      json: true
    };
    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises)
    .then(data => {
      const requestOptions = {
        uri: `${bitcoin.currentNodeUrl}/transaction/broadcast`,
        method: `POST`,
        body: {
          amount: 12.5,
          sender: `00`,
          recipient: nodeAddress
        },
        json: true
      };
      return rp(requestOptions);
    })
    .then(() => {
      res.send({
        note: "New block mined & broadcasted successfully",
        block: newBlock
      });
    });
});

app.post(`/receive-new-block`, (req, res) => {
  const {
    body: { newBlock }
  } = req;
  const lastBlock = bitcoin.getLastBlock();
  const isBlockLegitimate = () => {
    return (
      lastBlock.hash === newBlock.previousBlockHash &&
      lastBlock.index === newBlock.index - 1
    );
  };

  if (isBlockLegitimate()) {
    bitcoin.chain.push(newBlock);
    bitcoin.pendingTransactions = [];
    res.send({ note: `New block received and accepted.`, newBlock });
  } else {
    res.send({ note: `New block rejected`, newBlock });
  }
});

app.post(`/register-and-broadcast-node`, (req, res) => {
  const { newNodeUrl } = req.body;
  if (!bitcoin.networkNodes.includes(newNodeUrl)) {
    bitcoin.networkNodes.push(newNodeUrl);
    const regNodesPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
      const requestOptions = {
        uri: `${networkNodeUrl}/register-node`,
        method: `POST`,
        body: { newNodeUrl },
        json: true
      };
      regNodesPromises.push(rp(requestOptions));
    });

    Promise.all(regNodesPromises)
      .then(data => {
        const buldRegisterOptions = {
          uri: `${newNodeUrl}/register-nodes-bulk`,
          method: `POST`,
          body: {
            allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl]
          },
          json: true
        };

        return rp(buldRegisterOptions);
      })
      .then(data => {
        res.send({ note: `New node registered with network successfully.` });
      });
  } else {
  }
});

// registers a node with the network
app.post(`/register-node`, (req, res) => {
  const {
    body: { newNodeUrl }
  } = req;

  if (
    !bitcoin.networkNodes.includes(newNodeUrl) &&
    bitcoin.currentNodeUrl !== newNodeUrl
  ) {
    bitcoin.networkNodes.push(newNodeUrl);
    res.send({ note: `New node registered successfully with node.` });
  } else {
    res.send({ note: `Node already exists.` });
  }
});

// registers multiple nodes
app.post(`/register-nodes-bulk`, (req, res) => {
  const {
    body: { allNetworkNodes }
  } = req;
  allNetworkNodes.forEach(networkNodeUrl => {
    if (
      !bitcoin.networkNodes.includes(networkNodeUrl) &&
      bitcoin.currentNodeUrl !== networkNodeUrl
    ) {
      bitcoin.networkNodes.push(networkNodeUrl);
    }
  });
  res.send({ note: "Bulk registration successful." });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
