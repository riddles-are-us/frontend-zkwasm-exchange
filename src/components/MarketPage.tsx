import React, { useState } from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardHeader, MDBTable, MDBTableBody, MDBTableHead } from 'mdb-react-ui-kit';
import { selectUserState } from '../data/state';
import { useAppSelector } from '../app/hooks';
import "./style.scss";

const typeMap: { [key: number]: string } = {
  0: "Limit Order",
  1: "Market Order"
}

const statusMap: { [key: number]: string } = {
  0: 'Live',
  1: 'Match',
  2: 'Partial Match',
  3: 'Partial Cancel',
  4: 'Cancel',
};

export const MarketPage = () => {
  const [selectedMarket, setSelectedMarket] = useState<number | null>(null);
  const userState = useAppSelector(selectUserState);
  const handleMarketClick = (marketId: number) => {
    setSelectedMarket(marketId === selectedMarket ? null : marketId); // Toggle market selection
  };

  // Group orders by market_id
  const marketsData = userState?.state?.orders || [];

  // Grouping orders by market_id
  const groupedMarkets: { [key: number]: any[] } = marketsData.reduce((acc: { [key: number]: any[] }, order) => {
    if (!acc[order.market_id]) {
      acc[order.market_id] = [];
    }
    acc[order.market_id].push(order);
    return acc;
  }, {});

  return (
    <MDBContainer className="mt-5">
      <MDBRow>
        {/* Render each market's orders in a row */}
        {Object.keys(groupedMarkets).map((marketId) => {
          const marketOrders = groupedMarkets[Number(marketId)];
          return (
            <MDBCol md="12" key={marketId}>
              <MDBCard>
                <MDBCardHeader>
                  <div className="d-flex">
                    <h5
                      onClick={() => handleMarketClick(Number(marketId))}
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      onMouseEnter={(e) => (e.target as HTMLElement).style.textDecoration = 'underline'}
                      onMouseLeave={(e) => (e.target as HTMLElement).style.textDecoration = 'none'}
                    >
                      {/* Displaying market_id as market identifier */}
                      Market {marketId}
                    </h5>
                  </div>
                </MDBCardHeader>
                {selectedMarket === Number(marketId) && (
                  <MDBCardBody>
                    {/* Displaying Asks (flag 0) */}
                    <h6>Asks</h6>
                    <MDBTable>
                      <MDBTableHead>
                        <tr>
                          <th>Order ID</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Player Id</th>
                          <th>Lock Balance</th>
                          <th>Lock Fee</th>
                          <th>Price</th>
                          <th>B Token Amount</th>
                          <th>A Token Amount</th>
                          <th>Already Deal Amount</th>
                        </tr>
                      </MDBTableHead>
                      <MDBTableBody>
                        {marketOrders
                          .filter((order: any) => order.flag === 0) // Filter asks (flag 0)
                          .map((ask, idx) => (
                            <tr key={idx}>
                              <td>{ask.id}</td>
                              <td>{typeMap[ask.type_]}</td>
                              <td>{statusMap[ask.status]}</td>
                              <td>{ask.pid}</td>
                              <td>{ask.lock_balance}</td>
                              <td>{ask.lock_fee}</td>
                              <td>{ask.price}</td>
                              <td>{ask.b_token_amount}</td>
                              <td>{ask.a_token_amount}</td>
                              <td>{ask.already_deal_amount}</td>
                            </tr>
                          ))}
                      </MDBTableBody>
                    </MDBTable>

                    {/* Displaying Bids (flag 1) */}
                    <h6>Bids</h6>
                    <MDBTable>
                      <MDBTableHead>
                        <tr>
                          <th>Order ID</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Pid</th>
                          <th>Lock Balance</th>
                          <th>Lock Fee</th>
                          <th>Price</th>
                          <th>B Token Amount</th>
                          <th>A Token Amount</th>
                          <th>Already Deal Amount</th>
                        </tr>
                      </MDBTableHead>
                      <MDBTableBody>
                        {marketOrders
                          .filter((order: any) => order.flag === 1) // Filter bids (flag 1)
                          .map((bid, idx) => (
                            <tr key={idx}>
                              <td>{bid.id}</td>
                              <td>{typeMap[bid.type_]}</td>
                              <td>{statusMap[bid.status]}</td>
                              <td>{bid.pid}</td>
                              <td>{bid.lock_balance}</td>
                              <td>{bid.lock_fee}</td>
                              <td>{bid.price}</td>
                              <td>{bid.b_token_amount}</td>
                              <td>{bid.a_token_amount}</td>
                              <td>{bid.already_deal_amount}</td>
                            </tr>
                          ))}
                      </MDBTableBody>
                    </MDBTable>
                  </MDBCardBody>
                )}
              </MDBCard>
            </MDBCol>
          );
        })}
      </MDBRow>
    </MDBContainer>
  );
};