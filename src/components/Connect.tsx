import React from "react";
import "./style.scss";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {AccountSlice} from "zkwasm-minirollup-browser";
import {
    MDBBtn,
} from 'mdb-react-ui-kit';
import { addressAbbreviation } from "../utils/address";
interface IProps {
  handleRestart: () => void;
}

export function ConnectButton(props: IProps) {
  const dispatch = useAppDispatch();
  const l1account = useAppSelector(AccountSlice.selectL1Account);
  function connect() {
    dispatch(AccountSlice.loginL1AccountAsync());
  }
  if (l1account) {
    return <span className="l1address">l1address: {addressAbbreviation(l1account!.address, 5)}</span>
  } else {
    return (
        <MDBBtn onClick={connect}>connect </MDBBtn>
    );
  }
}

export function LoginButton(props: IProps) {
  const dispatch = useAppDispatch();
  const l1account = useAppSelector(AccountSlice.selectL1Account);
  const l2account = useAppSelector(AccountSlice.selectL2Account);
  function login() {
    if (l1account) {
        dispatch(AccountSlice.loginL2AccountAsync("ZKWASM-BEAT"));
    }
  }

  if (l1account) {
    if (l2account) {
      const l2addresshex = "0x" + l2account.pubkey;
      return <span>ID(l2address): {addressAbbreviation(l2addresshex, 5)}</span>
    } else {
      return <MDBBtn onClick={login}>login apps</MDBBtn>
    }
  } else {
    return <></>
  }
}
