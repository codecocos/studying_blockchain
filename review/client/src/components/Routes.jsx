import React from "react";

import { Route, Switch } from "react-router-dom";

import TestingBoard from "../pages/TestingBoard";
import DashBoard from "../pages/DashBoard";

const Routes = () => {
  return (
    <Switch>
      <Route path="/" exact component={DashBoard} />
      <Route path="/testing" exact component={TestingBoard} />
    </Switch>
  );
};

export default Routes;
