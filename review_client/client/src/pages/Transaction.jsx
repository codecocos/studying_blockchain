import React, { useState } from "react";
import axios from "axios";

import { Button, TextField } from "@material-ui/core";

import Table from "../components/table/Table";

import customerList from "../assets/JsonData/customers-list.json";

const Transaction = () => {
  const [myAddress, SetMyAddress] = useState("");

  const [ToAddress, setToAddress] = useState("");
  const [ToAmount, setToAmount] = useState("");

  function getToAddress(event) {
    setToAddress(event.currentTarget.value);
  }
  function getToAmount(event) {
    setToAmount(event.currentTarget.value);
  }

  // axios.post("/api/test/getAddress").then((res) => {
  //   const data = res.data;
  //   SetMyAddress(data);
  // });

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

  const avatarStyle = {
    backgroundColor: "gold",
    color: "#030303",
    margin: "10px",
  };
  ///////////////////////////////////////////////////
  const customerTableHead = [
    "",
    "name",
    "email",
    "phone",
    "total orders",
    "total spend",
    "location",
  ];

  const renderHead = (item, index) => <th key={index}>{item}</th>;

  const renderBody = (item, index) => (
    <tr key={index}>
      <td>{item.id}</td>
      <td>{item.name}</td>
      <td>{item.email}</td>
      <td>{item.phone}</td>
      <td>{item.total_orders}</td>
      <td>{item.total_spend}</td>
      <td>{item.location}</td>
    </tr>
  );

  //////////////////////////////
  return (
    <div>
      <h2 className="page-header">Transaction</h2>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card__body">
              <Table
                limit="10"
                headData={customerTableHead}
                renderHead={(item, index) => renderHead(item, index)}
                bodyData={customerList}
                renderBody={(item, index) => renderBody(item, index)}
              />

              <h4>내 지갑 주소</h4>
              <h4>보내실 주소</h4>
              <TextField
                type={"text"}
                onChange={getToAddress}
                value={ToAddress}
                fullwidth
                required
                style={{ width: "700px" }}
              ></TextField>

              <h4>보내실 양</h4>

              <TextField
                type={"text"}
                onChange={getToAmount}
                value={ToAmount}
                fullwidth
                required
                style={{ width: "700px" }}
              ></TextField>
              <Button
                onClick={sendTransaction}
                size="small"
                style={avatarStyle}
                variant="contained"
              >
                submit
              </Button>

              <h2>서버 응답 결과</h2>
              <div id="writefield"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transaction;
