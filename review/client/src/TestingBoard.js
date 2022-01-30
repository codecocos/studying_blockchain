import axios from 'axios';


function TestingBoard() {

  function block() {
    axios.post(`/api/test/blocks`).then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }
  function mineBlock() {
    axios.post(`/api/test/mineBlock`).then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }
  function mineRawBlock() {
    const mineRaw = prompt("바디에 담기는 데이터", '{\"data\" : [{\"txIns\":[{\"signature\":\"\",\"txOutId\":\"\",\"txOutIndex\":1}],\"txOuts\":[{\"address\":\"04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a\",\"amount\":50}],\"id\":\"f089e8113094fab66b511402ecce021d0c1f664a719b5df1652a24d532b2f749\"}]}')

    axios.post(`/api/test/mineRawBlock`, { data: mineRaw }).then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }
  function initWallet() {
    axios.post(`/api/test/initWallet`).then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }
  function getAddress() {
    axios.post(`/api/test/getAddress`).then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }

  function socketOn() {
    //const socketNumber = prompt('개설하실 소켓넘버를 입력하세요.', '6001')
    // { data: socketNumber }
    axios.post(`/api/test/socketOn`).then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    })
  }

  function peers() {
    axios.post(`/api/test/peers`).then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }

  function addPeer() {
    const socketAddress = prompt('접속하실 소켓주소를 입력하세요', 'ws://127.0.0.1:6001')

    axios.post(`/api/test/addPeer`, { data: socketAddress }).then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }

  function balance() {
    axios.post(`/api/test/balance`).then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }

  function mineTransaction() {
    const address = prompt('보낼주소는?', "04ac435d37f7aecf7d6d22ca774648c3e3704cd1dfba9901ea8f16574532d3bae770b4f21691e477098c50ddfd8bd2f563a0a9dbf41453ab7b972014b8c16ea425")
    const amount = prompt('보낼 양', '35')

    axios.post(`/api/test/mineTransaction`, { address: address, amount: amount }).then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }
  function unspentTransactionOutputs() {
    axios.post(`/api/test/unspentTransactionOutputs`).then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }
  function myUnspentTransactionOutputs() {
    axios.post(`/api/test/myUnspentTransactionOutputs`).then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }
  function sendTransaction() {
    const address = prompt('보낼주소는?', "04ac435d37f7aecf7d6d22ca774648c3e3704cd1dfba9901ea8f16574532d3bae770b4f21691e477098c50ddfd8bd2f563a0a9dbf41453ab7b972014b8c16ea425")
    const amount = prompt('보낼 양', '35')

    axios.post(`/api/test/sendTransaction`, { address: address, amount: amount }).then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }
  function transactionPool() {
    axios.post(`/api/test/transactionPool`).then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }
  function stop() {
    axios.post(`/api/test/stop`).then((res) => {
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
          <button id="mineRawBlock" onClick={() => mineRawBlock()}>
            mineRawBlock(바디데이터 입력 있는 경우)
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
            socketOn : 웹소켓서버오픈 및 접속
          </button>
        </li>
        <li>
          <button id="peers" onClick={() => peers()}>
            peers : 피어 목록 불러오기
          </button>
        </li>
        <li>
          <button id="addPeer" onClick={() => addPeer()}>
            addPeer : 피어 추가 하기
          </button>
        </li>
        <li>
          <button id="balance" onClick={() => balance()}>
            balance
          </button>
        </li>
        <li>
          <button id="mineTransaction" onClick={() => mineTransaction()}>
            mineTransaction
          </button>
        </li>
        <li>
          <button id="unspentTransactionOutputs" onClick={() => unspentTransactionOutputs()}>
            unspentTransactionOutputs
          </button>
        </li>
        <li>
          <button id="myUnspentTransactionOutputs" onClick={() => myUnspentTransactionOutputs()}>
            myUnspentTransactionOutputs
          </button>
        </li>
        <li>
          <button id="sendTransaction" onClick={() => sendTransaction()}>
            sendTransaction
          </button>
        </li>
        <li>
          <button id="transactionPool" onClick={() => transactionPool()}>
            transactionPool
          </button>
        </li>
        <li>
          <button id="stop" onClick={() => stop()}>
            stop
          </button>
        </li>
      </ol>
      <div id="writefield"></div>
    </div>
  );
}

export default TestingBoard;
