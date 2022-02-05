const fs = require("fs");
const ecdsa = require("elliptic");
const ec = new ecdsa.ec("secp256k1");
const _ = require('lodash')

const privateKeyLocation = "wallet/" + (process.env.PRIVATE_KEY || "default");
const privateKeyFile = privateKeyLocation + "/private_key";

function initWallet() {
  //privateKeyFile가 경로 내에 존재한다면
  if (fs.existsSync(privateKeyFile)) {
    //publickey 보여주기
    console.log("기존 지갑 경로 : " + privateKeyFile);
    return { message: "기존지갑경로가 있습니다.", address: getPublicFromWallet() };
  }
  // wallet 폴더가 존재하지 않는다면
  if (!fs.existsSync("wallet/")) {
    // wallet 폴더 생성해주기
    fs.mkdirSync("wallet/");
  }
  // wallet 폴더 아래 추가 폴더가 없다면 
  if (!fs.existsSync(privateKeyLocation)) {
    // 추가 폴더 생성해주기
    fs.mkdirSync(privateKeyLocation);
  }


  const newPrivateKey = generatePrivatekey();
  fs.writeFileSync(privateKeyFile, newPrivateKey);
  //console.log("새로운 지갑경로 생성 경로 : " + privateKeyFile);
  console.log('new wallet with private key created to : %s', privateKeyFile);
  return { message: "지갑이 잘 생성되었습니다.", address: getPublicFromWallet() };
}

//프라이빗키 생성하기
function generatePrivatekey() {
  // ec 모듈 사용하여 키페어 생성하기(개인키와 공개키)
  const keyPair = ec.genKeyPair();
  // 생성한 키페어세서 공개키 가져오기
  const privatekey = keyPair.getPrivate();
  //가져온 공개키를 스트링 값으로 변환하여 리턴, 스트링값은 16진수에 해당하도록 한다.
  return privatekey.toString(16);
}

//개인키 가져오기
function getPrivateFromWallet() {

  const buffer = fs.readFileSync(privateKeyFile, "utf8");
  return buffer.toString();
}

function getPublicFromWallet() {
  const privatekey = getPrivateFromWallet();
  const key = ec.keyFromPrivate(privatekey, "hex");
  return key.getPublic().encode("hex");
}


console.log('generatePrivatekey::: 개인키!\n', generatePrivatekey());
console.log('getPublicFromWallet::: 지갑 주소!\n', getPublicFromWallet());

//////////////////////

const deleteWallet = () => {
  if (fs.existsSync(privateKeyLocation)) {
    fs.unlinkSync(privateKeyLocation);
  }
};

const getBalance = (address, unspentTxOuts) => {
  console.log('\n2.getBalance 진입');
  console.log("\nUTxO\n", unspentTxOuts);
  console.log('\n잔액조회할 주소: \n', address);

  // filter : 특정 조건을 만족하는 모든 요소를 추출하는 메소드
  // 입력한 key값이 true인 객체들을 배열로 반환
  return _(findUnspentTxOuts(address, unspentTxOuts))
    .filter((uTxO) => uTxO.address === address)
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

  const eMsg = 'Cannot create transaction from the available unspent transaction outputs.' +
    ' Required amount:' + amount + '. Available unspentTxOuts:' + JSON.stringify(myUnspentTxOuts);
  throw Error(eMsg);
};

const createTxOuts = (receiverAddress, myAddress, amount, leftOverAmount) => {
  //보낼 아웃풋
  const { TxOut } = require('./transaction')
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
  console.log('/////////////////////////////////');
  console.log(unspentTxOuts);
  console.log('/////////////////////////////////');
  console.log(transactionPool);

  console.log('__________________', _(transactionPool));

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


//트랜잭션 생성
const createTransaction = (receiverAddress, amount, privateKey, unspentTxOuts, txPool) => {
  const { getPublicKey, TxIn, Transaction, signTxIn, getTransactionId } = require('./transaction')
  console.log('\n createTransaction 진입 : 블록 생성시 바디데이터에 코인베이스크랜잭션과 함께 담긴다.');
  const myAddress = getPublicKey(privateKey);

  //ch5
  //uTxO들의 address에서 내 주소와 같은 것들을 골라냄.
  const myUnspentTxOutsA = unspentTxOuts.filter((uTxO) => uTxO.address === myAddress);
  //
  const myUnspentTxOuts = filterTxPoolTxs(myUnspentTxOutsA, txPool);
  console.log('myUnspentTxOuts--', myUnspentTxOuts);

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
  initWallet,
  generatePrivatekey,
  getPrivateFromWallet,
  getPublicFromWallet,
  getBalance,
  createTransaction,
  deleteWallet,
  findUnspentTxOuts
};
