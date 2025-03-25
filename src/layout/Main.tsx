/* eslint-disable */
import React, { useEffect, useState } from "react";
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./style.scss";
import { selectConnectState } from "../data/state";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { AccountSlice, ConnectState } from "zkwasm-minirollup-browser";
import {
  queryInitialState,
  queryState,
  sendTransaction,
  queryMarket,
  queryToken,
  queryStateI
} from "../request";
import { createCommand } from "zkwasm-minirollup-rpc";
import { MarketPage } from "../components/MarketPage";
import Footer from "../components/Foot";
import Nav from "../components/Nav";
import Commands from "../components/Commands";
import PlayerInfo from "../components/PlayerInfo";
import TokenInfo from "../components/TokenInfo";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBRow,
  MDBCol,
  MDBTypography,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane
} from 'mdb-react-ui-kit';

const CMD_REGISTER_PLAYER = 4n;
// hardcode admin for test
const server_admin_key = "1234567";

export function Main() {
  const connectState = useAppSelector(selectConnectState);
  const l2account = useAppSelector(AccountSlice.selectL2Account);
  const dispatch = useAppDispatch();
  const [inc, setInc] = useState(0);
  const [activeTab, setActiveTab] = useState("1");

  function updateState() {
    dispatch(queryMarket());
    dispatch(queryToken());
    if (connectState == ConnectState.Idle) {
      dispatch(queryState(l2account!.getPrivateKey()));
    } else if (connectState == ConnectState.Init) {
      dispatch(queryInitialState("1"));
    }
    setInc(inc + 1);
  }

  useEffect(() => {
    dispatch(queryMarket());
    dispatch(queryToken());
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

  const handleTabClick = (value: string) => {
    if (value === activeTab) return;
    setActiveTab(value);
  };

  return (
    <>
    {/* Navigation Bar */}
    <Nav />

    <MDBTabs className="mb-3">
      <MDBTabsItem>
        <MDBTabsLink onClick={() => handleTabClick("1")} active={activeTab === "1"}>
          Wallet Player Balance
        </MDBTabsLink>
      </MDBTabsItem>
      <MDBTabsItem>
        <MDBTabsLink onClick={() => handleTabClick("2")} active={activeTab === "2"}>
          Token Info
        </MDBTabsLink>
      </MDBTabsItem>
      <MDBTabsItem>
        <MDBTabsLink onClick={() => handleTabClick("3")} active={activeTab === "3"}>
          Market Data
        </MDBTabsLink>
      </MDBTabsItem>
    </MDBTabs>

    <MDBTabsContent style={{ maxHeight: "400px", overflowY: "auto" }}>
      <MDBTabsPane open={activeTab === "1"}>
        <PlayerInfo />
      </MDBTabsPane>
      <MDBTabsPane open={activeTab === "2"}>
        <TokenInfo />
      </MDBTabsPane>
      <MDBTabsPane open={activeTab === "3"}>
        <MarketPage />
      </MDBTabsPane>
    </MDBTabsContent>

    <MDBRow className="mt-4">
      <MDBCol>
        <MDBCard>
          <MDBCardBody>
            <MDBTypography tag="h4" className="mb-3 text-center">
              Execute Commands
            </MDBTypography>
            <Commands />
          </MDBCardBody>
        </MDBCard>
      </MDBCol>
    </MDBRow>

    {/* Footer */}
    <Footer />
    </>
  );
}
