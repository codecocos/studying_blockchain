import React, { useState, useEffect } from "react";
import axios from "axios";

const TxDetail = (props) => {
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

  const [shownBlock, setshownBlock] = useState({});

  // 블록 상세정보 펼치기, 접기
  const toggleBlockInfo = (block) => {
    setshownBlock((shownBlockInfo) => ({
      ...shownBlockInfo,
      [block.index]: !shownBlockInfo[block.index],
    }));
  };

  {
    reverseBlockchian.map((blockData) => {
      return (
        <ul key={blockData.index}>
          <div
            onClick={() => {
              toggleBlockInfo(blockData);
            }}
          >
            블록 열고 닫아보자
          </div>

          {shownBlock[blockData.index] ? (
            <div className="col-12">
              <div className="card_1">
                <li>
                  <div>
                    <div>index</div>
                  </div>
                  <div>{blockData.index}</div>
                </li>
                <hr />
                <li>
                  <div>
                    <div>previousHash</div>
                  </div>
                  <div>{blockData.previousHash}</div>
                </li>
                <hr />
                <li>
                  <div>
                    <div>timestamp</div>
                  </div>
                  <div>{blockData.timestamp}</div>
                </li>
                <hr />
                <li>
                  <div>
                    <div>hash</div>
                  </div>
                  <div>{blockData.hash}</div>
                </li>
                <hr />
                <li>
                  <div>
                    <div>difficulty</div>
                  </div>
                  <div>{blockData.difficulty}</div>
                </li>
                <hr />
                <li>
                  <div>
                    <div>nonce</div>
                  </div>
                  <div>{blockData.nonce}</div>
                </li>
                <hr />
                <div className="Transaction-title">Transactions</div>
                {blockData.data.map((transaction) => {
                  return (
                    <div className="Transaction-content" key={transaction.id}>
                      <div className="Transaction-content_box">
                        <div className="Transaction-content_info_id">
                          <div>Id</div>
                          <div>{transaction.id}</div>
                        </div>
                        {transaction.txIns.map((txIn) => {
                          return (
                            <div
                              className="Transaction-content_info"
                              key={txIn.signature}
                            >
                              <div className="Transaction-content_info_txIn">
                                <div>signature</div>
                                <div>{txIn.signature}</div>
                              </div>
                              <div className="Transaction-content_info_txIn">
                                <div>txOutId</div>
                                <div>{txIn.txOutId}</div>
                              </div>
                              <div className="Transaction-content_info_txIn">
                                <div>txOutIndex</div>
                                <div>{txIn.txOutIndex}</div>
                              </div>
                            </div>
                          );
                        })}
                        {transaction.txOuts.map((txOut, index) => {
                          return (
                            <div
                              className="Transaction-content_info"
                              key={index}
                            >
                              <div className="Transaction-content_info_txOut">
                                <div>address</div>
                                <div>{txOut.address}</div>
                              </div>
                              <div className="Transaction-content_info_txOut">
                                <div>amount</div>
                                <div>{txOut.amount}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </ul>
      );
    });
  }
};
