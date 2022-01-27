const CryptoJS = require('crypto-js');
const ecdsa = require('elliptic');
const _ = require('lodash');

const ec = new ecdsa.ec('secp256k1');

//코인베이스 트랜잭션 : 오직 아웃풋만을 포함, 노드의 첫 트랜잭션
//코인베이스 아웃풋의 양
const COINBASE_AMOUNT = 50;

class UnspentTxOut {
    constructor(txOutId, txOutIndex, address, amount) {
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
        this.address = address;
        this.amount = amount;
    }
}

//항상 unspent transaction outputs을 참조
class TxIn {
    constructor(txOutId, txOutIndex, signature) {
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
        this.signature = signature;
    }
}

class TxOut {
    constructor(address, amount) {
        this.address = address;
        this.amount = amount;
    }
}

class Transaction {
    constructor(id, txIns, txOuts) {
        this.id = id;
        this.txIns = txIns;
        this.txOuts = txOuts;
    }
}

const getTransactionId = (transaction) => {
    console.log('\n3. 트랜잭션아이디를 코인베이스 트랜잭션의 아이디에 담는다. \n or 9-1-1. 코인베이스 트랜잭션의 아이디가 유효한 ID인지 확인 ');
    const txInContent = transaction.txIns
        .map((txIn) => txIn.txOutId + txIn.txOutIndex)
        .reduce((a, b) => a + b, '');
    console.log('', txInContent);

    const txOutContent = transaction.txOuts
        .map((txOut) => txOut.address + txOut.amount)
        .reduce((a, b) => a + b, '');

    return CryptoJS.SHA256(txInContent + txOutContent).toString();
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

const validateBlockTransactions = (aTransactions, aUnspentTxOuts, blockIndex) => {
    console.log('\n9.validateBlockTransactions 진입');
    const coinbaseTx = aTransactions[0];
    console.log('\n222222222222', coinbaseTx);

    if (!validateCoinbaseTx(coinbaseTx, blockIndex)) {
        console.log('invalid coinbase transaction: ' + JSON.stringify(coinbaseTx));
        return false;
    }

    //check for duplicate txIns. Each txIn can be included only once
    const txIns = _(aTransactions)
        .map(tx => tx.txIns)
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

//코인베이스 트랜잭션 유효성 검사
const validateCoinbaseTx = (transaction, blockIndex) => {
    console.log('333333333333', transaction);
    console.log('\n9-1. validateCoinbaseTx 진입');
    if (transaction == null) {
        console.log('the first transaction in the block must be coinbase transaction');
        return false;
    }
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

//txIns의 서명도 사용되지 않은 아웃풋을 잘 참조하고 있는지 확인
const validateTxIn = (txIn, transaction, aUnspentTxOuts) => {
    const referencedUTxOut =
        aUnspentTxOuts.find((uTxO) => uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex);
    if (referencedUTxOut == null) {
        console.log('referenced txOut not found: ' + JSON.stringify(txIn));
        return false;
    }
    const address = referencedUTxOut.address;

    const key = ec.keyFromPublic(address, 'hex');
    //chapter3
    //return key.verify(transaction.id, txIn.signature);

    //chapter4
    const validSignature = key.verify(transaction.id, txIn.signature);
    if (!validSignature) {
        console.log('invalid txIn signature: %s txId: %s address: %s', txIn.signature, transaction.id, referencedUTxOut.address);
        return false;
    }
    return true;

};

const getTxInAmount = (txIn, aUnspentTxOuts) => {
    return findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts).amount;
};

const findUnspentTxOut = (transactionId, index, aUnspentTxOuts) => {
    console.log('\n?.findUnspentTxOut 진입');
    return aUnspentTxOuts.find((uTxO) => uTxO.txOutId === transactionId && uTxO.txOutIndex === index);
};

//코인베이스 트랜잭션 : 노드의 첫 트랜잭션
const getCoinbaseTransaction = (address, blockIndex) => {
    console.log("\n2. 코인베이스 트랜잭션 진입");
    const t = new Transaction();
    const txIn = new TxIn();
    txIn.signature = "";
    txIn.txOutId = "";
    txIn.txOutIndex = blockIndex;

    t.txIns = [txIn];
    t.txOuts = [new TxOut(address, COINBASE_AMOUNT)];
    t.id = getTransactionId(t);
    return t;
};

const signTxIn = (transaction, txInIndex,
    privateKey, aUnspentTxOuts) => {
    const txIn = transaction.txIns[txInIndex];

    const dataToSign = transaction.id;
    const referencedUnspentTxOut = findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts);
    if (referencedUnspentTxOut == null) {
        console.log('could not find referenced txOut');
        throw Error();
    }
    const referencedAddress = referencedUnspentTxOut.address;

    if (getPublicKey(privateKey) !== referencedAddress) {
        console.log('trying to sign an input with private' +
            ' key that does not match the address that is referenced in txIn');
        throw Error();
    }
    const key = ec.keyFromPrivate(privateKey, 'hex');
    const signature = toHexString(key.sign(dataToSign).toDER());

    return signature;
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

const processTransactions = (aTransactions, aUnspentTxOuts, blockIndex) => {
    console.log('\n1111111111111111', aTransactions);
    console.log('\n5.프로세스트랜잭션 진입');

    if (!validateBlockTransactions(aTransactions, aUnspentTxOuts, blockIndex)) {
        console.log('invalid block transactions');
        return null;
    }
    return updateUnspentTxOuts(aTransactions, aUnspentTxOuts);
    // updateUnspentTxOuts(aTransactions, aUnspentTxOuts) 의 최종 리턴값은 resultingUnspentTxOuts
};

const toHexString = (byteArray) => {
    return Array.from(byteArray, (byte) => {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
};

const getPublicKey = (aPrivateKey) => {
    return ec.keyFromPrivate(aPrivateKey, 'hex').getPublic().encode('hex');
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

const isValidTxOutStructure = (txOut) => {
    console.log('\n7-3. isValidTxOutStructure 진입');
    if (txOut == null) {
        console.log('txOut is null');
        return false;
    } else if (typeof txOut.address !== 'string') {
        console.log('invalid address type in txOut');
        return false;
    } else if (!isValidAddress(txOut.address)) {
        console.log('invalid TxOut address');
        return false;
    } else if (typeof txOut.amount !== 'number') {
        console.log('invalid amount type in txOut');
        return false;
    } else {
        console.log('\n7-4. isValidTxOutStructure 통과');
        return true;
    }
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

//valid address is a valid ecdsa public key in the 04 + X-coordinate + Y-coordinate format
const isValidAddress = (address) => {
    console.log("\n7-3-1.isValidAddress 진입 \n or 2. 보낼 주소가 유효한 주소인지 확인");
    if (address.length !== 130) {
        console.log(address);
        console.log('invalid public key length');
        return false;
    } else if (address.match('^[a-fA-F0-9]+$') === null) {
        console.log('public key must contain only hex characters');
        return false;
    } else if (!address.startsWith('04')) {
        console.log('public key must start with 04');
        return false;
    }
    console.log("\n7-3-2.isValidAddress 통과");
    return true;
};

module.exports = {
    processTransactions, signTxIn, getTransactionId, isValidAddress, validateTransaction,
    UnspentTxOut, TxIn, TxOut, getCoinbaseTransaction, getPublicKey, hasDuplicates,
    Transaction
}
