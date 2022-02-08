import React, { useState, useEffect, useRef } from "react";

import "./topnav.css";

import { Link } from "react-router-dom";

import UserMenu from "../userMenu/UserMenu";
import ThemeMenu from "../topnav/themeMenu/ThemeMenu";

import user_image from "../../assets/images/tuat.png";

import user_menu from "../../assets/JsonData/user_menus.json";

import { useDispatch, useSelector } from "react-redux";

import LoginWallet from "../topnav/wallet/LoginWallet";
import RestoreWallet from "../topnav/wallet/RestoreWallet";
import CreateWallet from "../topnav/wallet/CreateWallet";
import CreatePwdWallet from "../topnav/wallet/CreatePwdWallet";

import { Menu, MenuItem, Box } from "@mui/material";

import { logoutUser } from "../../redux/actions/UserAction";

import DropdownCp from "./dropdownCp/Dropdown";

import notifications from "../../assets/JsonData/notification.json";

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
    sethaveWallet("LoginWallet");
  };

  //useEffect(() => {}, [haveWallet]);

  function returnMenu(haveWallet) {
    switch (haveWallet) {
      case "LoginWallet":
        return (
          <LoginWallet
            haveWallet={haveWallet}
            sethaveWallet={sethaveWallet}
          ></LoginWallet>
        );
      case "RestoreWallet":
        return (
          <RestoreWallet
            haveWallet={haveWallet}
            sethaveWallet={sethaveWallet}
          ></RestoreWallet>
        );
      case "CreateWallet":
        return (
          <CreateWallet
            haveWallet={haveWallet}
            sethaveWallet={sethaveWallet}
          ></CreateWallet>
        );
      case "CreatePwdWallet":
        return (
          <CreatePwdWallet
            haveWallet={haveWallet}
            sethaveWallet={sethaveWallet}
          ></CreatePwdWallet>
        );
      default:
    }
  }

  //console.log(haveWallet);

  function loginWallet(isAuth) {
    //로그인 되지 않은 상태 인 경우
    if (!isAuth) {
      return (
        <div>
          {/* <button className="dropdown__toggle" onClick={handleMenuOpen}>
            <i className="bx bx-user-circle"></i>
          </button> */}
          {/* <div className="topnav__right-item"> */}
          <DropdownCp
            icon="bx bx-user-circle"
            //contentData={notifications}
            //renderItems={(item, index) => renderNotificationItem(item, index)}
            // renderFooter={() => <Link to="/">View All</Link>}
            //onClick={haveWallet}
            renderComponent={returnMenu(haveWallet)}
          />
          {/* </div> */}
          {/* 
          <div
            className="col-10"
            onClick={() => {
              getLoginToggle();
            }}
          >
            로그인좀 해보자
          </div> */}

          {/* <div className="topnav__right-wallet">
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
          </div> */}
        </div>
      );
      //로그인 된 상태인 경우
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

            {/* <button
              className="dropdown__toggle"
              onClick={dispatch(logoutUser())}
            >
              <UserMenu />
            </button> */}
            <div className="topnav__right-item">
              로그인 됨
              {/* <Dropdown
                customToggle={() => renderUserToggle(curr_user)}
                contentData={user_menu}
                renderItems={(item, index) => renderUserMenu(item, index)}
              /> */}
            </div>
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
        {/* 드랍다운 컴포넌트 */}
        {/* <div className="topnav__right-item">
          <Dropdown
            customToggle={() => renderUserToggle(curr_user)}
            contentData={user_menu}
            renderItems={(item, index) => renderUserMenu(item, index)}
          />
        </div> */}

        {/* <div className="topnav__right-item">
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
