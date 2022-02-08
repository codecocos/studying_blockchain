//chapter3, chapter4
const processTransactions = (aTransactions, aUnspentTxOuts, blockIndex) => {

  if (!isValidTransactionsStructure(aTransactions)) {
    return null;
  }

  if (!validateBlockTransactions(aTransactions, aUnspentTxOuts, blockIndex)) {
    console.log('invalid block transactions');
    return null;
  }
  return updateUnspentTxOuts(aTransactions, aUnspentTxOuts);
};

//chapter 5
const processTransactions = (aTransactions, aUnspentTxOuts, blockIndex) => {

  //첫번째 if문 제거

  if (!validateBlockTransactions(aTransactions, aUnspentTxOuts, blockIndex)) {
    console.log('invalid block transactions');
    return null;
  }
  return updateUnspentTxOuts(aTransactions, aUnspentTxOuts);
};


/////////////////////

//chapter4 , chapter5
const validateBlockTransactions = (aTransactions, aUnspentTxOuts, blockIndex) => {
  const coinbaseTx = aTransactions[0];
  if (!validateCoinbaseTx(coinbaseTx, blockIndex)) {
    console.log('invalid coinbase transaction: ' + JSON.stringify(coinbaseTx));
    return false;
  }

  // check for duplicate txIns. Each txIn can be included only once
  const txIns = _(aTransactions)
    .map((tx) => tx.txIns)
    .flatten()
    .value();

  if (hasDuplicates(txIns)) {
    return false;
  }

  // all but coinbase transactions
  const normalTransactions = aTransactions.slice(1);
  return normalTransactions.map((tx) => validateTransaction(tx, aUnspentTxOuts))
    .reduce((a, b) => (a && b), true);

};