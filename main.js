const SHA256 = require("crypto-js/sha256");

class Block {
  constructor(index, timestamps, data, previousHash = '') {
    this.index = index;
    this.timestamps = timestamps;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return SHA256(this.index + this.previousHash + this.timestamps + JSON.stringify(this.data)).toString();
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, "12/26/2021", "Genesis block", "0");
  }

  getLastesBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLastesBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  isChainValid() {
    for (let i = 1; i < this.chain; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

let cocoCoin = new Blockchain();

cocoCoin.addBlock(new Block(1, "12/31/2021", { amount: 4 }))
cocoCoin.addBlock(new Block(2, "01/01/2022", { amount: 10 }))

console.log(JSON.stringify(cocoCoin, null, 4));

console.log('Is blockchain valid?' + cocoCoin.isChainValid());
