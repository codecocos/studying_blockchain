//chapter3 : 트랜잭션 추가

const CryptoJS = require('crypto-js')
const { hexToBinary } = require('./util')


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

const genesisBlock = new Block(
    0,
    '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7',
    '',
    1465154705,
    [],
    0,
    0
);

let blockchain = [genesisBlock];

let unspentTxOuts = [];

const getBlockchain = () => blockchain;

const getLatestBlock = () => blockchain[blockchain.length - 1];

////////////////////////////////////////////////////////////////////////////
// in seconds
const BLOCK_GENERATION_INTERVAL = 10;
// in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;

const getDifficulty = (aBlockchain) => {
    const latestBlock = aBlockchain[blockchain.length - 1];
    if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
        return getAdjustedDifficulty(latestBlock, aBlockchain);
    } else {
        return latestBlock.difficulty;
    }
};

const getAdjustedDifficulty = (latestBlock, aBlockchain) => {
    const prevAdjustmentBlock = aBlockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
    const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) {
        return prevAdjustmentBlock.difficulty + 1;
    } else if (timeTaken > timeExpected * 2) {
        return prevAdjustmentBlock.difficulty - 1;
    } else {
        return prevAdjustmentBlock.difficulty;
    }
};

const getCurrentTimestamp = () => Math.round(new Date().getTime() / 1000);
////////////////////////////////////////////////////////////////////////////////////

const generateRawNextBlock = (blockData) => {
    const { broadcastLatest } = require('./p2p')
    console.log('\n4. 코인베이스트랜잭션을 블록데이터에 담는다.');
    console.log('///////////////////////////////////////');
    console.log("\n2. 다음 블럭 생성 함수 : ", blockData);

    const previousBlock = getLatestBlock();

    const difficulty = getDifficulty(getBlockchain()) //chapter2 추가
    console.log("difficulty추가 : ", difficulty);

    const nextIndex = previousBlock.index + 1;
    const nextTimestamp = getCurrentTimestamp()
    //const nextHash = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData); //chapter 1
    //const newBlock = new Block(nextIndex, nextHash, previousBlock.hash, nextTimestamp, blockData); //chapter 1
    const newBlock = findBlock(nextIndex, previousBlock.hash, nextTimestamp, blockData, difficulty); //chapter2 에서 변경

    //chapter2
    //addBlock(newBlock);

    //chapter3
    if (addBlockToChain(newBlock)) {
        broadcastLatest();
        return newBlock;
    } else {
        return null;
    }
};

//chapter4 추가
const generateNextBlock = () => {
    console.log('\n1. 마인블럭시 generateNextBlock 진입');
    const { getCoinbaseTransaction } = require('./transaction')
    const { getPublicFromWallet } = require('./wallet');
    const coinbaseTx = getCoinbaseTransaction(getPublicFromWallet(), getLatestBlock().index + 1);
    const blockData = [coinbaseTx];
    return generateRawNextBlock(blockData);
};

const generatenextBlockWithTransaction = (receiverAddress, amount) => {
    console.log('\n1. generatenextBlockWithTransaction 진입');
    const { getCoinbaseTransaction, isValidAddress } = require('./transaction')
    const { createTransaction, getPrivateFromWallet, getPublicFromWallet } = require('./wallet');

    if (!isValidAddress(receiverAddress)) {
        throw Error('invalid address');
    }
    if (typeof amount !== 'number') {
        throw Error('invalid amount');
    }
    const coinbaseTx = getCoinbaseTransaction(getPublicFromWallet(), getLatestBlock().index + 1);
    const tx = createTransaction(receiverAddress, amount, getPrivateFromWallet(), unspentTxOuts);
    const blockData = [coinbaseTx, tx];
    return generateRawNextBlock(blockData);
};


//chapter2 추가
const findBlock = (index, previousHash, timestamp, data, difficulty) => {
    let nonce = 0;
    while (true) {
        const hash = calculateHash(index, previousHash, timestamp, data, difficulty, nonce);
        if (hashMatchesDifficulty(hash, difficulty)) {
            return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce);
        }
        nonce++;
    }
};

//chapter4 추가
const getAccountBalance = () => {
    console.log("\n1.잔고 계산 시작");
    const { getBalance, getPublicFromWallet } = require('./wallet');
    return getBalance(getPublicFromWallet(), unspentTxOuts);
};

const calculateHashForBlock = (block) =>
    calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.difficulty, block.nonce);

const calculateHash = (index, previousHash, timestamp, data, difficulty, nonce) =>
    CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty + nonce).toString();

// const addBlock = (newBlock) => {
//   console.log("\n3. 애드블럭할 블럭내용 : \n", newBlock);
//     if (isValidNewBlock(newBlock, getLatestBlock())) {
//       console.log('\n5.유효성검사 끝남(블록체인에추가됩니다)');
//         blockchain.push(newBlock);
//     }
// };

const isValidBlockStructure = (block) => {
    return typeof block.index === 'number'
        && typeof block.hash === 'string'
        && typeof block.previousHash === 'string'
        && typeof block.timestamp === 'number'
        // && typeof block.data === 'string'; //chapter2
        && typeof block.data === 'object'; //chapter3
};

const isValidNewBlock = (newBlock, previousBlock) => {

    if (!isValidBlockStructure(newBlock)) {
        console.log('invalid structure');
        console.log(newBlock);
        return false;
    }
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    } else if (!isValidTimestamp(newBlock, previousBlock)) {
        console.log('invalid timestamp');
        return false;
    }
    //chapter 1
    // else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
    //     console.log(typeof (newBlock.hash) + ' ' + typeof calculateHashForBlock(newBlock));
    //     console.log('invalid hash: ' + calculateHashForBlock(newBlock) + ' ' + newBlock.hash);
    //     return false;
    // }
    //chapter 2
    else if (!hasValidHash(newBlock)) {
        return false
    }
    console.log("\n4.애드블럭체인시 유효성 검사 진입 후 통과");
    return true;
};


const getAccumulatedDifficulty = (aBlockchain) => {
    return aBlockchain
        .map((block) => block.difficulty)
        .map((difficulty) => Math.pow(2, difficulty))
        .reduce((a, b) => a + b);
};

const isValidTimestamp = (newBlock, previousBlock) => {
    return (previousBlock.timestamp - 60 < newBlock.timestamp)
        && newBlock.timestamp - 60 < getCurrentTimestamp();
};

const hasValidHash = (block) => {

    if (!hashMatchesBlockContent(block)) {
        console.log('invalid hash, got:' + block.hash);
        return false;
    }

    if (!hashMatchesDifficulty(block.hash, block.difficulty)) {
        console.log('block difficulty not satisfied. Expected: ' + block.difficulty + 'got: ' + block.hash);
    }
    return true;
};

const hashMatchesBlockContent = (block) => {
    const blockHash = calculateHashForBlock(block);
    return blockHash === block.hash;
};

const hashMatchesDifficulty = (hash, difficulty) => {
    const hashInBinary = hexToBinary(hash);
    const requiredPrefix = '0'.repeat(difficulty);
    return hashInBinary.startsWith(requiredPrefix);
};


const isValidChain = (blockchainToValidate) => {
    const isValidGenesis = (block) => {
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };

    if (!isValidGenesis(blockchainToValidate[0])) {
        return false;
    }

    for (let i = 1; i < blockchainToValidate.length; i++) {
        if (!isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) {
            return false;
        }
    }
    return true;
};

const addBlockToChain = (newBlock) => {
    console.log('\n3. 애드블럭투체인 진입\n', newBlock);
    const { processTransactions } = require("./transaction");
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        const retVal = processTransactions(newBlock.data, unspentTxOuts, newBlock.index);
        if (retVal === null) {
            console.log('\n블럭 생성 실패');
            return false;
        } else {
            console.log("\n블럭이 성공적으로 생성됩니다.");
            blockchain.push(newBlock);
            unspentTxOuts = retVal;
            return true;
        }
    }
    return false;
};

const replaceChain = (newBlocks) => {
    const { broadcastLatest } = require('./p2p')

    //if (isValidChain(newBlocks) && newBlocks.length > getBlockchain().length) {
    if (isValidChain(newBlocks) &&
        getAccumulatedDifficulty(newBlocks) > getAccumulatedDifficulty(getBlockchain())) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchain = newBlocks;
        broadcastLatest();
    } else {
        console.log('Received blockchain invalid');
    }
};

module.exports = {
    Block, getBlockchain, getLatestBlock,
    generateRawNextBlock, generateNextBlock, generatenextBlockWithTransaction,
    getAccountBalance, isValidBlockStructure, replaceChain, addBlockToChain
};