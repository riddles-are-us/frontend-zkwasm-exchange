/* eslint-disable */
import React, { useEffect, useState } from "react";
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./style.scss";
import { selectConnectState } from "../data/state";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { AccountSlice, ConnectState } from "zkwasm-minirollup-browser";
import { queryInitialState, queryState, sendTransaction, queryMarket } from "../request";
import { createCommand } from "zkwasm-minirollup-rpc";
import { MarketPage } from "../components/MarketPage";
import Footer from "../components/Foot";
import Nav from "../components/Nav";
import Commands from "../components/Commands";
import PlayerInfo from "../components/PlayerInfo";
import { MDBRow, MDBCol, MDBTypography } from 'mdb-react-ui-kit';

const CMD_REGISTER_PLAYER = 4n;
// hardcode admin for test
const server_admin_key = "1234567";

export function Main() {
  const connectState = useAppSelector(selectConnectState);
  const l2account = useAppSelector(AccountSlice.selectL2Account);
  const dispatch = useAppDispatch();
  const [inc, setInc] = useState(0);

  function updateState() {
    dispatch(queryMarket());
    if (connectState == ConnectState.Idle) {
      dispatch(queryState(l2account!.getPrivateKey()));
    } else if (connectState == ConnectState.Init) {
      dispatch(queryInitialState("1"));
    }
    setInc(inc + 1);
  }

  useEffect(() => {
    dispatch(queryMarket());
    if (l2account && connectState == ConnectState.Init) {
      dispatch(queryState(l2account!.getPrivateKey()));
    } else {
      dispatch(queryInitialState("1"));
    }
  }, [l2account]);

  useEffect(() => {
    setTimeout(() => {
      updateState();
    }, 3000);
  }, [inc]);


  useEffect(() => {
    if (connectState == ConnectState.InstallPlayer) {
      const command = createCommand(0n, CMD_REGISTER_PLAYER, []);
      dispatch(sendTransaction({
        cmd: command,
        prikey: l2account!.getPrivateKey()
      }));

      // register the server admin
      dispatch(sendTransaction({
        cmd: command,
        prikey: server_admin_key
      }));
    }
  }, [connectState]);

  return (
    <>
    {/* Navigation Bar */}
    <Nav />

    {/* PlayerInfo Section */}
    <MDBRow className="mt-4">
      <MDBCol>
        {/* Title for the Command Buttons Section */}
        <MDBTypography tag="h3" className="text-center mb-4">
          Wallet Player Balance
        </MDBTypography>
        <PlayerInfo />
      </MDBCol>
    </MDBRow>

    {/* Command Buttons Section */}
    <MDBRow className="mt-4">
      <MDBCol>
        {/* Title for the Command Buttons Section */}
        <MDBTypography tag="h3" className="text-center mb-4">
          Execute Commands
        </MDBTypography>
        <Commands />
      </MDBCol>
    </MDBRow>

    {/* Market Page */}
    <MDBRow className="mt-4">
      <MDBCol>
        {/* Title for the MarketPage Section */}
        <MDBTypography tag="h3" className="text-center mb-4">
          Market Data
        </MDBTypography>
        <MarketPage />
      </MDBCol>
    </MDBRow>

    {/* Footer */}
    <Footer />
    </>
  );
}
