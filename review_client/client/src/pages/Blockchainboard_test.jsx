import React, { useState, useEffect } from "react";

import Table from "../components/table/Table";

import axios from "axios";

const Blockchainboard = () => {
  const [blockchain, SetBlockchain] = useState([]);

  useEffect(() => {
    getBlockchain();
  }, []);

  function getBlockchain() {
    axios.post("/api/test/blocks").then((res) => {
      const data = res.data;
      console.log(data.blockchain);
      SetBlockchain(data.blockchain);
      console.log(blockchain);
    });
  }

  console.log(blockchain);

  const mapping = blockchain.map((tx) => tx.data);
  console.log(mapping);

  const blockchainTableHead = [
    "height",
    // "hash",
    // "previousHash",
    "timestamp",
    // "data",
    // "difficulty",
    // "nonce",
    "mined",
    "transaction",
    "size",
  ];

  const renderHead = (item, index) => <th key={index}>{item}</th>;

  const renderBody = (item, index) => (
    <tr key={index}>
      <td>{item.index}</td>
      {/* <td>{item.hash}</td>
      <td>{item.previousHash}</td> */}
      <td>{item.timestamp}</td>
      {/* <td>{item.data}</td>
      <td>{item.difficulty}</td>
      <td>{item.nonce}</td> */}
      <td>a</td>
      <td>a</td>
      <td>a</td>
    </tr>
  );

  return (
    <div>
      <h2 className="page-header">Blockchain</h2>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card__body">
              <Table
                limit="10"
                headData={blockchainTableHead}
                renderHead={(item, index) => renderHead(item, index)}
                bodyData={blockchain}
                renderBody={(item, index) => renderBody(item, index)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blockchainboard;
