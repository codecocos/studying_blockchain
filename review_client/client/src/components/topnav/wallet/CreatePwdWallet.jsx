import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Avatar,
  Button,
  Checkbox,
  FormControlLabel,
  FormControl,
  Grid,
  Paper,
  TextField,
} from "@material-ui/core";
import LockOutlined from "@mui/icons-material/LockOutlined";

import axios from "axios";
import { encryption } from "../../../utils/encrypt";
import { decryption } from "../../../utils/decrypt";

const CreatePwdWallet = (props) => {
  const gridStyle = {
    padding: 10,
  };
  const paperStyle = {
    padding: 20,
    height: 470,
    width: 300,
    margin: "10px auto",
  };
  const avatarStyle = { backgroundColor: "gold", marginBottom: "20px" };
  const btnstyle = { margin: "20px 5px" };

  const [Password, setPassword] = useState("");
  const [Mnemonic, setMnemonic] = useState("");

  const history = useHistory();

  const getPassword = (event) => {
    setPassword(event.currentTarget.value);
  };

  const getMnemonic = () => {
    const encMnemonic = localStorage.getItem("variant");
    const decMnemonic = JSON.parse(decryption(encMnemonic));

    setMnemonic(decMnemonic);
  };

  function createWallet(props) {
    const variables = {
      password: Password,
      mnemonic: Mnemonic,
    };

    axios.post("/api/wallet/createWallet", variables).then((res) => {
      if (res.data.registerSuccess) {
        localStorage.setItem("loglevel", res.data.encryptkey);
        alert(res.data.message);
      } else {
        alert(res.data.message);
      }
    });
    console.log(props);
    props.sethaveWallet("loginWallet");
    console.log(props);

    history.push("/");
  }
  return (
    <Grid style={gridStyle}>
      <Paper className={8} style={paperStyle} variant="outlined">
        <Grid align="center">
          <Avatar style={avatarStyle}>
            <LockOutlined />
          </Avatar>
          <h2>Create a password</h2>
          <p style={{ fontSize: "12px" }}>
            You will use this to unlock your wallet.
          </p>
        </Grid>
        <TextField
          type={"password"}
          label="password"
          placeholder="Enter password"
          fullwidth
          required
          style={{ width: "250px" }}
        />
        <br />
        <TextField
          type={"password"}
          onChange={getPassword}
          value={Password}
          label="confirm password"
          placeholder="password confirm"
          fullwidth
          required
          style={{ width: "250px" }}
        />
        <br />
        <br />
        <Grid align="center">
          <h2>CHECK AGAIN!</h2>
          <TextField
            // onChange={getMnemonic}
            value={Mnemonic}
            readOnly
            style={{
              marginTop: "10px",
            }}
          ></TextField>
          <Button
            onClick={getMnemonic}
            size="small"
            variant="fab"
            style={{
              margin: "10px",
              borderRadius: 10,
              backgroundColor: "gold",
              color: "#3a3a3ab9b",
            }}
            textColor={"yellow"}
          >
            show
          </Button>
        </Grid>
        {/* <FormControl>
          <FormControlLabel
            control={<Checkbox name="checkedB" color="primary" />}
            label="개인정보 처리 동의"
            size="small"
          />
        </FormControl> */}
        <br />
        <Button
          // href="/mypage"
          type="submit"
          color="gold"
          style={btnstyle}
          variant="contained"
          fullWidth
          onClick={() => createWallet(props)}
        >
          Save
        </Button>
        <p></p>
      </Paper>
    </Grid>
  );
};

export default CreatePwdWallet;
