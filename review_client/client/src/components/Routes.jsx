import React from "react";

import { Route, Switch } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Blockchainboard from "../pages/Blockchainboard";
import Transaction from "../pages/Transaction";
import TestingBoard from "../pages/TestingBoard";
import Wallet from "../pages/Wallet";

const Routes = () => {
  return (
    <Switch>
      <Route path="/" exact component={Dashboard} />
      <Route path="/blockchain" component={Blockchainboard} />
      <Route path="/transaction" component={Transaction} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/testing" component={TestingBoard} />
    </Switch>
  );
};

export default Routes;
