//chapter1
const calculateHashForBlock = (block) =>
  calculateHash(block.index, block.previousHash, block.timestamp, block.data);


///////////////////////////////////////////////////////////

//chapter2, chapter3, chapter4, chapter5
const calculateHashForBlock = (block) =>
  calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.difficulty, block.nonce);

//chapter2, chapter3, chapter4, chapter5
const hashMatchesBlockContent = (block) => {
  const blockHash = calculateHashForBlock(block);
  return blockHash === block.hash;
};