import React, { useState } from 'react';
import {
  MDBContainer,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBPagination,
  MDBPaginationItem,
  MDBPaginationLink,
} from 'mdb-react-ui-kit';
import { UserState } from "../data/state";
import { useAppSelector } from '../app/hooks';
import { selectUserState } from '../data/state';
import { selectMarketInfo } from "../data/market";

interface TradeInfoProps {
  playerState: UserState | null;
}

interface Trade {
  a_actual_amount: number;
  a_order_id: number;
  b_actual_amount: number;
  b_order_id: number;
  trade_id: number;
}

export const TradeInfo: React.FC<TradeInfoProps> = ({ playerState }) => {
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

  const totalPages = Math.ceil(trades.length / rowsPerPage);

  const currentTrades = trades.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const enrichedTrades = currentTrades.map((trade) => {
    const aOrder = orders[trade.a_order_id];

    const market = marketInfo.filter(market => market.marketId === aOrder.market_id);
    const buyTokenIn = market[0].tokenA;
    const buyTokenOut = market[0].tokenB;
    const sellTokenIn = market[0].tokenB;
    const sellTokenOut = market[0].tokenA;

    return {
      ...trade,
      buyTokenIn,
      buyTokenOut,
      sellTokenIn,
      sellTokenOut
    };
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <MDBContainer className="mt-3">
      <MDBTable>
        <MDBTableHead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Trade ID</th>
            <th scope="col">Market ID</th>
            <th scope="col">
              Buy Side<br />
              <i>(Input Token Index → Output Token Index)</i>
            </th>
            <th scope="col">
              Sell Side<br />
              <i>(Input Token Index → Output Token Index)</i>
            </th>
            <th scope="col">Buy Actual Amount</th>
            <th scope="col">Sell Actual Amount</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {enrichedTrades.map((trade, index) => (
            <tr key={index}>
              <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
              <td>{trade.trade_id}</td>
              {(() => {
                  const order = orders.find(order => order.id === trade.a_order_id);
                  return order ? (
                    <td>{order.market_id}</td>
                  ) : (
                    <td>–</td>
                  );
                })()
              }
              <td>
                {trade.buyTokenIn} → {trade.buyTokenOut}
                <br />
                (Order ID: {trade.a_order_id})
              </td>
              <td>
                {trade.sellTokenIn} → {trade.sellTokenOut}
                <br />
                (Order ID: {trade.b_order_id})
              </td>
              <td>{trade.a_actual_amount}</td>
              <td>{trade.b_actual_amount}</td>
            </tr>
          ))}
        </MDBTableBody>
      </MDBTable>

      <MDBPagination className="mb-0">
        <MDBPaginationItem disabled={currentPage === 1}>
          <MDBPaginationLink
            style={{ cursor: 'pointer' }}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </MDBPaginationLink>
        </MDBPaginationItem>
        {[...Array(totalPages)].map((_, i) => (
          <MDBPaginationItem key={i} active={currentPage === i + 1}>
            <MDBPaginationLink
              style={{ cursor: 'pointer' }}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </MDBPaginationLink>
          </MDBPaginationItem>
        ))}
        <MDBPaginationItem disabled={currentPage === totalPages}>
          <MDBPaginationLink
            style={{ cursor: 'pointer' }}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </MDBPaginationLink>
        </MDBPaginationItem>
      </MDBPagination>
    </MDBContainer>
  );
};