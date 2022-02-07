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
  // function blockHash() {
  //   axios.post(`/api/test/block/:hash`).then((res) => {
  //     const data = res.data;
  //     document.getElementById("writefield").innerText =
  //       JSON.stringify(data);
  //   });
  // }

  function genesisBlockData() {
    axios.post(`/api/test/genesisBlockData`).then((res) => {
      const data = res.data;
      document.getElementById("writefield").innerText =
        JSON.stringify(data);
    });
  }

  const olstyle = {
    fontSize: '1.5rem',
    marginLeft: '2rem',
    backgroundColor: '#2d2d2d',
  };
  const btnstyle = {
    fontSize: '1.5rem',
    margin: '4px',
    backgroundColor: '#2d2d2d',
  };

  return (
    <div>
      <h2 className="page-header">Testing Board</h2>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card__body">
              <div className="card__text">
                <ol style={olstyle}>
                  <li>
                    <button id="blocks" onClick={() => block()} style={btnstyle}>
                      get blocks
                    </button>
                  </li>
                  <li>
                    <button id="mineBlock" onClick={() => mineBlock()} style={btnstyle}>
                      mineBlock
                    </button>
                  </li>
                  <li>
                    <button id="mineRawBlock" onClick={() => mineRawBlock()} style={btnstyle}>
                      mineRawBlock
                    </button>
                  </li>
                  <li>
                    <button id="initWallet" onClick={() => initWallet()} style={btnstyle}>
                      initWallet
                    </button>
                  </li>
                  <li>
                    <button id="getAddress" onClick={() => getAddress()} style={btnstyle}>
                      getAddress
                    </button>
                  </li>
                  <li>
                    <button id="socketOn" onClick={() => socketOn()} style={btnstyle}>
                      socketOn
                    </button>
                  </li>
                  <li>
                    <button id="peers" onClick={() => peers()} style={btnstyle}>
                      peers
                    </button>
                  </li>
                  <li>
                    <button id="addPeer" onClick={() => addPeer()} style={btnstyle}>
                      addPeer
                    </button>
                  </li>
                  <li>
                    <button id="balance" onClick={() => balance()} style={btnstyle}>
                      balance
                    </button>
                  </li>
                  <li>
                    <button id="mineTransaction" onClick={() => mineTransaction()} style={btnstyle}>
                      mineTransaction
                    </button>
                  </li>
                  <li>
                    <button id="unspentTransactionOutputs" onClick={() => unspentTransactionOutputs()} style={btnstyle}>
                      unspentTransactionOutputs
                    </button>
                  </li>
                  <li>
                    <button id="myUnspentTransactionOutputs" onClick={() => myUnspentTransactionOutputs()} style={btnstyle}>
                      myUnspentTransactionOutputs
                    </button>
                  </li>
                  <li>
                    <button id="sendTransaction" onClick={() => sendTransaction()} style={btnstyle}>
                      sendTransaction
                    </button>
                  </li>
                  <li>
                    <button id="transactionPool" onClick={() => transactionPool()} style={btnstyle}>
                      transactionPool
                    </button>
                  </li>
                  <li>
                    <button id="stop" onClick={() => stop()} style={btnstyle}>
                      stop
                    </button>
                  </li>
                  {/* 
                  <li>
                    <button id="blockHash" onClick={() => blockHash()}>
                      blockHash
                    </button>
                  </li> 
                    */}
                  <li>
                    <button id="genesisBlockData" onClick={() => genesisBlockData()} style={btnstyle}>
                      genesisBlockData
                    </button>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card__text">테스트 코드 결과</div>
      <br />
      <div className="card__text">
        <div id="writefield"></div>
      </div>
    </div>
  );
}

export default TestingBoard;
