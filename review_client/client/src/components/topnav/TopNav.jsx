import React, { useState, useEffect, useRef } from "react";

import "./topnav.css";

import { Link } from "react-router-dom";

import UserMenu from "../userMenu/UserMenu";
import ThemeMenu from "../themeMenu/ThemeMenu";

import user_image from "../../assets/images/tuat.png";

import user_menu from "../../assets/JsonData/user_menus.json";

import { useDispatch, useSelector } from "react-redux";

import LoginWallet from "../wallet/LoginWallet";
import RestoreWallet from "../wallet/RestoreWallet";
import CreateWallet from "../wallet/CreateWallet";
import CreatePwdWallet from "../wallet/CreatePwdWallet";

import { Menu, MenuItem, Box } from "@mui/material";

import { logoutUser } from "../../redux/actions/UserAction";

const curr_user = {
  display_name: "Tuat Tran",
  image: user_image,
};

const renderUserToggle = (user) => (
  <div className="topnav__right-user">
    <div className="topnav__right-user__image">
      <img src={user.image} alt="" />
    </div>
    <div className="topnav__right-user__name">{user.display_name}</div>
  </div>
);

const renderUserMenu = (item, index) => (
  <Link to="/" key={index}>
    <div className="notification-item">
      <i className={item.icon}></i>
      <span>{item.content}</span>
    </div>
  </Link>
);

const Topnav = () => {
  const userState = useSelector((state) => state.UserReducer);
  const userAuth = userState.isAuth;

  const dispatch = useDispatch();
  const [haveWallet, sethaveWallet] = useState("LoginWallet");
  const [AnchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    sethaveWallet("LoginWallet");
  };

  useEffect(() => {}, [haveWallet]);

  function returnMenu(haveWallet) {
    switch (haveWallet) {
      case "LoginWallet":
        return (
          <LoginWallet
            haveWallet={haveWallet}
            sethaveWallet={sethaveWallet}
            setAnchorEl={setAnchorEl}
          ></LoginWallet>
        );
      case "RestoreWallet":
        return (
          <RestoreWallet
            haveWallet={haveWallet}
            sethaveWallet={sethaveWallet}
            setAnchorEl={setAnchorEl}
          ></RestoreWallet>
        );
      case "CreateWallet":
        return (
          <CreateWallet
            haveWallet={haveWallet}
            sethaveWallet={sethaveWallet}
            setAnchorEl={setAnchorEl}
          ></CreateWallet>
        );
      case "CreatePwdWallet":
        return (
          <CreatePwdWallet
            haveWallet={haveWallet}
            sethaveWallet={sethaveWallet}
            setAnchorEl={setAnchorEl}
          ></CreatePwdWallet>
        );
      default:
    }
  }

  function loginWallet(isAuth) {
    if (!isAuth) {
      return (
        <div>
          <button className="dropdown__toggle" onClick={handleMenuOpen}>
            <i className="bx bx-user-circle"></i>
          </button>
          {/* <div className="topnav__right-wallet"> */}
          <Menu
            sx={{ mt: "45px" }}
            id="menu-appbar"
            anchorEl={AnchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(AnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem>{returnMenu(haveWallet)}</MenuItem>
          </Menu>
          {/* </div> */}
        </div>
      );
    } else {
      return (
        <div>
          <div className="topnav__right-item">
            {/* <Button
              onClick={() => {
                dispatch(logoutUser());
              }}
              sx={{ p: 0, cursor: "pointer" }}
            >
              <i class="bx bx-user" style={usericon} />
            </Button> */}
            <button
              className="dropdown__toggle"
              onClick={dispatch(logoutUser())}
            >
              <UserMenu />
            </button>
          </div>
        </div>
      );
    }
  }
  return (
    <div className="topnav">
      <div className="topnav__search">
        <input type="text" placeholder="Search here..." />
        <i className="bx bx-search"></i>
      </div>
      <div className="topnav__right">
        {/* <div className="topnav__right-item">
          <Dropdown
            customToggle={() => renderUserToggle(curr_user)}
            contentData={user_menu}
            renderItems={(item, index) => renderUserMenu(item, index)}
          />
        </div>

        <div className="topnav__right-item">
          <UserMenu />
        </div> */}
        <div className="topnav__right-item"> {loginWallet(userAuth)}</div>
        <div className="topnav__right-item">
          <ThemeMenu />
        </div>
      </div>
    </div>
  );
};

export default Topnav;
