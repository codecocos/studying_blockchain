const CryptoJS = require('crypto-js');
const ecdsa = require('elliptic');
const _ = require('lodash');

const ec = new ecdsa.ec('secp256k1');

//코인베이스 트랜잭션 : 오직 아웃풋만을 포함, 노드의 첫 트랜잭션
//코인베이스 아웃풋의 양
const COINBASE_AMOUNT = 50;

class UnspentTxOut {
    constructor(txOutId, txOutIndex, address, amount) {
        this.txOutId = txOutId; //txIns.txOutId
        this.txOutIndex = txOutIndex; //txIns.txOutIndex
        this.address = address; //txOuts.address
        this.amount = amount; //txOuts.amount
    }
}

// 항상 unspent transaction outputs을 참조
// txIn 는 이전의 txOut 을 참조
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
        this.id = id; // 트랜잭션의 아이디
        this.txIns = txIns; // (txOutId, txOutIndex, signature)
        this.txOuts = txOuts; // (address, amount)
    }
}

// Transaction 클래스의 id 값을 계산.
const getTransactionId = (transaction) => {
    // Transaction 클래스의 txIns 배열의
    const txInContent = transaction.txIns
        // Transaction 클래스의 txIns 배열에 들어가는 내용인 TxIn 클래스의 txOutId와 txOutIndex를 값을 순서대로 나열한것을 배열에 담아 반환
        .map((txIn) => txIn.txOutId + txIn.txOutIndex)
        // 배열로 반환 받은 값을 스트링 값으로 받아옴
        .reduce((a, b) => a + b, '');

    const txOutContent = transaction.txOuts
        .map((txOut) => txOut.address + txOut.amount)
        .reduce((a, b) => a + b, '');

    return CryptoJS.SHA256(txInContent + txOutContent).toString();
};

const validateTransaction = (transaction, aUnspentTxOuts) => {

    //ch5 추가
    if (!isValidTransactionStructure(transaction)) {
        return false;
    }

    // 유효한 트랜잭션 ID 인지 확인
    // 트랜잭션의 아이디를 직접 계산한 결과와 현재의 트랜잭션 아이디 값이 같은지 검증
    if (getTransactionId(transaction) !== transaction.id) {
        console.log('invalid tx id: ' + transaction.id);
        return false;
    }

    //트랜잭션아이디 유효성 검사를 통과한 트랜잭션의 txIns
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

    if (!validateCoinbaseTx(coinbaseTx, blockIndex)) {
        console.log('invalid coinbase transaction: ' + JSON.stringify(coinbaseTx));
        return false;
    }

    //check for duplicate txIns. Each txIn can be included only once
    const txIns = _(aTransactions)
        .map(tx => tx.txIns)
        .flatten()
        .value();

    //txIn 는 이전의 txOut 을 참조하는데,txIn 가 txOut 을 2개이상 참조하면 안되므로 검증 과정을 거친다.
    //hasDuplicates(txIns)의 리턴값이 true면, false를 리턴해라.
    //txInContent(=txIn.txOutId + txIn.txOutIndex) 가 1개가 아닌 경우 false 리턴
    if (hasDuplicates(txIns)) {
        return false;
    }

    // all but coinbase transactions
    const normalTransactions = aTransactions.slice(1);

    return normalTransactions.map((tx) => validateTransaction(tx, aUnspentTxOuts))
        .reduce((a, b) => (a && b), true);

};

const hasDuplicates = (txIns) => {

    //Transaction 클래스의 txIns 배열을 인자로 받아, txIn의 txOutId와 txOutIndex 를 단순 나열한 값이 txIns 배열에 몇개 있는 지 확인
    const groups = _.countBy(txIns, (txIn) => txIn.txOutId + txIn.txOutIndex); // _.countBy의 결과 형식 : {'key': value }

    return _(groups)
        .map((value, key) => {
            // value는 전체 배열에서 key가 중복된 횟수를 의미, 
            //value 가 1보다 크면 참인 경우 이므로, true 를 반환
            if (value > 1) {
                console.log('duplicate txIn: ' + key);
                return true;
                //value 가 1 이거나 1 보다 작은 경우, false 를 반환
            } else {
                return false;
            }
        })
        //앞선 배열이 true 값을 포함하고 있으면 true 반환, true를 포함하고 있지 않으면 false 반환
        //value가 1보다 큰 경우 true, value가 1이거나 1보다 작은 경우 false를 반환.
        .includes(true);
};

//코인베이스 트랜잭션 유효성 검사
const validateCoinbaseTx = (transaction, blockIndex) => {
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

    //참조된 UTXO
    const referencedUTxOut =
        //조건에 맞는 값 중 첫번째 값을 리턴, 만약 배열에 조건을 만족하는 값이 없으면 undefined를 리턴
        aUnspentTxOuts.find((uTxO) => uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex);

    console.log('referencedUTxOut', referencedUTxOut);

    if (referencedUTxOut == null) {
        console.log('referenced txOut not found: ' + JSON.stringify(txIn));
        return false;
    }

    //참조된 UTXO의 주소
    const address = referencedUTxOut.address;

    //keyFromPublic : 참조된 UTXO의 address(publicKey)를 16진수의 수로 가져온다.
    const key = ec.keyFromPublic(address, 'hex');
    //chapter3
    //return key.verify(transaction.id, txIn.signature);

    //chapter4
    //가져온 주소를 트랜잭션의 아이디와 트랜잭션의 인풋의 서명과 일치하는 지?
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

//aTransactions 을 aUnspentTxOuts 에 추가 한다
const updateUnspentTxOuts = (aTransactions, aUnspentTxOuts) => {
    console.log('\n5.프로세스트랜잭션 통과후 updateUnspentTxOuts 진입');
    console.log('잭션', aTransactions);
    console.log('aUnspentTxOuts', aUnspentTxOuts);
    const newUnspentTxOuts = aTransactions
        .map((t) => {
            //return 트랜잭션 클래스의 트랜잭션 아웃풋스            (txOutId, txOutIndex, address, amount)
            //                                         (트랜잭션 클래스의 아이디, 인덱스, 트랜잭션 클래스의 트랜잭션아웃풋스의 주소와, 양)
            return t.txOuts.map((txOut, index) => new UnspentTxOut(t.id, index, txOut.address, txOut.amount));
        })
        //.reduce((누적값, 현재값) => 결과, 초깃값);
        //.reduce((a, b) => a와 배열과 b배열을 합쳐서 하나의 배열을 리턴함, []이 초기값에서 누적이 시작됨);
        .reduce((a, b) => a.concat(b), []);

    console.log('/////////////////////////////newUnspentTxOuts');
    console.log(newUnspentTxOuts);

    const consumedTxOuts = aTransactions
        .map((t) => t.txIns)
        .reduce((a, b) => a.concat(b), [])
        .map((txIn) => new UnspentTxOut(txIn.txOutId, txIn.txOutIndex, '', 0)); //어드래스: '', 양 : 0
    console.log('/////////////////////////////consumedTxOuts');
    console.log(consumedTxOuts);


    const resultingUnspentTxOuts = aUnspentTxOuts
        .filter(((uTxO) => !findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts)))
        .concat(newUnspentTxOuts);
    console.log('/////////////////////////////resultingUnspentTxOuts');
    console.log(resultingUnspentTxOuts);
    return resultingUnspentTxOuts;
};

const processTransactions = (aTransactions, aUnspentTxOuts, blockIndex) => {
    console.log('\n5.프로세스트랜잭션 진입');
    //ch5에서 삭제
    // if (!isValidTransactionsStructure(aTransactions)) {
    //     return null;
    // }

    if (!validateBlockTransactions(aTransactions, aUnspentTxOuts, blockIndex)) {
        console.log('invalid block transactions');
        return null;
    }
    return updateUnspentTxOuts(aTransactions, aUnspentTxOuts);
};

const toHexString = (byteArray) => {
    return Array.from(byteArray, (byte) => {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
};

const getPublicKey = (aPrivateKey) => {
    return ec.keyFromPrivate(aPrivateKey, 'hex').getPublic().encode('hex');
};

//TxIn 구조 유효성 검사
const isValidTxInStructure = (txIn) => {
    console.log("\n7-1. isValidTxInStructure 진입");
    //입력값이 없을 때
    if (txIn == null) {
        console.log('txIn is null');
        return false;
        // TxIn의 signature의 형식이 스트링이 아닐 때
    } else if (typeof txIn.signature !== 'string') {
        console.log('invalid signature type in txIn');
        return false;
        // TxIn의 txOutId 형식이 스트링이 아닐 때
    } else if (typeof txIn.txOutId !== 'string') {
        console.log('invalid txOutId type in txIn');
        return false;
        // TxIn의 txOutIndex의 형식이 숫자가 아닐 때
    } else if (typeof txIn.txOutIndex !== 'number') {
        console.log('invalid txOutIndex type in txIn');
        return false;
    } else {
        console.log("\n7-2. isValidTxInStructure 통과");
        return true;
    }
};

//TxOut 구조 유효성 검사
const isValidTxOutStructure = (txOut) => {
    console.log('\n7-3. isValidTxOutStructure 진입');
    //입력값이 없을 때
    if (txOut == null) {
        console.log('txOut is null');
        return false;
        //TxOut 클래스의 address 형식이 스트링이 아닐 때
    } else if (typeof txOut.address !== 'string') {
        console.log('invalid address type in txOut');
        return false;
        //isValidAddress 의 리턴값이 false인 경우
    } else if (!isValidAddress(txOut.address)) {
        console.log('invalid TxOut address');
        return false;
        //TxOut 클래스의 amount 형식이 숫자가 아닐 때
    } else if (typeof txOut.amount !== 'number') {
        console.log('invalid amount type in txOut');
        return false;
    } else {
        console.log('\n7-4. isValidTxOutStructure 통과');
        return true;
    }
};

//ch5에서 삭제
// const isValidTransactionsStructure = (transactions) => {
//     console.log("\n6. isValidTransactionsStructure(복수) 진입");
//     return transactions
//         .map(isValidTransactionStructure)
//         .reduce((a, b) => (a && b), true);
// };

//check all members of class
const isValidTransactionStructure = (transaction) => {
    console.log('\n7. isValidTransactionStructure(단수) 진입');

    //Transaction 클래스의 id의 타입이 스트링일 때
    if (typeof transaction.id !== 'string') {
        console.log('transactionId missing');
        return false;
    }
    //Transaction 클래스의 txIns가 배열이 아닐 경우
    //instanceof : 개체가 특정 클래스의 인스턴스인지 여부를 나타내는 boolean값으로 반환하는 비교연산자
    if (!(transaction.txIns instanceof Array)) {
        console.log('invalid txIns type in transaction');
        return false;
    }

    //Transaction 클래스의 txIns는 배열
    if (!transaction.txIns
        //isValidTxInStructure 의 리턴값 만을 배열로 하여,
        .map(isValidTxInStructure)
        //a와 배열과 b배열을 합쳐서 모든 엘리먼트의 값이 트루인경우 에 트루를 반환하도록 함.
        //근데 반환 값이 !true인 경우를 의미 하므로 false인 경우에,
        .reduce((a, b) => (a && b), true)) {
        // false를 리턴한다.
        return false;
    }

    //Transaction 클래스의 txOuts 배열이 아닐 경우
    if (!(transaction.txOuts instanceof Array)) {
        console.log('invalid txIns type in transaction');
        return false;
    }

    //Transaction 클래스의 txOuts는 배열
    if (!transaction.txOuts
        //isValidTxInStructure 의 리턴값 만을 배열로 하여,
        .map(isValidTxOutStructure)
        //a와 배열과 b배열을 합쳐서 모든 엘리먼트의 값이 트루인경우 에 트루를 반환하도록 함.
        //근데 반환 값이 !true인 경우를 의미 하므로 false인 경우에,
        .reduce((a, b) => (a && b), true)) {
        // false를 리턴한다.
        return false;

        //transaction.txIns가 배열이자나, 
        //transaction.txIns의 각 요소를 isValidTxInStructure에 넣으면 false 혹은 true 결과나오는데, 
        //그 결과 모두가 true인 경우 true 반환, 그중 하나라도 false 인 경우 false 반환
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
    processTransactions, signTxIn, getTransactionId, isValidAddress,
    UnspentTxOut, TxIn, TxOut, getCoinbaseTransaction, getPublicKey,
    Transaction, validateTransaction
}
