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
  'txIns': [{ 'txOutId': '', 'txOutIndex': 0, 'signature': '' }],
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

//블록체인 전체를 가지고 온다.
const getBlockchain = () => blockchain;

//UTXO 전체를 딥 카피해 온다.
const getUnspentTxOuts = () => _.cloneDeep(unspentTxOuts);

// and txPool should be only updated at the same time
const setUnspentTxOuts = (newUnspentTxOut) => {
  console.log('replacing unspentTxouts with: %s', newUnspentTxOut);
  //unspentTxOuts를 newUnspentTxOut로 재할당
  unspentTxOuts = newUnspentTxOut;
};

//블록체인의 가장 마지막 블록을 가져온다.
const getLatestBlock = () => blockchain[blockchain.length - 1];

// in seconds : 블록 생성 주기
const BLOCK_GENERATION_INTERVAL = 10;
// in blocks : 블록 difficulty 조정 주기
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;


const getDifficulty = (aBlockchain) => {
  //인자로 받은 블록체인의 가장 마지막 블록
  const latestBlock = aBlockchain[blockchain.length - 1];

  //가장 마지막 블록의 인덱스를 10으로 나누었을 때 나머지가 0 이면서, 가장 마지막 블록의 인덱스가 0이 아닌경우(즉, 제네시스 블록이 아닌 경우)
  if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
    //조정된 difficulty를 반환한다.
    return getAdjustedDifficulty(latestBlock, aBlockchain);
    //마지막 블록을 10으로 나눈 나머지 값이 1~9 사이거나, 제네시스 블록인 경우
  } else {
    //가장 최근 블록의 difficulty를 반환한다.(즉, 기존의 difficulty를 반환)
    return latestBlock.difficulty;
  }
};

const getAdjustedDifficulty = (latestBlock, aBlockchain) => {
  //difficulty가 조정되기 전의 블록 = 전체블록체인의 길이에서 10을 뺀 블록(ex. 인덱스가 10, 20, 30 ... 인 경우)
  const prevAdjustmentBlock = aBlockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
  // 예상된 시간 = 10 * 10 = 100
  const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
  // 실제 걸린 시간 = 가장 마직막 블럭이 생성된 시간 - difficulty가 조정되기 전의 블록이 생성된 시간
  const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
  // 실제 걸린 시간이 (예상시간/2) 의 값 보다 작은 경우
  if (timeTaken < timeExpected / 2) {
    // 조정 전 블록의 difficulty 에 +1 한다.
    return prevAdjustmentBlock.difficulty + 1;
    // 실제 걸린 시간이 (예상시간/2) 의 값 보다 작은 경우가 아니면서,
    // 실제 걸린 시간이 (예상된 시간의 두배) 보다 큰 경우
  } else if (timeTaken > timeExpected * 2) {
    // 조정 전 블록의 difficulty에서 -1 한다.
    if (prevAdjustmentBlock.difficulty === 0) {
      return prevAdjustmentBlock.difficulty
    }
    return prevAdjustmentBlock.difficulty - 1;

  } else {
    // 위의 경우 모두가 아니면 기존 difficulty를 반환한다.
    return prevAdjustmentBlock.difficulty;
  }
};

// 현재 시간을 가져온다.
const getCurrentTimestamp = () => Math.round(new Date().getTime() / 1000);

//새로운 블럭을 생성한다.
// 인자로 받은 블록데이터에는 코인베이스 트랜잭션과 트랜잭션 풀의 트랜잭션들이 담겨있음.
const generateRawNextBlock = (blockData) => {
  const { broadcastLatest } = require('./p2pServer')

  //가장 최근 블럭이 이전 블록이 된다.
  const previousBlock = getLatestBlock();

  //전체 블록체인을 인자로 하여 difficulty를 가져온다.
  const difficulty = getDifficulty(getBlockchain()) //chapter2 추가
  console.log("현재 difficulty 값 : ", difficulty);

  //다음 블록의 인덱스 는 이전블록의 인덱스에 +1 한다.
  const nextIndex = previousBlock.index + 1;

  //다음 블록이 생성된 시간 = generateRawNextBlock함수가 작동된 시간
  const nextTimestamp = getCurrentTimestamp()

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

//chapter2 추가
const findBlock = (index, previousHash, timestamp, data, difficulty) => {

  //nonce 값은 0 에서 시작
  let nonce = 0;

  //while에 조건식 대신 True를 지정하면 무한히 반복하는 무한 루프가 된다.
  //조건문이 반복할 때마다 nonce값이 증가
  while (true) {
    // 인자로 받은 index, previousHash, timestamp, data, difficulty에 (주의)nonce 값을 추가하여 모두 더한 것의 해시값을 구한다.
    const hash = calculateHash(index, previousHash, timestamp, data, difficulty, nonce);

    //hashMatchesDifficulty : 위의 hash(16진수) 값을 2진수로 변환하여 , difficulty 수 만큼 0를 2진수 앞에 붙여주는 함수.
    //hashMatchesDifficulty의 리턴값
    if (hashMatchesDifficulty(hash, difficulty)) {
      //calculateHash한 hash값을 블록의 hash에 담아 그 블록을 반환한다.
      return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce);
    }
    // 해당하는 값을 찾을 때 까지 nonce값을 1씩 추가
    nonce++;
  }
};

//difficulty 수 만큼, 2진수로 변환된 hash 값의 앞에 붙여주는 함수.
const hashMatchesDifficulty = (hash, difficulty) => {
  //16진수인 hash값을 hexToBinary함수를 이용하여 2진수 값으로 변환한다.
  const hashInBinary = hexToBinary(hash);
  // 0을 difficulty에 해당하는 숫자만큼 0 반복하여 작성한다. 3 -> 000
  const requiredPrefix = '0'.repeat(difficulty);
  // difficulty에 해당하는 숫자만큼 0 을, 2진수로 변환된 hash 값의 앞에 붙여준다.
  // difficulty가 높으면 높을수록 조건을 맞추기가 까다로워짐(nonce값과 time값이 바뀌면서 암호화값(hash)이 달라진다.)
  return hashInBinary.startsWith(requiredPrefix);
};


//chapter4 추가
const generateNextBlock = () => {
  console.log('\n1. 마인블럭시 generateNextBlock 진입');

  const { getCoinbaseTransaction } = require('./transaction')
  const { getPublicFromWallet } = require('./wallet');

  //                                        (address, blockIndex) 
  const coinbaseTx = getCoinbaseTransaction(getPublicFromWallet(), getLatestBlock().index + 1);
  // 코인베이스 트랜잭션을 담은 배열과 , 트랜잭션 풀 배열을 합친 배열을 블록데이터에 담는다.
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

// 블록의 index, previousHash, timestamp, data, difficulty, nonce 값을 인자로 받아
const calculateHash = (index, previousHash, timestamp, data, difficulty, nonce) =>
  // 각 인자의 값을 단순 나열한 값을 SHA256 알고리즘으로 암호화(해시화) 하여, 스트링 값으로 나타낸다.
  CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty + nonce).toString();


const calculateHashForBlock = (block) =>
  calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.difficulty, block.nonce);


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
      console.log('block is not valid in terms of transactions : \n블럭 생성 실패');
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