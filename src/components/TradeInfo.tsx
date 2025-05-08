import React, { useState } from 'react';
import {
  MDBPopover,
  MDBPopoverBody
} from 'mdb-react-ui-kit';
import { UserState } from "../data/state";
import { useAppSelector } from '../app/hooks';
import { selectUserState } from '../data/state';
import { selectMarketInfo } from "../data/market";
import { Order } from "../data/state";
import { typeMap, statusMap } from "./MarketPage";
import { FLAG_BUY } from './Commands';

interface TradeInfoProps {
  playerState: UserState | null;
  handleTabClick: (value: string) => void;
}

interface Trade {
  a_actual_amount: number;
  a_order_id: number;
  b_actual_amount: number;
  b_order_id: number;
  trade_id: number;
}

export const TradeInfo: React.FC<TradeInfoProps> = ({ playerState, handleTabClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const userState = useAppSelector(selectUserState);
  const marketInfo = useAppSelector(selectMarketInfo);
  const rowsPerPage = 5;

  // get orders data
  const orders = userState?.state?.orders || [];

  let trades: Trade[] = [];

  if(playerState && playerState.state) {
    trades = playerState.state.trades;
  }

  const totalPages = (trades && trades.length) ? Math.ceil(trades.length / rowsPerPage) : 0;

  const currentTrades = (trades && trades.length) ? trades.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  ) : [];

  const enrichedTrades = currentTrades.map((trade) => {
    const aOrder = orders.find(order => order.id === trade.a_order_id);
    const bOrder = orders.find(order => order.id === trade.b_order_id);

    if (!aOrder) {
      return {
        ...trade,
        aOrder: undefined,
        bOrder: undefined,
        marketId: '–',
        buyTokenIndexIn: null,
        buyTokenIndexOut: null
      };
    }

    const marketId = aOrder.market_id;
    const market = marketInfo.filter(market => market.marketId === marketId);

    if (market.length === 0) {
      return {
        ...trade,
        aOrder,
        bOrder,
        marketId: "-",
        buyTokenIndexIn: null,
        buyTokenIndexOut: null
      };
    }

    const buyTokenIndexIn = market[0].tokenA;
    const buyTokenIndexOut = market[0].tokenB;

    return {
      ...trade,
      aOrder,
      bOrder,
      marketId,
      buyTokenIndexIn,
      buyTokenIndexOut
    };
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderOrderPopover = (order: Order | undefined) => {
    if (!order) return '–';
    return (
      <MDBPopover
        placement="right"
        dismiss
        btnChildren={`View orderId ${order.id}`}
        btnClassName="btn btn-sm btn-outline-primary"
        popperTag="div"
      >
        <MDBPopoverBody className="text-start">
          <div><strong>Order ID:</strong> {order.id}</div>
          <div><strong>Market ID:</strong> {order.market_id}</div>
          <div><strong>Flag:</strong> {order.flag === FLAG_BUY ? "Buy": "Sell"}</div>
          <div><strong>Pid:</strong> {order.pid}</div>
          <div><strong>Type:</strong> {typeMap[order.type_]}</div>
          <div><strong>Status:</strong> {statusMap[order.status]}</div>
          <div><strong>Price:</strong> {order.price}</div>
          <div><strong>A Token Amount:</strong> {order.a_token_amount}</div>
          <div><strong>B Token Amount:</strong> {order.b_token_amount}</div>
          <div><strong>Locked Balance:</strong> {order.lock_balance}</div>
          <div><strong>Locked Fee:</strong> {order.lock_fee}</div>
          <div><strong>Already Deal Amount:</strong> {order.already_deal_amount}</div>
        </MDBPopoverBody>
      </MDBPopover>
    );
  };

  return (
    <div className="mt-3 text-gray-900 dark:text-white px-4">
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800 text-left text-sm font-semibold">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Trade ID</th>
              <th className="px-4 py-2">Market ID</th>
              <th className="px-4 py-2">Buy Side</th>
              <th className="px-4 py-2">Sell Side</th>
              <th className="px-4 py-2">Trading Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {enrichedTrades.map((trade, index) => (
              <tr key={index}>
                <td className="px-4 py-2">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                <td className="px-4 py-2">{trade.trade_id}</td>
                <td
                  className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  onClick={() => handleTabClick("4")}
                >
                  {trade.marketId}
                </td>
                <td className="px-4 py-2">
                  {renderOrderPopover(trade.aOrder)}
                  <br />
                  <span className="text-xs text-gray-500 dark:text-white">
                    (Paying Token Index {trade.buyTokenIndexIn} → Receiving Token Index {trade.buyTokenIndexOut})
                  </span>
                </td>
                <td className="px-4 py-2">
                  {renderOrderPopover(trade.bOrder)}
                  <br />
                  <span className="text-xs text-gray-500 dark:text-white">
                    (Paying Token Index {trade.buyTokenIndexOut} → Receiving Token Index {trade.buyTokenIndexIn})
                  </span>
                </td>
                <td className="px-4 py-2">{trade.a_actual_amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4 space-x-1">
        <button
          className={`px-3 py-1 rounded border text-sm ${
            currentPage === 1
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-white dark:bg-gray-800 text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`px-3 py-1 rounded border text-sm ${
              currentPage === i + 1
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className={`px-3 py-1 rounded border text-sm ${
            currentPage === totalPages
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-white dark:bg-gray-800 text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};