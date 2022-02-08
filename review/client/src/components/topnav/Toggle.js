import React from "react";
import styled from "styled-components";

const InputWrapper = styled.label`
  position: relative;
`;

const Input = styled.input`
  position: absolute;
  left: -9999px;
  top: -9999px;

  &:checked + span {
    background-color: grey;

    &:before {
      left: calc(100% - 10px);
      transform: translateX(-100%);
    }
  }

  &:focus + span {
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }

  &:focus:checked + span {
    box-shadow: 0 0 0 2px rgba(255, 246, 176, 0.2);
  }
`;

const Slider = styled.span`
  display: flex;
  cursor: pointer;
  width: 50px;
  height: 25px;
  border-radius: 100px;
  background-color: var(--main-bg-dark);
  position: background-color 0.2s;
  margin-right: 10px;
  transition: background-color 0.2s, box-shadow 0.2s;

  &:before {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 21px;
    height: 21px;
    border-radius: 21px;
    transition: 0.2s;
    background: gold;
    box-shadow: 0 2px 4px 0 rgba(0, 35, 11, 0.2);
  }

  &:active:before {
    width: 28px;
  }
`;

const Toggle = ({ onChange, label }) => {
  return (
    <InputWrapper>
      <Input type="checkbox" onChange={onChange} />
      <Slider />
      {label}
    </InputWrapper>
  );
};

export default Toggle;
