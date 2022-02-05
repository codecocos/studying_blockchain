import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Avatar,
  Button,
  FormControl,
  Grid,
  InputLabel,
  Paper,
  Typography,
  TextField,
} from "@material-ui/core";
import KeyIcon from "@mui/icons-material/Key";
import { encryption } from "../../utils/encrypt";
import { decryption } from "../../utils/decrypt";

const NewWallet = (props) => {
  const serverPort = parseInt(window.location.port) + 2000;
  const serverUrl = `http://127.0.0.1:${serverPort}`;
  const gridStyle = {
    padding: 10,
  };

  const paperStyle = {
    padding: 20,
    height: 470,
    width: 300,
    margin: "10px auto",
  };

  const avatarStyle = { backgroundColor: "gold" };

  const btnstyle = { margin: "2px 3px" };

  //   const [value, setValue] = useState("");
  const [Mnemonic, setMnemonic] = useState("");

  const words = useRef();

  const copy = () => {
    const el = words.current;
    el.select();
    document.execCommand("copy");
  };

  const getMnemonic = () => {
    axios.post(`${serverUrl}/wallet/mnemonic`).then((res) => {
      const rawMnemonic = res.data.mnemonic;
      const encMnemonic = encryption(rawMnemonic);
      const decMnemonic = decryption(encMnemonic);

      const variant = localStorage.getItem("variant");

      if (variant !== null) {
        localStorage.removeItem("variant");
        localStorage.setItem("variant", encMnemonic);
      } else {
        localStorage.setItem("variant", encMnemonic);
      }
      setMnemonic(JSON.parse(decMnemonic));
    });
  };

  return (
    <Grid style={gridStyle}>
      <Paper className={8} style={paperStyle} variant="outlined">
        <Grid align="center">
          <Avatar style={avatarStyle}>
            <KeyIcon />
          </Avatar>
          <h2>Secret Recovery Phrase</h2>
          <br />
        </Grid>
        <TextField
          inputRef={words}
          onChange={getMnemonic}
          value={Mnemonic}
          readOnly
          fullWidth
          multiline
        ></TextField>
        <br />
        <Grid align="center" justifyContent>
          <Button
            size="medium"
            style={btnstyle}
            variant="contained"
            onClick={getMnemonic}
          >
            New mneomonic
          </Button>
          <Button
            size="medium"
            style={avatarStyle}
            variant="contained"
            onClick={copy}
          >
            copy
          </Button>
          <br />
          <br />
          <h5
            style={{
              width: 250,
              textAlign: "center",
              whiteSpace: "normal",
            }}
          >
            니모닉 문구를 아는 사람 누구나 지갑에 접근이 가능하므로 안전하게
            보관바랍니다. This is the only way you will be able to recover your
            account. Please store it somewhere safe !
          </h5>
        </Grid>
        <br />
        <Button
          // type=""
          style={btnstyle}
          variant="contained"
          fullWidth
          id="createpwd"
          value="createpwd"
          onClick={() => {
            if (Mnemonic === "") {
              alert("니모닉 문구를 생성해주세요");
            } else {
              props.sethaveWallet("pwd");
            }
          }}
        >
          Ok, I saved it somewhere
        </Button>
      </Paper>
    </Grid>
  );
};

export default NewWallet;
