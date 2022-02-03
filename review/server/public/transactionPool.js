const _ = require('lodash');
const { validateTransaction } = require('./transaction');

let transactionPool = [];

// 트랜잭션 풀을 깊은 복사하여 트랜재션 풀 배열을 리턴한다.
const getTransactionPool = () => {
    return _.cloneDeep(transactionPool);
};

const addToTransactionPool = (tx, unspentTxOuts) => {

    //트랜잭션이 유효하지 않다면 에러문구
    if (!validateTransaction(tx, unspentTxOuts)) {
        throw Error('Trying to add invalid tx to pool');
    }

    //
    if (!isValidTxForPool(tx, transactionPool)) {
        throw Error('Trying to add invalid tx to pool');
    }
    console.log('adding to txPool: %s', JSON.stringify(tx));
    transactionPool.push(tx);
};

const hasTxIn = (txIn, unspentTxOuts) => {
    const foundTxIn = unspentTxOuts.find((uTxO) => {
        return uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex;
    });
    return foundTxIn !== undefined;
};

const updateTransactionPool = (unspentTxOuts) => {
    const invalidTxs = [];
    for (const tx of transactionPool) {
        for (const txIn of tx.txIns) {
            if (!hasTxIn(txIn, unspentTxOuts)) {
                invalidTxs.push(tx);
                break;
            }
        }
    }
    if (invalidTxs.length > 0) {
        console.log('removing the following transactions from txPool: %s', JSON.stringify(invalidTxs));
        transactionPool = _.without(transactionPool, ...invalidTxs);
    }
};

//트랜잭션 풀에서 트랜잭션 인풋 불러오기
const getTxPoolIns = (aTransactionPool) => {
    //aTransactionPool은 트랜잭션 클래스 모음집 
    return _(aTransactionPool)
        //트랜잭션 클래스 에서 txIns 만을 가져온다.
        .map((tx) => tx.txIns)
        //[ [],[],[] ] : 2차원 배열 구조이므로, flatten 함수를 이용하여 , [] 1차원 배열로 만든다.
        .flatten()
        // 위 의 값을 가져온다.
        .value();
};

const isValidTxForPool = (tx, aTtransactionPool) => {

    //getTxPoolIns : 트랜잭션 풀에서 각 트랜잭션들의 txIns 값만 하나의 배열로 가져오는 함수
    const txPoolIns = getTxPoolIns(aTtransactionPool);

    const containsTxIn = (txIns, txIn) => {
        //txPoolIns 에서 뒤의
        console.log('//////txIn', txIn);
        console.log('//////txIns', txIns);
        return _.find(txIns, ((txPoolIn) => {
            return txIn.txOutIndex === txPoolIn.txOutIndex && txIn.txOutId === txPoolIn.txOutId; // 리턴값의 타입은 불리언
        }));
    };

    for (const txIn of tx.txIns) {
        if (containsTxIn(txPoolIns, txIn)) {
            console.log('txIn already found in the txPool');
            return false;
        }
    }
    //위의 과정을 모두 통과하면 유효한 트랜잭션임이 증명됨.
    return true;
};

module.exports = { addToTransactionPool, getTransactionPool, updateTransactionPool };
