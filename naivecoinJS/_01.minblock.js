//chapter1 , chapter2
app.post('/mineBlock', (req, res) => {
  const newBlock = generateNextBlock(req.body.data);
  res.send(newBlock);
});

//chapter3
app.post('/mineBlock', (req, res) => {
  if (req.body.data == null) {
    res.send('data parameter is missing');
    return;
  }
  const newBlock = generateNextBlock(req.body.data);
  if (newBlock === null) {
    res.status(400).send('could not generate block');
  } else {
    res.send(newBlock);
  }
});

//chapter4, chapter5
app.post('/mineBlock', (req, res) => {
  const newBlock = generateNextBlock();
  if (newBlock === null) {
    res.status(400).send('could not generate block');
  } else {
    res.send(newBlock);
  }
});

