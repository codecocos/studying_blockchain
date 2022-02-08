import React, { useState, useEffect } from "react";
import {
  Avatar,
  Button,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import LockOutlined from "@mui/icons-material/LockOutlined";

// import { createMuiTheme, ThemeProvider } from "@material-ui/core";

import { useDispatch } from "react-redux";

import { loginUser } from "../../../redux/actions/UserAction";
import { useHistory } from "react-router";

const LoginWallet = (props) => {
  const gridStyle = {
    padding: 10,
  };
  const paperStyle = {
    padding: 20,
    height: 470,
    width: 300,
    margin: "10px auto",
  };
  // const theme = createMuiTheme({
  //   palette: {
  //     type: "dark",
  //   },
  // });
  const avatarStyle = { backgroundColor: "gold", marginBottom: "20px" };
  const btnstyle = { margin: "20px 5px" };

  const history = useHistory();

  const dispatch = useDispatch();

  const [WalletPwdFromUser, setWalletPwdFromUser] = useState("");

  function getWalletPwdFromUser(event) {
    setWalletPwdFromUser(event.currentTarget.value);
  }

  function getWallet(props) {
    dispatch(loginUser(WalletPwdFromUser));
    props.setAnchorEl(null);
  }

  return (
    <Grid style={gridStyle}>
      <Paper className={10} style={paperStyle} variant="outlined">
        <Grid align="center">
          <Avatar style={avatarStyle}>
            <LockOutlined />
          </Avatar>
          <h2>My 간편 비밀번호</h2>
        </Grid>
        <TextField
          type={"password"}
          onChange={getWalletPwdFromUser}
          value={WalletPwdFromUser}
          label="password"
          placeholder="Enter password"
          fullwidth
          required
          style={{
            width: "250px",
            marginTop: "15px",
            marginLeft: "0.4rem",
          }}
        />
        <br />
        <br />
        <Button
          onClick={() => {
            getWallet(props);
          }}
          type="submit"
          style={btnstyle}
          variant="contained"
          fullWidth
        >
          SIGN IN
        </Button>
        <Typography align={"center"}>
          <Link
            onClick={() => props.sethaveWallet("RestoreWallet")}
            color="black"
          >
            Forgot password ?
          </Link>
        </Typography>
        <br />
        {/* Create New Wallet */}
        <Typography align={"center"}>
          Do you have an account ?
          <br />
          {/* <ThemeProvider theme={theme}> */}
          <button
            id="password"
            value="password"
            className="bx bxs-wallet bx-tada"
            onClick={() => props.sethaveWallet("CreateWallet")}
            style={{
              display: "flex",
              width: "15px",
              height: "15px",
              fontSize: "2.7rem",
              alignItems: "center",
              marginTop: "25px",
              marginLeft: "95px",
              color: "white",
            }}
          ></button>
          {/* </ThemeProvider> */}
        </Typography>
      </Paper>
    </Grid>
  );
};

export default LoginWallet;
