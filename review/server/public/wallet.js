const fs = require("fs");
const ecdsa = require("elliptic");
const ec = new ecdsa.ec("secp256k1");
const _ = require('lodash')

const privateKeyLocation = "wallet/" + (process.env.PRIVATE_KEY || "default");
const privateKeyFile = privateKeyLocation + "/private_key";

function initWallet() {
  if (fs.existsSync(privateKeyFile)) {
    console.log("기존 지갑 경로 : " + privateKeyFile);
    return { message: "기존지갑경로가 있습니다." };
  }
  if (!fs.existsSync("wallet/")) {
    fs.mkdirSync("wallet/");
  }
  if (!fs.existsSync(privateKeyLocation)) {
    fs.mkdirSync(privateKeyLocation);
  }

  const newPrivateKey = generatePrivatekey();
  fs.writeFileSync(privateKeyFile, newPrivateKey);
  console.log("새로운 지갑경로 생성 경로 : " + privateKeyFile);
  return { message: "지갑이 잘 생성되었습니다." };
}

function generatePrivatekey() {
  const keyPair = ec.genKeyPair();
  const privatekey = keyPair.getPrivate();
  return privatekey.toString(16);
}

function getPrivateFromWallet() {
  const buffer = fs.readFileSync(privateKeyFile, "utf8");
  return buffer.toString();
}

function getPublicFromWallet() {
  const privatekey = getPrivateFromWallet();
  const key = ec.keyFromPrivate(privatekey, "hex");
  return key.getPublic().encode("hex");
}


console.log('getPublicFromWallet::: 지갑 주소!\n', getPublicFromWallet());

//////////////////////

const getBalance = (address, unspentTxOuts) => {
  console.log('\n2.getBalance 진입');
  console.log(unspentTxOuts);

  const test = _(unspentTxOuts)
    .filter((uTxO) => uTxO.address === address)
    .map((uTxO) => uTxO.amount)
    .sum();

  console.log('tetetetetet\n', test);

  // filter : 특정 조건을 만족하는 모든 요소를 추출하는 메소드
  // 입력한 key값이 true인 객체들을 배열로 반환
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
  initWallet,
  generatePrivatekey,
  getPrivateFromWallet,
  getPublicFromWallet,
  getBalance,
  createTransaction
};
