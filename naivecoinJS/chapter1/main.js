const bodyParser = require('body-parser')
const express = require('express')

const {generateNextBlock, getBlockchain} = require('./blockchain')
const{connectToPeers, getSockets, initP2PServer} = require('./p2p')

const httpPort = parseInt(process.env.HTTP_PORT) || 3001;
const p2pPort = parseInt(process.env.P2P_PORT) || 6001;

const initHttpServer = ( myHttpPort ) => {
    const app = express();
    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => {
        res.send(getBlockchain());
    });
    app.post('/mineBlock', (req, res) => {
      console.log(" 1. 블럭채굴 진입");
      console.log(req.body.data);
        const newBlock = generateNextBlock(req.body.data);
        res.send(newBlock);
    });
    app.get('/peers', (req, res) => {
        res.send(getSockets().map(( s ) => s._socket.remoteAddress + ':' + s._socket.remotePort));
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
//curl -H "Content-Type: application/json" --data "{\"data\":\"Anything1\"}" http://localhost:3001/mineBlock
//curl -H "Content-type:application/json" --data "{\"peer\" : [ \"ws://localhost:6001\"] }" http://localhost:3001/addPeer
//curl http://localhost:3001/peers      