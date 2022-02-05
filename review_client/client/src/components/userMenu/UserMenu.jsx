import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Dropdown from "../dropdown/Dropdown";
import { useDispatch } from "react-redux";

import UserAction from "../../redux/actions/UserAction";

import user_image from "../../assets/images/tuat.png";

import user_menu from "../../assets/JsonData/user_menus.json";

const clickOutsideRef = (content_ref, toggle_ref) => {
  document.addEventListener("mousedown", (e) => {
    // user click toggle
    if (toggle_ref.current && toggle_ref.current.contains(e.target)) {
      content_ref.current.classList.toggle("active");
    } else {
      // user click outside toggle and content
      if (content_ref.current && !content_ref.current.contains(e.target)) {
        content_ref.current.classList.remove("active");
      }
    }
  });
};

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

const UserMenu = () => {
  const menu_ref = useRef(null);
  const menu_toggle_ref = useRef(null);

  clickOutsideRef(menu_ref, menu_toggle_ref);

  const setActiveMenu = () => menu_ref.current.classList.add("active");

  return (
    <div>
      {/* <button
        ref={menu_toggle_ref}
        className="dropdown__toggle"
        onClick={() => setActiveMenu()}
      >
        <i className="bx bx-user"></i>
      </button>
      <div ref={menu_ref} className="theme-menu"></div> */}
      <Dropdown
        customToggle={() => renderUserToggle(curr_user)}
        contentData={user_menu}
        renderItems={(item, index) => renderUserMenu(item, index)}
      />
    </div>
  );
};

export default UserMenu;
