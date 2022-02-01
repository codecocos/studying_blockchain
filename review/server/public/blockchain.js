const CryptoJS = require('crypto-js')
const _ = require('lodash')
const { hexToBinary } = require('./util')
const { processTransactions } = require('./transaction')
const { addToTransactionPool, getTransactionPool, updateTransactionPool } = require('./transactionPool');

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
  'id': 'e655f6a5f26dc9b4cac6e46f52336428287759cf81ef5ff10854f69d68f43fa3',
  'txIns': [{ 'signature': '', 'txOutId': '', 'txOutIndex': 0 }],
  'txOuts': [{
    'address': '04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a',
    'amount': 50
  }],
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

//genesisBlock.data = 
//blockchain[0].data
let blockchain = [genesisBlock];

console.log(genesisBlock.data);


// the unspent txOut of genesis block is set to unspentTxOuts on startup
//                                   (aTransactions, aUnspentTxOuts, blockIndex)
let unspentTxOuts = processTransactions(blockchain[0].data, [], 0);

const getBlockchain = () => blockchain;

const getUnspentTxOuts = () => _.cloneDeep(unspentTxOuts);

// and txPool should be only updated at the same time
const setUnspentTxOuts = (newUnspentTxOut) => {
  console.log('replacing unspentTxouts with: %s', newUnspentTxOut);
  unspentTxOuts = newUnspentTxOut;
};


const getLatestBlock = () => blockchain[blockchain.length - 1];

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
  const { broadcastLatest } = require('./p2pServer')
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

// gets the unspent transaction outputs owned by the wallet
const getMyUnspentTransactionOutputs = () => {
  const { getPublicFromWallet, findUnspentTxOuts } = require('./wallet');
  return findUnspentTxOuts(getPublicFromWallet(), getUnspentTxOuts());
};


//chapter4 추가
const generateNextBlock = () => {
  console.log('\n1. 마인블럭시 generateNextBlock 진입');
  const { getCoinbaseTransaction } = require('./transaction')
  const { getPublicFromWallet } = require('./wallet');
  const coinbaseTx = getCoinbaseTransaction(getPublicFromWallet(), getLatestBlock().index + 1);
  const blockData = [coinbaseTx].concat(getTransactionPool());
  console.log("generateNextBlock::blockData :", blockData);
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
  const tx = createTransaction(receiverAddress, amount, getPrivateFromWallet(), getUnspentTxOuts(), getTransactionPool());
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
  console.log("\nUTxO\n", unspentTxOuts);
  const { getBalance, getPublicFromWallet } = require('./wallet');
  return getBalance(getPublicFromWallet(), getUnspentTxOuts());
};

//트랜잭션 전송(나 -> 상대방)
const sendTransaction = (address, amount) => {
  console.log('\n sendTransaction - SR2. (address, amount) 을 인자로 받습니다.');
  console.log('\n sendTransaction \n - createTransaction(address, amount, getPrivateFromWallet(), getUnspentTxOuts(), getTransactionPool()) \n - addToTransactionPool(tx, getUnspentTxOuts()) \n - broadCastTransactionPool()\n');
  const { createTransaction, getPrivateFromWallet } = require('./wallet');
  const { broadCastTransactionPool } = require('./p2pServer')

  //트랜잭션 생성(receiverAddress, amount, privateKey, unspentTxOuts, txPool)
  const tx = createTransaction(address, amount, getPrivateFromWallet(), getUnspentTxOuts(), getTransactionPool());

  console.log("tx--", tx);

  addToTransactionPool(tx, getUnspentTxOuts());
  broadCastTransactionPool();
  return tx;
};


const calculateHashForBlock = (block) =>
  calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.difficulty, block.nonce);

const calculateHash = (index, previousHash, timestamp, data, difficulty, nonce) =>
  CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty + nonce).toString();

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
    console.log('invalid block structure: %s', JSON.stringify(newBlock));
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
  console.log('isValidChain:');
  console.log(JSON.stringify(blockchainToValidate));

  const isValidGenesis = (block) => {
    return JSON.stringify(block) === JSON.stringify(genesisBlock);
  };

  if (!isValidGenesis(blockchainToValidate[0])) {
    return null;
  }

  /*
Validate each block in the chain. The block is valid if the block structure is valid
  and the transaction are valid
 */

  let aUnspentTxOuts = [];

  for (let i = 0; i < blockchainToValidate.length; i++) {
    const currentBlock = blockchainToValidate[i];
    if (i !== 0 && !isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) {
      return null;
    }

    aUnspentTxOuts = processTransactions(currentBlock.data, aUnspentTxOuts, currentBlock.index);
    if (aUnspentTxOuts === null) {
      console.log('invalid transactions in blockchain');
      return null;
    }
  }
  return aUnspentTxOuts;
};

const addBlockToChain = (newBlock) => {
  console.log('\n3. 애드블럭투체인 진입\n', newBlock);
  const { processTransactions } = require("./transaction");
  if (isValidNewBlock(newBlock, getLatestBlock())) {
    const retVal = processTransactions(newBlock.data, getUnspentTxOuts(), newBlock.index);
    if (retVal === null) {
      console.log('block is not valid in terms of transactions');
      console.log('\n블럭 생성 실패');
      return false;
    } else {
      console.log("\n블럭이 성공적으로 생성됩니다.");
      blockchain.push(newBlock);
      setUnspentTxOuts(retVal);
      updateTransactionPool(unspentTxOuts);
      return true;
    }
  }
  return false;
};

const replaceChain = (newBlocks) => {
  const { broadcastLatest } = require('./p2pServer')

  const aUnspentTxOuts = isValidChain(newBlocks);
  const validChain = aUnspentTxOuts !== null;
  if (validChain &&
    getAccumulatedDifficulty(newBlocks) > getAccumulatedDifficulty(getBlockchain())) {
    console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
    blockchain = newBlocks;
    setUnspentTxOuts(aUnspentTxOuts);
    updateTransactionPool(unspentTxOuts);
    broadcastLatest();
  } else {
    console.log('Received blockchain invalid');
  }
};

const handleReceivedTransaction = (transaction) => {
  addToTransactionPool(transaction, getUnspentTxOuts());
};

module.exports = {
  Block, getBlockchain, getUnspentTxOuts, getLatestBlock, sendTransaction,
  generateRawNextBlock, generateNextBlock, generatenextBlockWithTransaction,
  handleReceivedTransaction, getMyUnspentTransactionOutputs,
  getAccountBalance, isValidBlockStructure, replaceChain, addBlockToChain
};