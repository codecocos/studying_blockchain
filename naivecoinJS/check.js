//0
let unspentTxOuts = processTransactions(blockchain[0].data, [], 0)


const processTransactions = (aTransactions, aUnspentTxOuts, blockIndex) => {
  console.log('\n5.프로세스트랜잭션 진입');
  //0-1
  if (!validateBlockTransactions(aTransactions, aUnspentTxOuts, blockIndex)) {
    console.log('invalid block transactions');
    return null;
  }
  //0-2
  return updateUnspentTxOuts(aTransactions, aUnspentTxOuts);
  // updateUnspentTxOuts(aTransactions, aUnspentTxOuts) 의 최종 리턴값은 resultingUnspentTxOuts
};

const updateUnspentTxOuts = (aTransactions, aUnspentTxOuts) => {
  console.log('\n5.프로세스트랜잭션 통과후 updateUnspentTxOuts 진입');
  console.log('뉴트랜잭션', aTransactions);
  console.log('aUnspentTxOuts', aUnspentTxOuts);
  const newUnspentTxOuts = aTransactions
    .map((t) => {
      return t.txOuts.map((txOut, index) => new UnspentTxOut(t.id, index, txOut.address, txOut.amount));
    })
    .reduce((a, b) => a.concat(b), []);

  const consumedTxOuts = aTransactions
    .map((t) => t.txIns)
    .reduce((a, b) => a.concat(b), [])
    .map((txIn) => new UnspentTxOut(txIn.txOutId, txIn.txOutIndex, '', 0));

  const resultingUnspentTxOuts = aUnspentTxOuts
    .filter(((uTxO) => !findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts)))
    .concat(newUnspentTxOuts);

  return resultingUnspentTxOuts;
};


////
const validateBlockTransactions = (aTransactions, aUnspentTxOuts, blockIndex) => {
  console.log('\n9.validateBlockTransactions 진입');
  const coinbaseTx = aTransactions[0];

  //0-1-1
  if (!validateCoinbaseTx(coinbaseTx, blockIndex)) {
    console.log('invalid coinbase transaction: ' + JSON.stringify(coinbaseTx));
    return false;
  }

  //check for duplicate txIns. Each txIn can be included only once
  const txIns = _(aTransactions)
    .map(tx => tx.txIns)
    .flatten()
    .value();

  //0-1-2
  if (hasDuplicates(txIns)) {
    return false;
  }

  // all but coinbase transactions
  const normalTransactions = aTransactions.slice(1);
  return normalTransactions.map((tx) => validateTransaction(tx, aUnspentTxOuts))
    .reduce((a, b) => (a && b), true);

};

const validateCoinbaseTx = (transaction, blockIndex) => {
  console.log('\n9-1. validateCoinbaseTx 진입');
  if (transaction == null) {
    console.log('the first transaction in the block must be coinbase transaction');
    return false;
  }
  //
  if (getTransactionId(transaction) !== transaction.id) {
    console.log('invalid coinbase tx id: ' + transaction.id);
    return false;
  }
  if (transaction.txIns.length !== 1) {
    console.log('one txIn must be specified in the coinbase transaction');
    return;
  }
  if (transaction.txIns[0].txOutIndex !== blockIndex) {
    console.log('the txIn signature in coinbase tx must be the block height');
    return false;
  }
  if (transaction.txOuts.length !== 1) {
    console.log('invalid number of txOuts in coinbase transaction');
    return false;
  }
  if (transaction.txOuts[0].amount !== COINBASE_AMOUNT) {
    console.log('invalid coinbase amount in coinbase transaction');
    return false;
  }
  console.log('\n9-2. validateCoinbaseTx 통과');
  return true;
};

const getTransactionId = (transaction) => {
  console.log('\n3. 트랜잭션아이디를 코인베이스 트랜잭션의 아이디에 담는다. \n or 9-1-1. 코인베이스 트랜잭션의 아이디가 유효한 ID인지 확인 ');
  const txInContent = transaction.txIns
    .map((txIn) => txIn.txOutId + txIn.txOutIndex)
    .reduce((a, b) => a + b, '');

  const txOutContent = transaction.txOuts
    .map((txOut) => txOut.address + txOut.amount)
    .reduce((a, b) => a + b, '');

  return CryptoJS.SHA256(txInContent + txOutContent).toString();
};

const hasDuplicates = (txIns) => {
  const groups = _.countBy(txIns, (txIn) => txIn.txOutId + txIn.txOutIndex);
  return _(groups)
    .map((value, key) => {
      if (value > 1) {
        console.log('duplicate txIn: ' + key);
        return true;
      } else {
        return false;
      }
    })
    .includes(true);
};

const validateTransaction = (transaction, aUnspentTxOuts) => {

  if (!isValidTransactionStructure(transaction)) {
    return false;
  }

  // 유효한 트랜잭션 ID 인지 확인
  if (getTransactionId(transaction) !== transaction.id) {
    console.log('invalid tx id: ' + transaction.id);
    return false;
  }
  const hasValidTxIns = transaction.txIns
    .map((txIn) => validateTxIn(txIn, transaction, aUnspentTxOuts))
    .reduce((a, b) => a && b, true);

  if (!hasValidTxIns) {
    console.log('some of the txIns are invalid in tx: ' + transaction.id);
    return false;
  }

  //아웃풋의 코인 갯수와 인풋의 코인 갯수도 같은지 확인
  const totalTxInValues = transaction.txIns
    .map((txIn) => getTxInAmount(txIn, aUnspentTxOuts))
    .reduce((a, b) => (a + b), 0);

  const totalTxOutValues = transaction.txOuts
    .map((txOut) => txOut.amount)
    .reduce((a, b) => (a + b), 0);

  if (totalTxOutValues !== totalTxInValues) {
    console.log('totalTxOutValues !== totalTxInValues in tx: ' + transaction.id);
    return false;
  }

  return true;
};

//check all members of class
const isValidTransactionStructure = (transaction) => {
  console.log('\n7. isValidTransactionStructure(단수) 진입');

  if (typeof transaction.id !== 'string') {
    console.log('transactionId missing');
    return false;
  }
  if (!(transaction.txIns instanceof Array)) {
    console.log('invalid txIns type in transaction');
    return false;
  }
  if (!transaction.txIns
    .map(isValidTxInStructure)
    .reduce((a, b) => (a && b), true)) {
    return false;
  }

  if (!(transaction.txOuts instanceof Array)) {
    console.log('invalid txIns type in transaction');
    return false;
  }

  if (!transaction.txOuts
    .map(isValidTxOutStructure)
    .reduce((a, b) => (a && b), true)) {
    return false;
  }
  console.log('\n8. isValidTransactionStructure(단수) 통과');
  return true;
};

const isValidTxInStructure = (txIn) => {
  console.log("\n7-1. isValidTxInStructure 진입");
  if (txIn == null) {
    console.log('txIn is null');
    return false;
  } else if (typeof txIn.signature !== 'string') {
    console.log('invalid signature type in txIn');
    return false;
  } else if (typeof txIn.txOutId !== 'string') {
    console.log('invalid txOutId type in txIn');
    return false;
  } else if (typeof txIn.txOutIndex !== 'number') {
    console.log('invalid txOutIndex type in txIn');
    return false;
  } else {
    console.log("\n7-2. isValidTxInStructure 통과");
    return true;
  }
};