const express = require('express')
const router = express.Router()

const { generateNextBlock, generatenextBlockWithTransaction, getAccountBalance, getBlockchain } = require('../public/blockchain')
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

// //바디데이터 입력 있는 경우
// router.post('/mineRawBlock', (req, res) => {
//   console.log(" 1. 블럭채굴 진입");
//   console.log(req.body.data);

//   if (req.body.data == null) {
//     res.send('data parameter is missing')
//     return;
//   }

//   const newBlock = generateNextBlock(req.body.data);

//   if (newBlock === null) {
//     res.status(400).send('could not generate block')
//   } else {
//     res.send(newBlock);
//   }

// });

router.post('/initWallet', (req, res) => {
  res.send(initWallet());
});

router.post('/getAddress', (req, res) => {
  const publicAddress = getPublicFromWallet()
  res.send({ publicAddress: publicAddress });
});

router.post('/socketOn', (req, res) => {
  const p2pPort = 6001
  res.send(initP2PServer(p2pPort));
});





// router.post('/mineTransaction', (req, res) => {
//   console.log("트랜잭션 거래 발생!");

//   const address = req.body.address;
//   const amount = req.body.amount;

//   try {
//     const resp = generatenextBlockWithTransaction(address, amount);
//     res.send(resp);
//   } catch (e) {
//     console.log(e.message);
//     res.status(400).send(e.message);
//   }
// });


router.post('/peers', (req, res) => {
  res.send(getSockets().map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
});

router.post('/addPeer', (req, res) => {
  console.log('1. 애드피어진입')
  console.log(req.body);

  connectToPeers(req.body.peer);

  res.send({ success: req.body.peer });
});


router.post('/balance', (req, res) => {
  console.log('잔고를 보여줍니다~~~~~~');

  const balance = getAccountBalance()
  console.log(getAccountBalance);

  res.send({ balance: balance })
})


module.exports = router;