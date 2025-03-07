import React, { useState } from 'react';
import { MDBBtn, MDBContainer, MDBRow, MDBCol, MDBIcon } from 'mdb-react-ui-kit';
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { sendTransaction } from "../request";
import { createCommand, LeHexBN } from "zkwasm-minirollup-rpc";
import { selectUserState } from '../data/state';
import { address2BigUint64Array } from "../utils/transaction";
import { AccountSlice } from "zkwasm-minirollup-browser";
import { ResultModal } from "../modals/ResultModal";
import AddTokenModal from "../modals/AddTokenModal";
import UpdateTokenModal from "../modals/UpdateTokenModal";
import WithdrawTokenModal from "../modals/WithdrawTokenModal";
import AddLimitOrderModal from "../modals/AddLimitOrderModal";
import AddMarketOrderModal from "../modals/AddMarketOrderModal";
import CancelOrderModal from "../modals/CancelOrderModal";
import AddMarketModal from "../modals/AddMarketModal";
import CloseMarketModal from "../modals/CloseMarketModal";
import TransferModal from "../modals/TransferModal";
import DepositTokenModal from "../modals/DepositTokenModal";
import { queryState } from "../request";
import { Order } from "../data/state";
import { get_server_admin_key } from "zkwasm-ts-server/src/config.js";
import { getNonce } from "../utils/transaction";

const PRECISION = BigInt(1e9);
const MAX_64_BIT = BigInt('9223372036854775807');
const FEE = 3;
const FEE_TOKEN_INDEX = 0;
const TYPE_LIMIT = 0;
const TYPE_MARKET = 1;
const FLAG_BUY = 1;
const FLAG_SELL = 0;
const CMD_ADD_TOKEN = 1n;
const CMD_UPDATE_TOKEN = 12n;
const CMD_ADD_MARKET = 2n;
const CMD_DEPOSIT_TOKEN = 3n;
const CMD_ADD_LIMIT_ORDER = 5n;
const CMD_ADD_MARKET_ORDER = 6n;
const CMD_CANCEL_ORDER = 7n;
const CMD_CLOSE_MARKET = 8n;
const CMD_TRANSFER = 9n;
const CMD_WITHDRAW = 10n;
const CMD_ADD_TRADE = 11n;

export default function Commands() {
  const dispatch = useAppDispatch();
  const userState = useAppSelector(selectUserState);
  const l2account = useAppSelector(AccountSlice.selectL2Account);
  const [infoMessage, setInfoMessage] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [showAddTokenModal, setShowAddTokenModal] = useState(false);
  const [showUpdateTokenModal, setShowUpdateTokenModal] = useState(false);
  const [showWithdrawTokenModal, setShowWithdrawTokenModal] = useState(false);
  const [showAddLimitOrderModal, setShowAddLimitOrderModal] = useState(false);
  const [showAddMarketOrderModal, setShowAddMarketOrderModal] = useState(false);
  const [showCancelOrderModal, setShowCancelOrderModal] = useState(false);
  const [showAddMarketModal, setShowAddMarketModal] = useState(false);
  const [showCloseMarketModal, setShowCloseMarketModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDepositTokenModal, setShowDepositTokenModal] = useState(false);

  const nonce = userState?.player?.nonce || 0;

  const addToken = async (tokenIndex: bigint, address: string) => {
    if(!l2account) {
      setInfoMessage("Please connect wallet before any transactions!");
      setShowResult(true);
      setShowAddTokenModal(false);
      return;
    }

    let addr = address2BigUint64Array(address);
    let params = [tokenIndex];
    params.push(...addr);

    const key = get_server_admin_key();
    const nonce = await getNonce(key);
    let action = await dispatch(
      sendTransaction({
        cmd: createCommand(BigInt(nonce), CMD_ADD_TOKEN, params),
        prikey: key,
      })
    );

    if (sendTransaction.fulfilled.match(action)) {
      const infoMessage: string = "Token added successfully!";
      return infoMessage;
    } else if(sendTransaction.rejected.match(action)) {
      throw Error("Error: " +  action.payload);
    }
  }

  const updateToken = async (tokenIndex: bigint, address: string) => {
    if(!l2account) {
      setInfoMessage("Please connect wallet before any transactions!");
      setShowResult(true);
      setShowUpdateTokenModal(false);
      return;
    }

    let addr = address2BigUint64Array(address);
    let params = [tokenIndex];
    params.push(...addr);

    const key = get_server_admin_key();
    const nonce = await getNonce(key);
    let action = await dispatch(
      sendTransaction({
        cmd: createCommand(BigInt(nonce), CMD_UPDATE_TOKEN, params),
        prikey: key,
      })
    );
    if (sendTransaction.fulfilled.match(action)) {
      const infoMessage: string = "Token updated successfully!";
      return infoMessage;
    } else if(sendTransaction.rejected.match(action)) {
      throw Error("Error: " +  action.payload);
    }
  }

  const depositToken = async (pid: string, tokenIdx: bigint, amount: bigint) => {
    if(!l2account) {
      setInfoMessage("Please connect wallet before any transactions!");
      setShowResult(true);
      setShowDepositTokenModal(false);
      return;
    }
    const key = get_server_admin_key();
    let pid2 = new LeHexBN(pid).toU64Array();
    let params = [pid2[1], pid2[2], tokenIdx, amount];

    const nonce = await getNonce(key);
    const action = await dispatch(
      sendTransaction({
        cmd: createCommand(BigInt(nonce), CMD_DEPOSIT_TOKEN, params),
        prikey: key,
      })
    );
    if (sendTransaction.fulfilled.match(action)) {
      const infoMessage: string = "Token deposited successfully!";
      return infoMessage;
    } else if(sendTransaction.rejected.match(action)) {
      throw new Error("Error: " +  action.payload);
    }
  }

  const withdrawToken = async (tokenIndex: bigint, address: string, amount: bigint) => {
    if(!l2account) {
      setInfoMessage("Please connect wallet before any transactions!");
      setShowResult(true);
      setShowWithdrawTokenModal(false);
      return;
    }

    let addr = address2BigUint64Array(address);
    let params = [tokenIndex];
    params.push(...addr);
    params.push(amount);
    let action = await dispatch(
      sendTransaction({
        cmd: createCommand(BigInt(nonce), CMD_WITHDRAW, params),
        prikey: l2account!.getPrivateKey(),
      })
    );
    if (sendTransaction.fulfilled.match(action)) {
      const infoMessage: string = "Token withdrawed successfully!";
      return infoMessage;
    } else if(sendTransaction.rejected.match(action)) {
      throw new Error("Error: " +  action.payload);
    }
  }

  const transfer = async (pid: string, tokenIdx: bigint, amount: bigint) => {
    if(!l2account) {
      setInfoMessage("Please connect wallet before any transactions!");
      setShowResult(true);
      setShowTransferModal(false);
      return;
    }

    let pid2 = new LeHexBN(pid).toU64Array();
    let params = [pid2[1], pid2[2], tokenIdx, amount];

    const key = get_server_admin_key();
    const nonce = await getNonce(key);
    let action = await dispatch(
      sendTransaction({
        cmd: createCommand(BigInt(nonce), CMD_TRANSFER,  params),
        prikey: get_server_admin_key(),
      })
    );
    if (sendTransaction.fulfilled.match(action)) {
      const infoMessage: string = "Token transfered successfully!";
      return infoMessage;
    } else if(sendTransaction.rejected.match(action)) {
      throw Error("Error: " +  action.payload);
    }
  }

  const addTrade = async (aOrderId: bigint, bOrderId: bigint, aActualAmount: bigint, bActualAmount: bigint) => {
    if(!l2account) {
      setInfoMessage("Please connect wallet before any transactions!");
      setShowResult(true);
      return;
    }

    let params = [aOrderId, bOrderId, aActualAmount, bActualAmount];
    const key = get_server_admin_key();
    const nonce = await getNonce(key);
    let action = await dispatch(
      sendTransaction({
        cmd: createCommand(BigInt(nonce), CMD_ADD_TRADE, params),
        prikey: get_server_admin_key(),
      })
    );
    if (sendTransaction.fulfilled.match(action)) {
      const trades = action.payload.state.trades;
      const latestTrade = trades[trades.length - 1];
      return "Success: latest trade is " + JSON.stringify(latestTrade);
    } else if(sendTransaction.rejected.match(action)) {
      throw Error("Error: " +  action.payload);
    }
  }

  const matchOrdersGetTradeParams = async (orders: Order[], incomingOrder: Order) => {
    let result = {aOrderId: 0n, bOrderId: 0n, aActualAmount: 0n, bActualAmount: 0n};
    if (incomingOrder.flag === FLAG_BUY) {
      // Buy order: Sort sell orders by price (ascending)
      let sellOrders = orders.filter(order => order.flag === FLAG_SELL);
      sellOrders.sort((a, b) => Number(a.price - b.price));  // Sort sell orders from low to high price

      let price = 0;

      // Traverse the sell orders and match
      for (let sellOrder of sellOrders) {
        // Buy order price >= Sell order price
        if(incomingOrder.type_ == TYPE_LIMIT && sellOrder.type_ == TYPE_LIMIT) {
          if(incomingOrder.price <= sellOrder.price) {
            continue;
          }
        }

        if(incomingOrder.type_ == TYPE_LIMIT) {
          if(sellOrder.type_ == TYPE_LIMIT) {
            price = sellOrder.price;
          } else {
            price = incomingOrder.price;
          }
        } else {
          price = sellOrder.price;
        }

        // Get buy amount and sell amount
        let aActualAmount = 0;
        let bActualAmount = 0;
        if(incomingOrder.type_ == TYPE_LIMIT) {
          aActualAmount = incomingOrder.b_token_amount;
        } else {
          if(incomingOrder.a_token_amount != 0) {
            aActualAmount = incomingOrder.a_token_amount;
          } else {
            aActualAmount = incomingOrder.b_token_amount;
          }
        }
        if(sellOrder.type_ == TYPE_LIMIT) {
          bActualAmount = sellOrder.b_token_amount;
        } else {
          if(sellOrder.a_token_amount != 0) {
            bActualAmount = sellOrder.a_token_amount;
          } else {
            bActualAmount = sellOrder.b_token_amount;
          }
        }

        // Calculate the buy orders' expected amount based on the price
        let aAmount = price * bActualAmount;

        if (aAmount > MAX_64_BIT) {
          console.log("price * b_token_amount overflow\n");
          continue;
        }

        // Ensure aAmount matches buy order's expected amount
        if (aAmount !== aActualAmount) {
          console.log("(price * sell order's expected amount) does not match buy order's expected amount\n");
          continue;
        }
        result = {
          aOrderId: BigInt(incomingOrder.id),
          bOrderId: BigInt(sellOrder.id),
          aActualAmount: BigInt(aActualAmount),
          bActualAmount: BigInt(bActualAmount)
        };
        break;  // Stop once a match is found
      }
      return result;
    } else if (incomingOrder.flag === FLAG_SELL) {
      // Sell order: Sort buy orders by price (descending)
      let buyOrders = orders.filter(order => order.flag === FLAG_BUY);
      buyOrders.sort((a, b) => Number(b.price - a.price));  // Sort buy orders from high to low price

      let price = 0;

      // Traverse the buy orders and match
      for (let buyOrder of buyOrders) {
        // Buy order price >= Sell order price
        if(incomingOrder.type_ == TYPE_LIMIT && buyOrder.type_ == TYPE_LIMIT) {
          if(buyOrder.price <= incomingOrder.price) {
            continue;
          }
        }

        if(buyOrder.type_ == TYPE_LIMIT) {
          if(incomingOrder.type_ == TYPE_LIMIT) {
            price = incomingOrder.price;
          } else {
            price = buyOrder.price;
          }
        } else {
          price = incomingOrder.price;
        }

        // Get buy amount and sell amount
        let aActualAmount = 0;
        let bActualAmount = 0;
        if(buyOrder.type_ == TYPE_LIMIT) {
          aActualAmount = buyOrder.b_token_amount;
        } else {
          if(buyOrder.a_token_amount != 0) {
            aActualAmount = buyOrder.a_token_amount;
          } else {
            aActualAmount = buyOrder.b_token_amount;
          }
        }
        if(incomingOrder.type_ == TYPE_LIMIT) {
          bActualAmount = incomingOrder.b_token_amount;
        } else {
          if(incomingOrder.a_token_amount != 0) {
            bActualAmount = incomingOrder.a_token_amount;
          } else {
            bActualAmount = incomingOrder.b_token_amount;
          }
        }

        // Calculate the buy orders' expected amount based on the price
        let aAmount = price * bActualAmount;

        if (aAmount > MAX_64_BIT) {
          console.log("price * b_token_amount overflow\n");
          continue;
        }

        // Ensure aAmount matches buy order's expected amount
        if (aAmount !== aActualAmount) {
          console.log("(price * sell order's expected amount) does not match buy order's expected amount\n");
          continue;
        }

        result = {
          aOrderId: BigInt(buyOrder.id),
          bOrderId: BigInt(incomingOrder.id),
          aActualAmount: BigInt(aActualAmount),
          bActualAmount: BigInt(bActualAmount)
        };
        break;  // Stop once a match is found
      }
      return result;
    }
  }

  async function orderCheck(f: ()=> any, check:(before: any, after: any) => boolean) {
    // Query state before placing the market order
    let before = await dispatch(queryState(l2account!.getPrivateKey()));
    const action = await f();

    // Query state after placing the market order
    let after = await dispatch(queryState(l2account!.getPrivateKey()));
    if(!check(before.payload, after.payload)) {
        throw new Error("orderCheck failed");
    }

    return action;
  }

  const addMarketOrder = async (marketId: bigint, flag: bigint, bTokenAmount: bigint, aTokenAmount: bigint) => {
    if (!l2account) {
      setInfoMessage("Please connect wallet before any transactions!");
      setShowResult(true);
      setShowAddMarketOrderModal(false);
      return;
    }

    // Send transaction to add market order
    let f = async () => {
      let params = [marketId, flag, bTokenAmount, aTokenAmount];
      let action = await dispatch(
        sendTransaction({
          cmd: createCommand(BigInt(nonce), CMD_ADD_MARKET_ORDER, params),
          prikey: l2account!.getPrivateKey(),
        })
      );
      return action;
    }

    // comment because of no market data in state
    /*const filteredMarkets = userState!.state.markets.filter(market => BigInt(market.market_id) === marketId);
    const market = filteredMarkets[0];
    let tokenIndex = 0;
    let cost = 0n;
    if (flag === BigInt(FLAG_BUY)) {  // If it's a Buy order
      tokenIndex = market.token_a;
      if (aTokenAmount !== 0n) {
        cost = aTokenAmount;
      } else {
        cost = bTokenAmount * BigInt(market.last_deal_price) * 2n;
        if(cost > MAX_64_BIT) {
          throw new Error("cost overflow");
        }
      }
    } else if (flag === BigInt(FLAG_SELL)) {  // If it's a Sell order
      tokenIndex = market.token_b;
      if (bTokenAmount !== 0n) {
          cost = bTokenAmount;
      } else {
          cost = (aTokenAmount * 2n * PRECISION) / BigInt(market.last_deal_price);
      }
    }

    // positions' length is 2 now
    if(tokenIndex == 0 || tokenIndex == 1) {
      const position = userState!.player!.data.positions[tokenIndex];
      if(BigInt(position.balance) < cost) {
        throw new Error("Insufficient balance");
      }
      const newLockBalance = BigInt(position.lock_balance) + cost;
      if(newLockBalance > MAX_64_BIT) {
        throw new Error("lock_balance overflow");
      }
    }*/

    const position = userState!.player!.data.positions[FEE_TOKEN_INDEX];
    if(position.balance < FEE) {
      throw new Error("Insufficient fee balance");
    }
    const newLockBalance = position.lock_balance + FEE;
    if(BigInt(newLockBalance) > MAX_64_BIT) {
      throw new Error("fee lock_balance overflow");
    }

    const action = await orderCheck(f, (before: any, after: any): boolean => {
      let feeBalanceChange = BigInt(FEE);
      let feeTokenIdx = FEE_TOKEN_INDEX;

      if ((before.state?.order_id_counter ?? 0) + 1 !== (after.state?.order_id_counter ?? 0)) {
        console.log("order_id_counter", before.state?.order_id_counter, after.state?.order_id_counter);
        return false;
      }

      // FEE_TOKEN_INDEX = 0, token index 0 should consider processing fee
      if (BigInt(after.player.data.positions[feeTokenIdx].lock_balance - before.player.data.positions[feeTokenIdx].lock_balance) !== feeBalanceChange) {
        console.log("fee lock_balance", after.player.data.positions[feeTokenIdx].lock_balance, before.player.data.positions[feeTokenIdx].lock_balance);
        return false;
      }

      if (BigInt(before.player.data.positions[feeTokenIdx].balance - after.player.data.positions[feeTokenIdx].balance) !== feeBalanceChange) {
        console.log("fee balance", after.player.data.positions[feeTokenIdx].balance, before.player.data.positions[feeTokenIdx].balance);
        return false;
      }
      /*
      if(tokenIndex == 1) {
        if (BigInt(after.player.data.positions[tokenIndex].lock_balance - before.player.data.positions[tokenIndex].lock_balance) !== cost) {
          console.log("lock_balance", after.player.data.positions[tokenIndex].lock_balance, before.player.data.positions[tokenIndex].lock_balance);
          return false;
        }

        if (BigInt(before.player.data.positions[tokenIndex].balance - after.player.data.positions[tokenIndex].balance) !== cost) {
          console.log("balance", after.player.data.positions[tokenIndex].balance, before.player.data.positions[tokenIndex].balance);
          return false;
        }
      }
      */
      return true;
    });

    let successMessage = "";
    if (sendTransaction.fulfilled.match(action)) {
      // Return success message along with the result
      const orders = action.payload.state.orders;
      const latestOrder = orders[orders.length - 1];
      successMessage += "Success: latest order is " + JSON.stringify(latestOrder);

      // Try match orders. If matched, get addTrade parameters
      const params = await matchOrdersGetTradeParams(orders, latestOrder);
      //const addTradeResult = await addTrade(params!.aOrderId, params!.bOrderId, params!.aActualAmount, params!.bActualAmount);
      //successMessage += " " + addTradeResult;
      return successMessage;
    } else if (sendTransaction.rejected.match(action)) {
      throw new Error("Error: " + action.payload);
    }
  };

  const addLimitOrder = async (marketId: bigint, flag: bigint, limitPrice: bigint, amount: bigint) => {
    if (!l2account) {
      setInfoMessage("Please connect wallet before any transactions!");
      setShowResult(true);
      setShowAddLimitOrderModal(false);
      return;
    }

    // Send transaction to add limit order
    let f = async () => {
      let params = [marketId, flag, limitPrice, amount];
      let action = await dispatch(
        sendTransaction({
          cmd: createCommand(BigInt(nonce), CMD_ADD_LIMIT_ORDER, params),
          prikey: l2account!.getPrivateKey(),
        })
      );
      return action;
    }

    // comment because of no market data in state
    /*const filteredMarkets = userState!.state.markets.filter(market => BigInt(market.market_id) === marketId);
    const market = filteredMarkets[0];
    let tokenIndex = 0;
    let cost = 0n;
    if (flag === BigInt(FLAG_BUY)) {  // If it's a Buy order
      tokenIndex = market.token_a;
      cost = amount * limitPrice;
      if(cost > MAX_64_BIT) {
        throw new Error("cost overflow");
      }
    } else if (flag === BigInt(FLAG_SELL)) {  // If it's a Sell order
      tokenIndex = market.token_b;
      cost = amount;
    }

    // positions' length is 2 now
    if(tokenIndex == 0 || tokenIndex == 1) {
      const position = userState!.player!.data.positions[tokenIndex];
      if(BigInt(position.balance) < cost) {
        throw new Error("Insufficient balance");
      }
      const newLockBalance = BigInt(position.lock_balance) + cost;
      if(newLockBalance > MAX_64_BIT) {
        throw new Error("lock_balance overflow");
      }
    }*/

    const position = userState!.player!.data.positions[FEE_TOKEN_INDEX];
    if(position.balance < FEE) {
      throw new Error("Insufficient fee balance");
    }
    const newLockBalance = position.lock_balance + FEE;
    if(BigInt(newLockBalance) > MAX_64_BIT) {
      throw new Error("fee lock_balance overflow");
    }

    // Validate if the state has changed correctly
    let action = await orderCheck(f, (before, after): boolean => {
      let feeBalanceChange = BigInt(FEE);

      if(("order_id_counter" in before.state?before.state["order_id_counter"]:0) + 1 != ("order_id_counter" in after.state?after.state["order_id_counter"]:0)) {
        return false;
      }
      if (BigInt(after.player.data.positions[FEE_TOKEN_INDEX].lock_balance - before.player.data.positions[FEE_TOKEN_INDEX].lock_balance) != feeBalanceChange) {
          return false;
      }
      if (BigInt(before.player.data.positions[FEE_TOKEN_INDEX].balance - after.player.data.positions[FEE_TOKEN_INDEX].balance) != feeBalanceChange) {
        return false;
      }
      return true;
    });
    if (!action) {
      throw new Error("orderCheck failed");
    }

    let successMessage = "";
    if (sendTransaction.fulfilled.match(action)) {
      // Return success message along with the result
      const orders = action.payload.state.orders;
      const latestOrder = orders[orders.length - 1];
      successMessage += "Success: latest order is " + JSON.stringify(latestOrder);

      // Try match orders. If matched, get addTrade parameters
      const params = await matchOrdersGetTradeParams(orders, latestOrder);
      //const addTradeResult = await addTrade(params!.aOrderId, params!.bOrderId, params!.aActualAmount, params!.bActualAmount);
      //successMessage += " " + addTradeResult;
      return successMessage;
    } else if (sendTransaction.rejected.match(action)) {
      throw Error(String(action.payload));
    }
  };

  const cancelOrder = async (orderId: bigint) => {
    if(!l2account) {
      setInfoMessage("Please connect wallet before any transactions!");
      setShowResult(true);
      setShowCancelOrderModal(false);
      return;
    }

    let params = [orderId];
    let action = await dispatch(
      sendTransaction({
        cmd: createCommand(BigInt(nonce), CMD_CANCEL_ORDER, params),
        prikey: l2account!.getPrivateKey(),
      })
    );
    if (sendTransaction.fulfilled.match(action)) {
      const orders = action.payload.state.orders;
      const status = orders[Number(orderId) - 1].status;
      //| status | uint8 | live/match/partial_match/partial_cancel/cancel |
      // status 4 means cancel
      return "Success: orderId " + orderId +"'s status is " + status;
    } else if(sendTransaction.rejected.match(action)) {
      throw Error("Error: " +  action.payload);
    }
  }

  const addMarket = async (tokenAIdx: bigint, tokenBIdx: bigint, lastPrice: bigint) => {
    if(!l2account) {
      setInfoMessage("Please connect wallet before any transactions!");
      setShowResult(true);
      setShowAddMarketModal(false);
      return;
    }

    let params = [tokenAIdx, tokenBIdx, lastPrice];
    const key = get_server_admin_key();
    const nonce = await getNonce(key);
    let action = await dispatch(
      sendTransaction({
        cmd: createCommand(BigInt(nonce), CMD_ADD_MARKET, params),
        prikey: get_server_admin_key(),
      })
    );
    if (sendTransaction.fulfilled.match(action)) {
      const counter = action.payload.state.market_id_counter;
      return "Success: market counter is " + counter;
    } else if(sendTransaction.rejected.match(action)) {
      throw Error("Error: " +  action.payload);
    }
  }

  const closeMarket = async (marketId: bigint) => {
    if(!l2account) {
      setInfoMessage("Please connect wallet before any transactions!");
      setShowResult(true);
      setShowCloseMarketModal(false);
      return;
    }

    let params = [marketId];
    const key = get_server_admin_key();
    const nonce = await getNonce(key);
    let action = await dispatch(
      sendTransaction({
        cmd: createCommand(BigInt(nonce), CMD_CLOSE_MARKET, params),
        prikey: get_server_admin_key(),
      })
    );
    if (sendTransaction.fulfilled.match(action)) {
      return "Market closed successfully!";
    } else if(sendTransaction.rejected.match(action)) {
      throw Error("Error: " +  action.payload);
    }
  }

  return (
    <>
      {/* Command Buttons */ }
      <MDBContainer>
        <MDBRow className="justify-content-start mt-4">
          {/* Token Management Commands */}
          <MDBCol md="3">
            <MDBBtn onClick={() => setShowAddTokenModal(true)} color="success" block>
              <MDBIcon icon="plus-circle" /> Add Token
            </MDBBtn>
          </MDBCol>
          <MDBCol md="3">
            <MDBBtn onClick={() => setShowUpdateTokenModal(true)} color="info" block>
              <MDBIcon icon="refresh" /> Update Token
            </MDBBtn>
          </MDBCol>
          <MDBCol md="3">
            <MDBBtn onClick={() => setShowDepositTokenModal(true)} color="primary" block>
              <MDBIcon icon="arrow-up" /> Deposit Token
            </MDBBtn>
          </MDBCol>
          <MDBCol md="3">
            <MDBBtn onClick={() => setShowWithdrawTokenModal(true)} color="danger" block>
              <MDBIcon icon="arrow-down" /> Withdraw Token
            </MDBBtn>
          </MDBCol>
        </MDBRow>

        <MDBRow className="justify-content-start mt-4">
          {/* Transfer and Deposit Commands */}
          <MDBCol md="3">
            <MDBBtn onClick={() => setShowTransferModal(true)} color="success" block>
              <MDBIcon icon="exchange-alt" /> Transfer Token
            </MDBBtn>
          </MDBCol>
        </MDBRow>

        <MDBRow className="justify-content-start mt-4">
          {/* Market Management Commands */}
          <MDBCol md="3">
            <MDBBtn onClick={() => setShowAddMarketModal(true)} color="info" block>
              <MDBIcon icon="building" /> Add Market
            </MDBBtn>
          </MDBCol>
          <MDBCol md="3">
            <MDBBtn onClick={() => setShowCloseMarketModal(true)} color="warning" block>
              <MDBIcon icon="times" /> Close Market
            </MDBBtn>
          </MDBCol>
        </MDBRow>

        <MDBRow className="justify-content-start mt-4">
          {/* Order Management Commands */}
          <MDBCol md="3">
            <MDBBtn onClick={() => setShowAddLimitOrderModal(true)} color="primary" block>
              <MDBIcon icon="plus" /> Add Limit Order
            </MDBBtn>
          </MDBCol>
          <MDBCol md="3">
            <MDBBtn onClick={() => setShowAddMarketOrderModal(true)} color="primary" block>
              <MDBIcon icon="plus" /> Add Market Order
            </MDBBtn>
          </MDBCol>
          <MDBCol md="3">
            <MDBBtn onClick={() => setShowCancelOrderModal(true)} color="danger" block>
              <MDBIcon icon="trash" /> Cancel Order
            </MDBBtn>
          </MDBCol>
        </MDBRow>
      </MDBContainer>

      {/* Modals */}
      <AddTokenModal
        show={showAddTokenModal}
        onClose={() => setShowAddTokenModal(false)}
        handler={addToken}
      />
      <UpdateTokenModal
        show={showUpdateTokenModal}
        onClose={() => setShowUpdateTokenModal(false)}
        handler={updateToken}
      />
      <WithdrawTokenModal
        show={showWithdrawTokenModal}
        onClose={() => setShowWithdrawTokenModal(false)}
        handler={withdrawToken}
      />
      <AddLimitOrderModal
        show={showAddLimitOrderModal}
        onClose={() => setShowAddLimitOrderModal(false)}
        handler={addLimitOrder}
      />
      <AddMarketOrderModal
        show={showAddMarketOrderModal}
        onClose={() => setShowAddMarketOrderModal(false)}
        handler={addMarketOrder}
      />
      <CancelOrderModal
        show={showCancelOrderModal}
        onClose={() => setShowCancelOrderModal(false)}
        handler={cancelOrder}
      />
      <AddMarketModal
        show={showAddMarketModal}
        onClose={() => setShowAddMarketModal(false)}
        handler={addMarket}
      />
      <CloseMarketModal
        show={showCloseMarketModal}
        onClose={() => setShowCloseMarketModal(false)}
        handler={closeMarket}
      />
      <TransferModal
        show={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        handler={transfer}
      />
      <DepositTokenModal
        show={showDepositTokenModal}
        onClose={() => setShowDepositTokenModal(false)}
        handler={depositToken}
      />
      <ResultModal
        infoMessage={infoMessage}
        show={showResult}
        onClose={() => setShowResult(false)}
      />
    </>
  );
}