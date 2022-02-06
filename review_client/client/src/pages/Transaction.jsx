import React, { useState, useEffect } from "react";
import axios from "axios";

import CustomInput from "../components/customInput/CumstomInput";
import CustomButton from "../components/customButton/CustomButton";

const Transaction = () => {
  const [myAddress, SetMyAddress] = useState("");
  const [myBalance, SetMyBalance] = useState("");
  const [ToAddress, setToAddress] = useState("");
  const [ToAmount, setToAmount] = useState("");
  const [transactionPool, setTransactionPool] = useState([]);
  const [transaction, setTransaction] = useState([]);

  // const txIns = transaction.txins || [];
  // const txOuts = transaction.txOuts || [];

  useEffect(() => {
    getMyAddress();
    getMyBalance();
    getTransactionPool();
  }, [myBalance]);

  function getMyAddress() {
    axios.post("/api/test/getAddress").then((res) => {
      const data = res.data;
      SetMyAddress(data.address);
    });
  }

  function getMyBalance() {
    axios.post("/api/test/balance").then((res) => {
      const data = res.data;
      SetMyBalance(data.balance);
    });
  }

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
        setTransaction(data);
      });
    getTransactionPool();
  }

  function mineTransactionPool() {
    axios.post("/api/test/mineBlock").then((res) => {});

    getMyBalance();
    getTransactionPool();
  }

  function getTransactionPool() {
    axios.post("/api/test/transactionPool").then((res) => {
      const transactionPool = res.data.transactionPool;

      setTransactionPool(transactionPool);
    });
  }

  const renderTxIns = (item, index) => (
    <div key={index}>
      <br />
      <div className="row">
        <div className="col-1-1">
          <strong>txOutId</strong>
        </div>
        <div className="col-10">{item.txOutId}</div>
      </div>
      <div className="row">
        <div className="col-1-1">
          <strong>txOutIndex</strong>
        </div>
        <div className="col-10">{item.txOutIndex}</div>
      </div>
      <div className="row">
        <div className="col-1-1">
          <strong>signature</strong>
        </div>
        <div className="col-10">{item.signature}</div>
      </div>
      <br />
    </div>
  );
  const renderTxOuts = (item, index) => (
    <div key={index}>
      <br />
      <div className="row">
        <div className="col-1-1">
          <strong>address</strong>
        </div>
        <div className="col-10">{item.address}</div>
      </div>
      <div className="row">
        <div className="col-1-1">
          <strong>amount</strong>
        </div>
        <div className="col-10">{item.amount}</div>
      </div>
      <br />
    </div>
  );

  const renderTxPool = (item, index) => (
    <div className="card_1">
      <div key={index}>
        <br />
        <div className="row">
          <div className="col-1-1">
            <div className="card__title__2">id</div>
          </div>
          <div className="col-10">{item.id}</div>
        </div>
        <br />
        <div>
          <div className="card__title__2">txIns</div>
          {item.txIns.map((item, index) => renderTxIns(item, index))}
        </div>
        <div>
          <div className="card__title__2">txOuts</div>
          {item.txOuts.map((item, index) => renderTxOuts(item, index))}
        </div>
        <br />
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="page-header">Transaction</h2>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card__title">Address</div>
            <div className="card__text">{myAddress}</div>
            <div className="card__title">Balance : {myBalance}</div>
            <div className="card__text"></div>
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
              </div>
            </div>
            <div className="col-11">
              <div className="row">
                <CustomButton
                  type={"submit"}
                  content={"Send Transaction"}
                  onClick={sendTransaction}
                />
                <CustomButton
                  type={"submit"}
                  content={"Mine Transaction Pool"}
                  onClick={mineTransactionPool}
                />
                {/* <CustomButton
                  type={"submit"}
                  content={"Get Transaction Pool"}
                  onClick={getTransactionPool}
                /> */}
              </div>
            </div>

            {/* <div className="card__title">방금 전송한 트랜잭션</div>
            <div className="card_1">
              <div className="card__text">id</div>
              <div className="card__text">{transaction.id}</div>
              <div className="card__text">
                txIns{txIns.map((item, index) => renderTxIns(item, index))}
              </div>
              <div className="card__text">
                txOuts{txOuts.map((item, index) => renderTxOuts(item, index))}
              </div>
            </div> */}
            <div className="card__title">Transaction Pool</div>
            <div className="card__text">
              {transactionPool.map((item, index) => renderTxPool(item, index))}
            </div>
            {/* <div className="card__title">서버 응답 결과</div>
            <div id="writefield"></div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transaction;
