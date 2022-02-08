const bodyParser = require('body-parser')
const express = require('express')

const { generateNextBlock, generatenextBlockWithTransaction, getAccountBalance, getBlockchain, generateRawNextBlock, getMyUnspentTransactionOutputs, getUnspentTxOuts, sendTransaction } = require('./blockchain')
const { connectToPeers, getSockets, initP2PServer } = require('./p2p')
const { getPublicFromWallet, initWallet } = require('./wallet')
const { getTransactionPool } = require('./transactionPool');

const httpPort = parseInt(process.env.HTTP_PORT) || 3001;
const p2pPort = parseInt(process.env.P2P_PORT) || 6001;

const initHttpServer = (myHttpPort) => {
    const app = express();
    app.use(bodyParser.json());

    app.use((err, req, res, next) => {
        if (err) {
            res.status(400).send(err.message)
        }
    });

    app.get('/blocks', (req, res) => {
        res.send(getBlockchain());
    });

    //ch5
    app.get('/unspentTransactionOutputs', (req, res) => {
        res.send(getUnspentTxOuts());
    });
    //ch5
    app.get('/myUnspentTransactionOutputs', (req, res) => {
        res.send(getMyUnspentTransactionOutputs());
    });

    app.post('/mineRawBlock', (req, res) => {
        console.log(" 1. 블럭채굴 진입");
        console.log(req.body.data);
        if (req.body.data == null) {
            res.send('data parameter is missing')
            return;
        }
        const newBlock = generateRawNextBlock(req.body.data);
        if (newBlock === null) {
            res.status(400).send('could not generate block')
        } else {
            res.send(newBlock);
        }
    });

    app.post('/mineBlock', (req, res) => {
        console.log('블록생성을 시작합니다~~~~~~~~~');
        const newBlock = generateNextBlock();
        if (newBlock === null) {
            res.status(400).send('could not generate block');
        } else {
            res.send(newBlock);
        }
    });

    app.get('/balance', (req, res) => {
        console.log('잔고를 보여줍니다~~~~~~');
        const balance = getAccountBalance()
        res.send({ 'balance': balance })
    })

    //ch5
    app.get('/address', (req, res) => {
        const address = getPublicFromWallet();
        res.send({ 'address': address });
    });

    app.post('/mineTransaction', (req, res) => {
        const address = req.body.address;
        const amount = req.body.amount;
        console.log("트랜잭션 거래 발생!");
        try {
            const resp = generatenextBlockWithTransaction(address, amount);
            res.send(resp);
        } catch (e) {
            console.log(e.message);
            res.status(400).send(e.message);
        }
    });

    //ch5
    app.post('/sendTransaction', (req, res) => {
        try {
            const address = req.body.address;
            const amount = req.body.amount;

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
    //ch5
    app.get('/transactionPool', (req, res) => {
        res.send(getTransactionPool());
    });

    app.get('/peers', (req, res) => {
        res.send(getSockets().map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        console.log('1. 애드피어진입')
        console.log(req.body.peer);
        connectToPeers(req.body.peer);
        res.send({ success: req.body.peer });
    });

    //ch5
    app.post('/stop', (req, res) => {
        res.send({ 'msg': 'stopping server' });
        process.exit();
    });

    app.listen(myHttpPort, () => {
        console.log('Listening http on port: ' + myHttpPort);
    });
};

initHttpServer(httpPort);
initP2PServer(p2pPort);
initWallet();

//curl http://localhost:3001/blocks
//curl -H "Content-Type: application/json" --data "{\"data\":\"Anything1\"}" http://localhost:3001/mineBlock      //chapter3 에서는 invalid structure
//curl -H "Content-type:application/json" --data "{\"peer\" : [ \"ws://localhost:6001\"] }" http://localhost:3001/addPeer
//curl http://localhost:3001/peers

//curl -H "Content-type:application/json" --data "{\"data\" : [{\"txIns\":[{\"signature\":\"\",\"txOutId\":\"\",\"txOutIndex\":1}],\"txOuts\":[{\"address\":\"04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a\",\"amount\":50}],\"id\":\"f089e8113094fab66b511402ecce021d0c1f664a719b5df1652a24d532b2f749\"}]}" http://localhost:3001/mineRawBlock
//curl -H "Content-type:application/json" --data "{\"data\" : [{\"txIns\":[{\"signature\":\"\",\"txOutId\":\"\",\"txOutIndex\":2}],\"txOuts\":[{\"address\":\"04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a\",\"amount\":50}],\"id\":\"88ab46660e9a34a8f3a67804748b22e1d2115c12b10ee303ec7ce8f4b0dd0d13\"}]}" http://localhost:3001/mineRawBlock
//curl -H "Content-type:application/json" --data "{\"data\" : [{\"txIns\":[{\"signature\":\"\",\"txOutId\":\"\",\"txOutIndex\":3}],\"txOuts\":[{\"address\":\"04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a\",\"amount\":50}],\"id\":\"7fdd46aa0a82b3916e3f4800e7c51dd075e8c1dff77cc897c154b48d1f5ed8cd\"}]}" http://localhost:3001/mineRawBlock

//chapter4
//Mine transaction : 보낼주소, 보낼양
// curl -H "Content-type: application/json" --data "{\"address\": \"04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534b\", \"amount\" : 35}" http://localhost:3001/mineTransaction

// Mine a block
// curl -X POST http://localhost:3001/mineBlock

// Get balance
// curl http://localhost:3001/balance




//chapter5

// Get blockchain
// curl http://localhost:3001/blocks

// Mine a block
// curl -X POST http://localhost:3001/mineBlock

// Send transaction
// curl -H "Content-type: application/json" --data "{\"address\": \"04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534b\", \"amount\" : 35}" http://localhost:3001/sendTransaction

// Query transaction pool
// curl http://localhost:3001/transactionPool

// Mine transaction
// curl -H "Content-type: application/json" --data "{\"address\": \"04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534b\", \"amount\" : 35}" http://localhost:3001/mineTransaction

// Get balance
// curl http://localhost:3001/balance

// Add peer
// curl -H "Content-type:application/json" --data "{\"peer\" : [ \"ws://localhost:6001\"] }" http://localhost:3001/addPeer

// Query connected peers
// curl http://localhost:3001/peers

//curl http://localhost:3001/unspentTransactionOutputs


