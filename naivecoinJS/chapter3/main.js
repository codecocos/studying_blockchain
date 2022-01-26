const bodyParser = require('body-parser')
const express = require('express')

const { generateNextBlock, getBlockchain } = require('./blockchain')
const { connectToPeers, getSockets, initP2PServer } = require('./p2p')

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
    app.post('/mineBlock', (req, res) => {
        console.log(" 1. 블럭채굴 진입");
        console.log(req.body.data);
        if (req.body.data == null) {
            res.send('data parameter is missing')
            return;
        }
        const newBlock = generateNextBlock(req.body.data);
        if (newBlock === null) {
            res.status(400).send('could not generate block')
        } else {
            res.send(newBlock);
        }
    });
    app.get('/peers', (req, res) => {
        res.send(getSockets().map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        console.log('1. 애드피어진입')
        console.log(req.body.peer);
        connectToPeers(req.body.peer);
        res.send();
    });

    app.listen(myHttpPort, () => {
        console.log('Listening http on port: ' + myHttpPort);
    });
};

initHttpServer(httpPort);
initP2PServer(p2pPort);

//curl http://localhost:3001/blocks
//curl -H "Content-Type: application/json" --data "{\"data\":\"Anything1\"}" http://localhost:3001/mineBlock      //chapter3 에서는 invalid structure
//curl -H "Content-type:application/json" --data "{\"peer\" : [ \"ws://localhost:6001\"] }" http://localhost:3001/addPeer
//curl http://localhost:3001/peers

//curl -H "Content-type:application/json" --data "{\"data\" : [{\"txIns\":[{\"signature\":\"\",\"txOutId\":\"\",\"txOutIndex\":1}],\"txOuts\":[{\"address\":\"04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a\",\"amount\":50}],\"id\":\"f089e8113094fab66b511402ecce021d0c1f664a719b5df1652a24d532b2f749\"}]}" http://localhost:3001/mineBlock
//curl -H "Content-type:application/json" --data "{\"data\" : [{\"txIns\":[{\"signature\":\"\",\"txOutId\":\"\",\"txOutIndex\":2}],\"txOuts\":[{\"address\":\"04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a\",\"amount\":50}],\"id\":\"88ab46660e9a34a8f3a67804748b22e1d2115c12b10ee303ec7ce8f4b0dd0d13\"}]}" http://localhost:3001/mineBlock
//curl -H "Content-type:application/json" --data "{\"data\" : [{\"txIns\":[{\"signature\":\"\",\"txOutId\":\"\",\"txOutIndex\":3}],\"txOuts\":[{\"address\":\"04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a\",\"amount\":50}],\"id\":\"7fdd46aa0a82b3916e3f4800e7c51dd075e8c1dff77cc897c154b48d1f5ed8cd\"}]}" http://localhost:3001/mineBlock