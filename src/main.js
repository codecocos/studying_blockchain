const { Blockchain, Transaction } = require('./blockchain');

let cocoCoin = new Blockchain();

cocoCoin.createTransaction(new Transaction('address1', 'address2', 100));
cocoCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('\n Starting the miner...');
cocoCoin.minePendingTransactions('cocos-address')

console.log('\n Balance of coco is', cocoCoin.getBalanceOfAddress('cocos-address'));

console.log('\n Starting thr miner again...');
cocoCoin.minePendingTransactions('cocos-address')

console.log('\n Balance of coco is', cocoCoin.getBalanceOfAddress('cocos-address'));