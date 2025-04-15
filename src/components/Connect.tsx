import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {AccountSlice} from "zkwasm-minirollup-browser";
import {
    MDBBtn,
} from 'mdb-react-ui-kit';
import { addressAbbreviation } from "../utils/address";
import { extractErrorMessage } from "../utils/transaction";
import { ResultModal } from "../modals/ResultModal";
interface IProps {
  handleRestart: () => void;
}

export function ConnectButton(props: IProps) {
  const [infoMessage, setInfoMessage] = useState("");
  const [showResult, setShowResult] = useState(false);
  const dispatch = useAppDispatch();
  const l1account = useAppSelector(AccountSlice.selectL1Account);
  async function connect() {
    try {
      let action = await dispatch(AccountSlice.loginL1AccountAsync());
      if (AccountSlice.loginL1AccountAsync.fulfilled.match(action)) {
        console.log("Login successful:", action.payload);
      } else if (AccountSlice.loginL1AccountAsync.rejected.match(action)) {
        const errorMessage = action.error.message || 'Unknown error';
        const userMessage = extractErrorMessage(errorMessage);
        throw new Error("Error: " + userMessage);
      }
    } catch (err: any) {
      setInfoMessage(err.message || "Unknown error");
      setShowResult(true);
    }
  }
  if (l1account) {
    return <span className="l1address">l1address: {addressAbbreviation(l1account!.address, 5)}</span>
  } else {
    return (
      <>
        <MDBBtn onClick={connect}>connect </MDBBtn>
        <ResultModal
          infoMessage={infoMessage}
          show={showResult}
          onClose={() => setShowResult(false)}
        />
      </>
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
