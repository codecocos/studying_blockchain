const express = require('express')
const router = express.Router()
const _ = require('lodash');

const transactionPool = require('../../transactionPool.json')

const { generateNextBlock, generatenextBlockWithTransaction, getAccountBalance, getBlockchain, generateRawNextBlock,
  getMyUnspentTransactionOutputs, getUnspentTxOuts, sendTransaction, getLatestBlock } = require('../public/blockchain')
const { connectToPeers, getSockets, initP2PServer } = require('../public/p2pServer')
const { initWallet, getPublicFromWallet } = require('../public/wallet')
const { getTransactionPool } = require('../public/transactionPool')

// router.post('/qwe', (req, res) => {
//   const aa = _(transactionPool)
//     .map((tx) => (tx.id))
//     .value()
//   const bb = _(transactionPool)
//     .map((tx) => (tx.txIns))
//     .value()
//   const cc = _(transactionPool)
//     .map((tx) => (tx.txOuts))
//     .value()
//   console.log('123//////////////////////////////////////////////////////////////////////////////////////////////////');
//   console.log(transactionPool);
//   console.log('id');
//   console.log(transactionPool[0].id);
//   console.log('txIns');
//   console.log(transactionPool[0].txIns);
//   console.log('txOuts');
//   console.log(transactionPool[0].txOuts);
//   res.send(transactionPool)
//   //res.send({ aa, bb, cc })

// })

router.post('/allBlocks', (req, res) => {
  const allBlocks = getBlockchain()

  const transaction2 = _(allBlocks)
    .map((block) => (
      block.index,
      block.hash,
      block.previousHash,
      block.timestamp,
      block.difficulty,
      block.nonce
    ))
    .value()

  const transaction = _(allBlocks)
    .map((block) => (block.data))
    .flatten()
    .value()

  const txId = _(transaction)
    .map((tx) => (tx.id))
    .flatten()
    .value()

  const txIns = _(transaction)
    .map((tx) => (tx.txIns))
    .flatten()
    .value()

  const txOuts = _(transaction)
    .map((tx) => (tx.txOuts))
    .flatten()
    .value()

  res.send(
    {
      id: txId,
      txIns: txIns,
      txOuts: txOuts
    }
  );
});

router.post('/blocks', (req, res) => {
  const blockchain = getBlockchain()

  res.send({ blockchain: blockchain });
});
router.post('/getLatestBlock', (req, res) => {
  const latestBlock = getLatestBlock()

  res.send({ latestBlock: latestBlock });
});

//??????????????? ???????????? ?????? : ??????????????? ????????????
router.post('/mineBlock', (req, res) => {
  //console.log('??????????????? ???????????????~~~~~~~~~');

  const newBlock = generateNextBlock();

  if (newBlock === null) {
    res.status(400).send('could not generate block');
  } else {
    res.send(newBlock);
  }

});

//??????????????? ?????? ?????? ??????
router.post('/mineRawBlock', (req, res) => {
  console.log(" 1. ???????????? ??????");
  console.log(req.body.data);
  console.log(JSON.parse(req.body.data));
  const minedata = JSON.parse(req.body.data).data

  if (req.body.data == null) {
    res.send('data parameter is missing')
    return;
  }

  const newBlock = generateRawNextBlock(minedata);

  if (newBlock === null) {
    res.status(400).send('could not generate block')
  } else {
    res.send(newBlock);
  }

});

router.post('/initWallet', (req, res) => {
  res.send(initWallet());
});

router.post('/getAddress', (req, res) => {
  const publicAddress = getPublicFromWallet()
  res.send({ address: publicAddress });
});

const addPeerPort = [];

router.post('/socketOn', (req, res) => {
  // const p2pPort = parseInt(req.body.data)
  // console.log('socketNumber', p2pPort);
  const socketServerPort = parseInt(process.env.HTTP_PORT) + 1000;
  console.log(socketServerPort);

  if (addPeerPort.length === 0) {
    addPeerPort.push(socketServerPort);
    const addP2pport = addPeerPort[0];
    const addPeer = `ws://localhost:${addP2pport}`;
    console.log(addPeerPort);
    initP2PServer(addP2pport);
    connectToPeers(addPeer);
    res.send(`?????? ${addP2pport}??? ?????? ??????`);
  }
  // else {
  //   addPeerPort.push(addPeerPort[addPeerPort.length() - 1] + 1);
  //   const addP2pport = addPeerPort[addPeerPort.length() - 1] + 1;
  //   const addPeer = `ws://localhost:${addP2pport}`;
  //   initP2PServer(addP2pport);
  //   connectToPeers(addPeer);
  //   res.send(`?????? ${addP2pport}??? ?????? ??????`);
  // }

});

router.post('/peers', (req, res) => {
  console.log('////////////////////////////////////////////////');
  console.log(getSockets())
  console.log('////////////////////////////////////////////////');
  console.log(getSockets().map((s) => s._socket.remoteAddress))
  console.log(getSockets().map((s) => s._socket.remotePort))
  console.log(getSockets().map((s) => s._socket.connecting))
  // console.log(getSockets().map((s) => s._socket._peername.address))
  // console.log(getSockets().map((s) => s._socket._peername.family))
  // console.log(getSockets().map((s) => s._socket._peername.port))
  const peers = getSockets().map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort)
  res.send({ peers: peers });
});

router.post('/addPeer', (req, res) => {
  console.log(`\n [route(/addPeer)] ???????????? ???????????? : ${req.body.data}`)

  const data = req.body.data || [];

  connectToPeers(data);

  res.send({ peer: data });
});

router.post('/balance', (req, res) => {
  // console.log('????????? ???????????????~~~~~~');
  const balance = getAccountBalance()
  res.send({ balance: balance })
})

router.post('/mineTransaction', (req, res) => {
  const address = req.body.address;
  const amount = parseInt(req.body.amount);

  try {
    const resp = generatenextBlockWithTransaction(address, amount);
    res.send(resp);
  } catch (e) {
    console.log(e.message);
    res.status(400).send(e.message);
  }
});

router.post('/unspentTransactionOutputs', (req, res) => {
  res.send(getUnspentTxOuts());
});

router.post('/myUnspentTransactionOutputs', (req, res) => {
  res.send(getMyUnspentTransactionOutputs());
});

//???????????? ?????????
router.post('/sendTransaction', (req, res) => {
  console.log('\nSR.1 sendTransaction ???????????? ???????????????.\n');
  try {
    const address = req.body.address;
    const amount = parseInt(req.body.amount);

    if (address === undefined || amount === undefined) {
      throw Error('invalid address or amount');
    }

    const resp = sendTransaction(address, amount);

    res.send(resp);
  } catch (e) {
    console.log(e.message);
    res.status(400).send(e.message);
  }
});

router.post('/transactionPool', (req, res) => {
  const transactionPool = getTransactionPool()
  res.send({ transactionPool: transactionPool });
});

router.post('/stop', (req, res) => {
  res.send({ 'msg': 'stopping server' });
  process.exit();
});

// ??????????????? ?????? ?????? ????????????
router.post('/block/:hash', (req, res) => {
  console.log("???????????????", req.params.hash)
  const block = _.find(getBlockchain(), { 'hash': req.params.hash });
  res.send(block);
});

// ???????????? ???????????? ?????? ???????????? ????????????
router.post('/transaction/:id', (req, res) => {
  const tx = _(getBlockchain())
    .map((blocks) => blocks.data)
    .flatten()
    .find({ 'id': req.params.id });
  res.send(tx);
});

// ??????????????? ?????? ??????????????? ?????? ?????? UTxO ?????? ????????????
router.post('/address/:address', (req, res) => {
  const unspentTxOuts =
    _.filter(getUnspentTxOuts(), (uTxO) => uTxO.address === req.params.address)

  res.send({ 'unspentTxOuts': unspentTxOuts });
});


//?????????
router.post('/genesisBlockData', (req, res) => {
  // const { getTxPoolIns } = require('../public/transactionPool')

  // res.send(getTxPoolIns());

  class Block {
    constructor(index, hash, previousHash, timestamp, data, difficulty, nonce) {
      this.index = index;
      this.hash = hash;
      this.previousHash = previousHash;
      this.timestamp = timestamp;
      this.data = data;
      this.difficulty = difficulty;
      this.nonce = nonce;
    }
  }

  const genesisTransaction = {
    'txIns': [{ 'signature': '', 'txOutId': '', 'txOutIndex': 0 }],
    'txOuts': [{
      'address': '04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a',
      'amount': 50
    }],
    'id': 'e655f6a5f26dc9b4cac6e46f52336428287759cf81ef5ff10854f69d68f43fa3'
  };


  const genesisBlock = new Block(
    0, //index
    '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627', //hash
    '', //previousHash
    1465154705, //timestamp
    [genesisTransaction], //data
    0, //difficulty
    0 //nonce
  );


  let blockchain = [genesisBlock];
  console.log('blockchain[0].data\n', blockchain[0].data);

  console.log('genesisBlock.data\n', genesisBlock.data);

  res.send(genesisBlock.data)

  //[{"txIns":[{"signature":"","txOutId":"","txOutIndex":0}],"txOuts":[{"address":"04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a","amount":50}],"id":"e655f6a5f26dc9b4cac6e46f52336428287759cf81ef5ff10854f69d68f43fa3"}]

});

/////////////////////////////////////////////////////////////////////////////



module.exports = router;