import React, { useState, useEffect } from "react";
import axios from "axios";

import blockchain from "../assets/JsonData/blockchain.json";

import Table from "../components/table/Table";
import CustomInput from "../components/customInput/CumstomInput";
import CustomButton from "../components/customButton/CustomButton";

const Transaction = () => {
  const [myAddress, SetMyAddress] = useState("");
  const [myBalance, SetMyBalance] = useState("");

  const [ToAddress, setToAddress] = useState("");
  const [ToAmount, setToAmount] = useState("");

  useEffect(() => {
    axios.post("/api/test/getAddress").then((res) => {
      const data = res.data;
      SetMyAddress(data.address);
    });
    axios.post("/api/test/balance").then((res) => {
      const data = res.data;
      SetMyBalance(data.balance);
    });
  }, [myBalance]);

  function getToAddress(event) {
    setToAddress(event.currentTarget.value);
  }
  function getToAmount(event) {
    setToAmount(event.currentTarget.value);
  }

  function sendTransaction() {
    axios
      .post("/api/test/sendTransaction", {
        address: ToAddress,
        amount: ToAmount,
      })
      .then((res) => {
        const data = res.data;
        console.log("클라이언트가 받은 데이터 : ", data);
        document.getElementById("writefield").innerText = JSON.stringify(data);
      });
  }

  ///////////////////////////////////////////////////
  const blockchainTableHead = [
    "index",
    "hash",
    "previousHash",
    "timestamp",
    "data",
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
      <td>{item.data}</td>
      <td>{item.difficulty}</td>
      <td>{item.nonce}</td>
    </tr>
  );

  //////////////////////////////
  return (
    <div>
      <h2 className="page-header">Transaction</h2>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card__title">Address</div>
            <div className="card__text">{myAddress}</div>
            <div className="card__title">Balance</div>
            <div className="card__text">{myBalance}</div>
            <div className="col-11">
              <div className="row">
                <CustomInput
                  type={"text"}
                  placeholder={"보내실 양을 입력하세요."}
                  onChange={getToAmount}
                  value={ToAmount}
                />
                <CustomInput
                  type={"text"}
                  placeholder={"보내실 주소를 입력하세요."}
                  onChange={getToAddress}
                  value={ToAddress}
                  required
                />
                <CustomButton
                  type={"submit"}
                  content={"Send Transaction"}
                  onClick={sendTransaction}
                />
              </div>
            </div>
            <div className="card__title">Transaction Pool</div>
            <Table
              limit="3"
              headData={blockchainTableHead}
              renderHead={(item, index) => renderHead(item, index)}
              bodyData={blockchain}
              renderBody={(item, index) => renderBody(item, index)}
            />
            <h2>서버 응답 결과</h2>
            <div id="writefield"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transaction;
