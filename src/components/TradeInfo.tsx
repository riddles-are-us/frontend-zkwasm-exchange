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
  const rowsPerPage = 5;

  // get orders data
  const orders = userState?.state?.orders || [];

  // group orders by id
  const groupOrders: { [key: number]: any[] } = orders.reduce((acc: { [key: number]: any[] }, order) => {
    if (!acc[order.id]) {
      acc[order.id] = [];
    }
    acc[order.id].push(order.market_id);
    return acc;
  }, {});

  let trades: Trade[] = [];

  if(playerState && playerState.state) {
    trades = playerState.state.trades;
  }

  const totalPages = Math.ceil(trades.length / rowsPerPage);

  const currentTrades = trades.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

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
            <th scope="col">Buy Order ID</th>
            <th scope="col">Sell Order ID</th>
            <th scope="col">Buy Actual Amount</th>
            <th scope="col">Sell Actual Amount</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {currentTrades.map((trade, index) => (
            <tr key={index}>
              <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
              <td>{trade.trade_id}</td>
              <td>{groupOrders[trade.a_order_id]}</td>
              <td>{trade.a_order_id}</td>
              <td>{trade.b_order_id}</td>
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