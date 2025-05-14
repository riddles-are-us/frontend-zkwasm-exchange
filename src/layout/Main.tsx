/* eslint-disable */
import React, { useEffect, useState, useCallback } from "react";
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
import Nav from "../components/Nav";
import Commands from "../components/Commands";
import { PlayerInfo } from "../components/PlayerInfo";
import TokenInfo from "../components/TokenInfo";
import { AdminInfo } from "../components/AdminInfo";
import { TradeInfo } from "../components/TradeInfo";
import {
  MDBTabsContent,
  MDBTabsPane
} from 'mdb-react-ui-kit';
import { queryStateI } from "../request";
import { UserState } from "../data/state";
import {
  useMediaQuery,
  OrderBookTab
} from "polymarket-ui";
import TradingPanel from "../components/TradingPanel";
import { Comments } from "../components/Comments";

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
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [selectedMarket, setSelectedMarket] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<"yes" | "no">("yes");

  const handleOptionChange = useCallback((option: "yes" | "no") => {
    setSelectedOption(option);
  }, []);

  // Handle order book tab change
  const handleOrderBookTabChange = useCallback((tab: OrderBookTab) => {
    setSelectedOption(tab);
  }, []);

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
      <div className={`min-h-screen bg-gray-100 dark:bg-gray-900`}>
        <div className="fixed top-0 left-0 right-0 z-50">
          <Nav handleTabClick={handleTabClick} />
        </div>
        <div className="pt-20 container mx-auto px-4 py-6 pb-[120px] lg:pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              <MDBTabsContent>
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
                  <MarketPage orderBookActiveTab={selectedOption} handleOrderBookTabChange={handleOrderBookTabChange} selectedMarket={selectedMarket} setSelectedMarket={setSelectedMarket} />
                </MDBTabsPane>
                <MDBTabsPane open={activeTab === "5"}>
                  <TradeInfo playerState={playerState} handleTabClick={handleTabClick} />
                </MDBTabsPane>
              </MDBTabsContent>

              <div className="mt-4">
                <div className="w-full">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="p-6">
                      <h4 className="mb-3 text-center text-black dark:text-white">
                        Execute Commands
                      </h4>
                      <Commands />
                    </div>
                  </div>
                </div>
              </div>
              <Comments />
            </div>
            {/* Right column - Only visible on desktop */}
            {!isMobile && (
              <div className="lg:col-span-1">
                <div className="fixed top-18">
                  <TradingPanel selectedOption={selectedOption} handleOptionChange={handleOptionChange} selectedMarket={selectedMarket} currentPrice={75} maxAmount={1000} />
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Mobile trading panel */}
        {isMobile && <TradingPanel selectedOption={selectedOption} handleOptionChange={handleOptionChange} selectedMarket={selectedMarket} currentPrice={75} maxAmount={1000} isMobileView={true} />}
      </div>
    </>
  );
}
