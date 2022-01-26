//chapter4 지갑

const { ec } = require('elliptic');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const _ = require('lodash');
const { getPublicKey, getTransactionId, signTxIn, Transaction, TxIn, TxOut } = require('./transaction');

const EC = new ec('secp256k1');
const privateKeyLocation = 'node/wallet/private_key';

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
  console.log('new wallet with private key created');
};

const getBalance = (address, unspentTxOuts) => {
  console.log('\n2.getBalance 진입');
  return _(unspentTxOuts)
    .filter((uTxO) => uTxO.address === address)
    .map((uTxO) => uTxO.amount)
    .sum();
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
  throw Error('not enough coins to send transaction');
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

const createTransaction = (receiverAddress, amount,
  privateKey, unspentTxOuts) => {
  console.log('\n createTransaction 진입 : 블록 생성시 바디데이터에 코인베이스크랜잭션과 함께 담긴다.');
  const myAddress = getPublicKey(privateKey);
  const myUnspentTxOuts = unspentTxOuts.filter((uTxO) => uTxO.address === myAddress);

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
  getPrivateFromWallet, getBalance, generatePrivateKey, initWallet
};
