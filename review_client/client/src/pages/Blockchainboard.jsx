import React, { useState, useEffect } from "react";

import Table from "../components/table/Table";

import axios from "axios";

const Blockchainboard = () => {
  const [blockchain, SetBlockchain] = useState([]);
  const reverseBlockchian = [...blockchain].reverse(); //배열 뒤집기

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

  const blockchainTableHead = [
    "index",
    "hash",
    "previousHash",
    "timestamp",
    // "data",
    "difficulty",
    "nonce",
  ];

  const renderHead = (item, index) => <th key={index}>{item}</th>;

  const renderBody = (item, index) => (
    <tr key={index}>
      <td>{item.index}</td>
      <td>{item.hash}</td>
      <td>{item.previousHash}</td>
      <td>{item.timestamp}</td>
      {/* <td>{item.data}</td> */}
      <td>{item.difficulty}</td>
      <td>{item.nonce}</td>
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
                bodyData={reverseBlockchian}
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
