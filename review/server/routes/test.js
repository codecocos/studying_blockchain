const express = require('express')
const router = express.Router()

const { generateNextBlock, generatenextBlockWithTransaction, getAccountBalance, getBlockchain, generateRawNextBlock } = require('../public/blockchain')
const { connectToPeers, getSockets, initP2PServer } = require('../public/p2pServer')
const { initWallet, getPublicFromWallet } = require('../public/wallet')

router.post('/blocks', (req, res) => {
  res.send(getBlockchain());
});

//바디데이터 입력없는 경우
router.post('/mineBlock', (req, res) => {
  console.log('블록생성을 시작합니다~~~~~~~~~');

  const newBlock = generateNextBlock();

  if (newBlock === null) {
    res.status(400).send('could not generate block');
  } else {
    res.send(newBlock);
  }

});

//바디데이터 입력 있는 경우
router.post('/mineRawBlock', (req, res) => {
  console.log(" 1. 블럭채굴 진입");
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
  res.send({ publicAddress: publicAddress });
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
    //connectToPeers(addPeer);
    res.send(`포트 ${addP2pport}번 에서 열림`);
  }
  // else {
  //   addPeerPort.push(addPeerPort[addPeerPort.length() - 1] + 1);
  //   const addP2pport = addPeerPort[addPeerPort.length() - 1] + 1;
  //   const addPeer = `ws://localhost:${addP2pport}`;
  //   initP2PServer(addP2pport);
  //   connectToPeers(addPeer);
  //   res.send(`포트 ${addP2pport}번 에서 열림`);
  // }

});

router.post('/peers', (req, res) => {
  res.send(getSockets().map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
});



router.post('/addPeer', (req, res) => {
  console.log(`\n [route(/addPeer)] 애드피어 진입주소 : ${req.body.data}`)

  const data = req.body.data || [];

  connectToPeers(data);

  res.send({ peer: data });
});

router.post('/balance', (req, res) => {
  console.log('잔고를 보여줍니다~~~~~~');

  const balance = getAccountBalance()
  console.log(1111, balance);

  res.send({ balance: balance })
})

router.post('/mineTransaction', (req, res) => {
  const address = req.body.address;
  const amount = parseInt(req.body.amount);
  console.log(address);
  try {
    const resp = generatenextBlockWithTransaction(address, amount);
    res.send(resp);
  } catch (e) {
    console.log(e.message);
    res.status(400).send(e.message);
  }
});

module.exports = router;