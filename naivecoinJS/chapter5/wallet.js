//chapter4 지갑

const { ec } = require('elliptic');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const _ = require('lodash');
const { getPublicKey, getTransactionId, signTxIn, TxOut, TxIn, Transaction } = require('./transaction');

const EC = new ec('secp256k1');
//chapter4
//const privateKeyLocation = 'node/wallet/private_key';
//ch5
const privateKeyLocation = process.env.PRIVATE_KEY || 'node/wallet/private_key';

const getPrivateFromWallet = () => {
  const buffer = readFileSync(privateKeyLocation, 'utf8');
  return buffer.toString();
};

const getPublicFromWallet = () => {
  const privateKey = getPrivateFromWallet();
  const key = EC.keyFromPrivate(privateKey, 'hex');
  return key.getPublic().encode('hex');
};

const generatePrivateKey = () => {
  const keyPair = EC.genKeyPair();
  const privateKey = keyPair.getPrivate();
  return privateKey.toString(16);
};

const initWallet = () => {
  // let's not override existing private keys
  if (existsSync(privateKeyLocation)) {
    return;
  }
  const newPrivateKey = generatePrivateKey();

  writeFileSync(privateKeyLocation, newPrivateKey);
  console.log('new wallet with private key created to : %s', privateKeyLocation);
};

//ch5
const deleteWallet = () => {
  if (existsSync(privateKeyLocation)) {
    unlinkSync(privateKeyLocation);
  }
};

const getBalance = (address, unspentTxOuts) => {
  console.log('\n2.getBalance 진입');
  //chapter4
  // return _(unspentTxOuts)
  //   .filter((uTxO) => uTxO.address === address)
  //ch5
  return _(findUnspentTxOuts(address, unspentTxOuts))
    .map((uTxO) => uTxO.amount)
    .sum();
};

//ch5
const findUnspentTxOuts = (ownerAddress, unspentTxOuts) => {
  return _.filter(unspentTxOuts, (uTxO) => uTxO.address === ownerAddress);
};

//소진되지 않은 트랜잭션 아웃(unspent transaction outputs)’ 목록을 순회하며 우리가 원하는 금액이 될 때까지 반복문 실행.
const findTxOutsForAmount = (amount, myUnspentTxOuts) => {
  let currentAmount = 0;
  const includedUnspentTxOuts = [];
  for (const myUnspentTxOut of myUnspentTxOuts) {
    includedUnspentTxOuts.push(myUnspentTxOut);
    currentAmount = currentAmount + myUnspentTxOut.amount;
    if (currentAmount >= amount) {
      //나중에 자신에게 back할 금액
      const leftOverAmount = currentAmount - amount;
      return { includedUnspentTxOuts, leftOverAmount };
    }
  }
  //chapter4
  //throw Error('not enough coins to send transaction');

  //ch5
  const eMsg = 'Cannot create transaction from the available unspent transaction outputs.' +
    ' Required amount:' + amount + '. Available unspentTxOuts:' + JSON.stringify(myUnspentTxOuts);
  throw Error(eMsg);

};



const createTxOuts = (receiverAddress, myAddress, amount, leftOverAmount) => {
  //보낼 아웃풋
  const txOut1 = new TxOut(receiverAddress, amount);
  if (leftOverAmount === 0) {
    return [txOut1];
  } else {
    //자신에게 back할 아웃풋
    const leftOverTx = new TxOut(myAddress, leftOverAmount);
    return [txOut1, leftOverTx];
  }
};

//ch5
const filterTxPoolTxs = (unspentTxOuts, transactionPool) => {
  const txIns = _(transactionPool)
    .map((tx) => tx.txIns)
    .flatten()
    .value();
  const removable = [];
  for (const unspentTxOut of unspentTxOuts) {
    const txIn = _.find(txIns, (aTxIn) => {
      return aTxIn.txOutIndex === unspentTxOut.txOutIndex && aTxIn.txOutId === unspentTxOut.txOutId;
    });

    if (txIn === undefined) {

    } else {
      removable.push(unspentTxOut);
    }
  }

  return _.without(unspentTxOuts, ...removable);
};

//ch5 : txPool 추가됨
const createTransaction = (receiverAddress, amount, privateKey, unspentTxOuts, txPool) => {
  console.log('\n createTransaction 진입 : 블록 생성시 바디데이터에 코인베이스크랜잭션과 함께 담긴다.');
  console.log('txPool: %s', JSON.stringify(txPool));
  const myAddress = getPublicKey(privateKey);
  //chapter4
  //const myUnspentTxOuts = unspentTxOuts.filter((uTxO) => uTxO.address === myAddress);

  //ch5
  const myUnspentTxOutsA = unspentTxOuts.filter((uTxO) => uTxO.address === myAddress);
  const myUnspentTxOuts = filterTxPoolTxs(myUnspentTxOutsA, txPool);

  // filter from unspentOutputs such inputs that are referenced in pool

  const { includedUnspentTxOuts, leftOverAmount } = findTxOutsForAmount(amount, myUnspentTxOuts);

  //소진되지 않은 트랜잭션 아웃풋을 가진 만큼 트랜책션 txIns를 만들어낼 수 있다.
  const toUnsignedTxIn = (unspentTxOut) => {
    const txIn = new TxIn();
    txIn.txOutId = unspentTxOut.txOutId;
    txIn.txOutIndex = unspentTxOut.txOutIndex;
    return txIn;
  };

  const unsignedTxIns = includedUnspentTxOuts.map(toUnsignedTxIn);

  const tx = new Transaction();
  tx.txIns = unsignedTxIns;
  tx.txOuts = createTxOuts(receiverAddress, myAddress, amount, leftOverAmount);
  tx.id = getTransactionId(tx);

  tx.txIns = tx.txIns.map((txIn, index) => {
    txIn.signature = signTxIn(tx, index, privateKey, unspentTxOuts);
    return txIn;
  });

  return tx;
};

module.exports = {
  createTransaction, getPublicFromWallet,
  getPrivateFromWallet, getBalance, generatePrivateKey, initWallet, deleteWallet, findUnspentTxOuts
};
