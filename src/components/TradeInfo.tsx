import React, { useState } from 'react';
import { useAppSelector } from "../app/hooks";
import { selectUserState } from '../data/state';
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
  const rowsPerPage = 5;

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
            <th scope="col">A Order ID</th>
            <th scope="col">B Order ID</th>
            <th scope="col">A Actual Amount</th>
            <th scope="col">B Actual Amount</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {currentTrades.map((trade, index) => (
            <tr key={index}>
              <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
              <td>{trade.trade_id}</td>
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