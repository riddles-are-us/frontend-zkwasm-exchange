/* eslint-disable */
import React, { useEffect, useState } from "react";
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./style.css";
import { selectConnectState } from "../data/state";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { AccountSlice, ConnectState } from "zkwasm-minirollup-browser";
import {
  queryInitialState,
  queryState,
  sendTransaction,
  queryMarket,
  queryToken
} from "../request";
import { createCommand } from "zkwasm-minirollup-rpc";
import { MarketPage } from "../components/MarketPage";
import Footer from "../components/Foot";
import Nav from "../components/Nav";
import Commands from "../components/Commands";
import { PlayerInfo } from "../components/PlayerInfo";
import TokenInfo from "../components/TokenInfo";
import { AdminInfo } from "../components/AdminInfo";
import { TradeInfo } from "../components/TradeInfo";
import {
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
import { queryStateI } from "../request";
import { UserState } from "../data/state";

const CMD_REGISTER_PLAYER = 4n;
// hardcode admin for test
export const server_admin_key = "1234567";

export function Main() {
  const connectState = useAppSelector(selectConnectState);
  const l2account = useAppSelector(AccountSlice.selectL2Account);
  const dispatch = useAppDispatch();
  const [inc, setInc] = useState(0);
  const [activeTab, setActiveTab] = useState("1");
  const [adminState, setAdminState] = useState<UserState | null>(null);
  const [playerState, setPlayerState] = useState<UserState | null>(null);

  async function updateState() {
    dispatch(queryMarket());
    dispatch(queryToken());

    // get admin to show admin balance
    const state = await queryStateI(server_admin_key);
    console.log("(Data-QueryAdminState)", state);
    setAdminState(state);
    if (connectState == ConnectState.Idle) {
      const action = await dispatch(queryState(l2account!.getPrivateKey()));
      setPlayerState(action.payload);
    } else if (connectState == ConnectState.Init) {
      dispatch(queryInitialState("1"));
    }
    setInc(inc + 1);
  }

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(queryMarket());
      await dispatch(queryToken());

      // get admin to show admin balance
      const state = await queryStateI(server_admin_key);
      console.log("(Data-QueryAdminState)", state);
      setAdminState(state);

      if (l2account && connectState === ConnectState.Init) {
        const action = await dispatch(queryState(l2account.getPrivateKey()));
        setPlayerState(action.payload);
      } else {
        await dispatch(queryInitialState("1"));
      }
    };

    fetchData();
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
          Admin Balance
        </MDBTabsLink>
      </MDBTabsItem>
      <MDBTabsItem>
        <MDBTabsLink onClick={() => handleTabClick("2")} active={activeTab === "2"}>
          Wallet Player Balance
        </MDBTabsLink>
      </MDBTabsItem>
      <MDBTabsItem>
        <MDBTabsLink onClick={() => handleTabClick("3")} active={activeTab === "3"}>
          Token Info
        </MDBTabsLink>
      </MDBTabsItem>
      <MDBTabsItem>
        <MDBTabsLink onClick={() => handleTabClick("4")} active={activeTab === "4"}>
          Market Data
        </MDBTabsLink>
      </MDBTabsItem>
      <MDBTabsItem>
        <MDBTabsLink onClick={() => handleTabClick("5")} active={activeTab === "5"}>
          Trade Info
        </MDBTabsLink>
      </MDBTabsItem>
    </MDBTabs>

    <MDBTabsContent style={{ maxHeight: "400px", overflowY: "auto" }}>
      <MDBTabsPane open={activeTab === "1"}>
        <AdminInfo adminState={adminState} />
      </MDBTabsPane>
      <MDBTabsPane open={activeTab === "2"}>
        <PlayerInfo playerState={playerState} />
      </MDBTabsPane>
      <MDBTabsPane open={activeTab === "3"}>
        <TokenInfo />
      </MDBTabsPane>
      <MDBTabsPane open={activeTab === "4"}>
        <MarketPage />
      </MDBTabsPane>
      <MDBTabsPane open={activeTab === "5"}>
        <TradeInfo playerState={playerState} handleTabClick={handleTabClick} />
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
