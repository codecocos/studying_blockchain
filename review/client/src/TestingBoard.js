import axios from 'axios';

function TestingBoard() {
  function block() {
    axios.post("/test/blocks").then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }
  function mineBlock() {
    axios.post("/test/mineBlock").then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }
  function initWallet() {
    axios.post("/test/initWallet").then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }
  function getAddress() {
    axios.post("/test/getAddress").then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }

  function socketOn() {
    axios.post('/test/socketOn').then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    })
  }

  function peers() {
    axios.post("/test/peers").then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }

  function addPeer() {
    const socketAddress = {
      address: 'ws://127.0.0.1:6001'
    }

    axios.post("/test/addPeer", socketAddress).then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }

  function balance() {
    axios.post("/test/balance").then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }


  return (
    <div>
      <h2>테스트 코드</h2>
      <ol>
        <li>
          <button id="blocks" onClick={() => block()}>
            get blocks
          </button>
        </li>
        <li>
          <button id="mineBlock" onClick={() => mineBlock()}>
            mineBlock(바디데이터 입력 없는 경우)
          </button>
        </li>
        <li>
          <button id="initWallet" onClick={() => initWallet()}>
            initWallet
          </button>
        </li>
        <li>
          <button id="getAddress" onClick={() => getAddress()}>
            getAddress
          </button>
        </li>
        <li>
          <button id="socketOn" onClick={() => socketOn()}>
            socketOn
          </button>
        </li>
        <li>
          <button id="peers" onClick={() => peers()}>
            peers
          </button>
        </li>
        <li>
          <button id="peers" onClick={() => addPeer()}>
            addPeer
          </button>
        </li>
        <li>
          <button id="balance" onClick={() => balance()}>
            balance
          </button>
        </li>
      </ol>
      <div id="writefield"></div>
    </div>
  );
}

export default TestingBoard;
