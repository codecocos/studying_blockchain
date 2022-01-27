const WebSocket = require('ws')
const { addBlockToChain, getLatestBlock, isValidBlockStructure, replaceChain, getBlockchain, handleReceivedTransaction } = require('./blockchain');
const { getTransactionPool } = require('./transactionPool');


const sockets = [];

const MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2,
    QUERY_TRANSACTION_POOL: 3,
    RESPONSE_TRANSACTION_POOL: 4
}


const initP2PServer = (p2pPort) => {
    const server = new WebSocket.Server({ port: p2pPort });
    server.on('connection', (ws) => {
        console.log("\n@@@@웹소켓서버 서버 온@@@@@\n");
        initConnection(ws);
    });
    console.log('listening websocket p2p port on: ' + p2pPort);
};

const getSockets = () => sockets;

const initConnection = (ws) => {
    console.log('4. 인잇컨넥션 진입 - 소켓배열에 푸쉬됨\n');
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());

    // query transactions pool only some time after chain query
    setTimeout(() => {
        broadcast(queryTransactionPoolMsg());
    }, 500);
};

const JSONToObject = (data) => {
    try {
        return JSON.parse(data);
    } catch (e) {
        console.log(e);
        return null;
    }
};

const initMessageHandler = (ws) => {
    console.log('5. 메세지 핸들러 진입\n');
    ws.on('message', (data) => {
        console.log('\n6. 메시지 핸들러 속 메세지 확인\n');
        //버퍼로 받은 데이터 제이슨 형식으로 파서
        const message = JSONToObject(data);

        if (message === null) {
            console.log('could not parse received JSON message: ' + data);
            return;
        }
        console.log('Received message: %s', JSON.stringify(message));
        try {
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    console.log("\n7. 메세지타입 : QUERY_LATEST");
                    write(ws, responseLatestMsg());
                    break;
                case MessageType.QUERY_ALL:
                    console.log("\n7. 메세지타입 : QUERY_ALL");
                    write(ws, responseChainMsg());
                    break;
                case MessageType.RESPONSE_BLOCKCHAIN:
                    console.log("\n7. 메세지타입 : RESPONSE_BLOCKCHAIN");
                    const receivedBlocks = JSONToObject(message.data);
                    if (receivedBlocks === null) {
                        console.log('invalid blocks received: %s', JSON.stringify(message.data));
                        break;
                    }
                    handleBlockchainResponse(receivedBlocks);
                    break;
                case MessageType.QUERY_TRANSACTION_POOL:
                    write(ws, responseTransactionPoolMsg());
                    break;
                case MessageType.RESPONSE_TRANSACTION_POOL:
                    const receivedTransactions = JSONToObject(message.data);
                    if (receivedTransactions === null) {
                        console.log('invalid transaction received: %s', JSON.stringify(message.data));
                        break;
                    }
                    receivedTransactions.forEach((transaction) => {
                        try {
                            handleReceivedTransaction(transaction);
                            // if no error is thrown, transaction was indeed added to the pool
                            // let's broadcast transaction pool
                            broadCastTransactionPool();
                        } catch (e) {
                            console.log(e.message);
                        }
                    });
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    });
};

const write = (ws, message) => {
    console.log('\n8. 소켓에 메세지 보낸다~');
    ws.send(JSON.stringify(message))
};

const broadcast = (message) => sockets.forEach((socket) => write(socket, message));

const queryChainLengthMsg = () => ({ 'type': MessageType.QUERY_LATEST, 'data': null });

const queryAllMsg = () => ({ 'type': MessageType.QUERY_ALL, 'data': null });

const responseChainMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(getBlockchain())
});

const responseLatestMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([getLatestBlock()])
});

const queryTransactionPoolMsg = () => ({
    'type': MessageType.QUERY_TRANSACTION_POOL,
    'data': null
});

const responseTransactionPoolMsg = () => ({
    'type': MessageType.RESPONSE_TRANSACTION_POOL,
    'data': JSON.stringify(getTransactionPool())
});

const initErrorHandler = (ws) => {
    const closeConnection = (myWs) => {
        console.log('connection failed to peer: ' + myWs.url);
        sockets.splice(sockets.indexOf(myWs), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

const handleBlockchainResponse = (receivedBlocks) => {
    console.log('\n9. 메세지타입 RESPONSE_BLOCKCHAIN 의 자세한 내용들');

    if (receivedBlocks.length === 0) {
        console.log('received block chain size of 0');
        return;
    }
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    if (!isValidBlockStructure(latestBlockReceived)) {
        console.log('block structuture not valid');
        return;
    }
    const latestBlockHeld = getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: '
            + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            if (addBlockToChain(latestBlockReceived)) {
                broadcast(responseLatestMsg());
            }
        } else if (receivedBlocks.length === 1) {
            console.log('We have to query the chain from our peer');
            broadcast(queryAllMsg());
        } else {
            console.log('Received blockchain is longer than current blockchain');
            replaceChain(receivedBlocks);
        }
    } else {
        console.log('received blockchain is not longer than received blockchain. Do nothing');
    }
};

const broadcastLatest = () => {
    console.log("\n6.애드블럭 유효성 검사 끝난 후 브로드캐스트 중");
    broadcast(responseLatestMsg());
};

const connectToPeers = (newPeer) => {
    console.log("2. 컨넥트투피어진입");
    console.log(newPeer);
    const ws = new WebSocket(newPeer);
    ws.on('open', () => {
        console.log('3. ws.on(접속) - 오픈 진입\n');
        initConnection(ws);
    });
    ws.on('error', (errorType) => {
        console.log('connection failed' + errorType);
    });
};

const broadCastTransactionPool = () => {
    broadcast(responseTransactionPoolMsg());
};

module.exports = { connectToPeers, broadcastLatest, broadCastTransactionPool, initP2PServer, getSockets };