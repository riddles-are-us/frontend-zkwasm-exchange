import React, { useState, useCallback } from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardHeader, MDBTable, MDBTableBody, MDBTableHead } from 'mdb-react-ui-kit';
import { selectUserState } from '../data/state';
import { useAppSelector } from '../app/hooks';
import { selectMarketInfo } from "../data/market";
import { MarketChartUI, ChartData, OrderBookUI, OrderItem } from "polymarket-ui";

export const typeMap: { [key: number]: string } = {
  0: "Limit Order",
  1: "Market Order"
}

export const statusMap: { [key: number]: string } = {
  0: 'Live',
  1: 'Match',
  2: 'Partial Match',
  3: 'Partial Cancel',
  4: 'Cancel',
};

const generateMockOrders = (basePrice: number, count: number, isAsk: boolean): OrderItem[] => {
  return Array.from({ length: count }, (_, i) => {
    const priceOffset = isAsk ? i * 1 : -i * 1; // Use whole numbers for cents
    const price = Math.round(basePrice + priceOffset);
    const quantity = parseFloat((Math.random() * 10000 + 1000).toFixed(2));
    return {
      price,
      quantity,
      total: parseFloat(((price * quantity) / 100).toFixed(2)),
    };
  });
};

export const MarketPage = () => {
  const [selectedMarket, setSelectedMarket] = useState<number | null>(null);
  const userState = useAppSelector(selectUserState);
  const marketInfo = useAppSelector(selectMarketInfo);
  const [selectedTimeRange, setSelectedTimeRange] = useState("ALL");
  const basePrice = 29; // Base price in cents
  const fixedOrderCount = 10; // Fixed order count
  const [lastPrice, setLastPrice] = useState(basePrice);
  const [previousPrice, setPreviousPrice] = useState(basePrice);
  const [asks, setAsks] = useState(() =>
    generateMockOrders(basePrice, fixedOrderCount, true).sort((a, b) => a.price - b.price)
  );
  const [bids, setBids] = useState(() =>
    generateMockOrders(basePrice, fixedOrderCount, false).sort((a, b) => b.price - a.price)
  );

  // Calculate price direction
  const priceDirection: "up" | "down" | "neutral" =
  lastPrice > previousPrice ? "up" : lastPrice < previousPrice ? "down" : "neutral";

  const handleMarketClick = (marketId: number) => {
    setSelectedMarket(marketId === selectedMarket ? null : marketId); // Toggle market selection
  };

  // get orders data
  const orders = userState?.state?.orders || [];

  // group orders by marketId
  const groupedOrders: { [key: number]: any[] } = orders.reduce((acc: { [key: number]: any[] }, order) => {
    if (!acc[order.market_id]) {
      acc[order.market_id] = [];
    }
    acc[order.market_id].push(order);
    return acc;
  }, {});

  const activeMarkets = marketInfo.filter(market => market.status === 1);

  const generateMockChartData = (days: number): ChartData[] => {
    const data: ChartData[] = [];
    const now = new Date();
    let basePrice = 50;

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Generate some random price movement
      basePrice = basePrice + (Math.random() - 0.5) * 5;

      data.push({
        date: date.toISOString(),
        price: Number(basePrice.toFixed(2)),
      });
    }

    return data;
  };

  const handleTimeRangeChange = useCallback((range: string) => {
    setSelectedTimeRange(range);
    // In a real implementation, this would fetch new data based on the time range
  }, []);

  const handleBookmark = useCallback(() => {
    console.log("Bookmark clicked");
    // Implement bookmark logic
  }, []);

  const handleShare = useCallback(() => {
    console.log("Share clicked");
    // Implement share logic
  }, []);

  const handleCopy = useCallback(() => {
    console.log("Copy clicked");
    // Implement copy logic
  }, []);

  const handleOrderClick = useCallback(
    (order: OrderItem, type: "ask" | "bid") => {
      console.log(`${type} order clicked:`, order);

      // Simulate transaction, update the latest price
      setPreviousPrice(lastPrice);
      setLastPrice(order.price);

      // Update order quantity (simulate partial transaction)
      if (type === "ask") {
        setAsks((prevAsks) => {
          let updated = prevAsks.map((ask) =>
            ask.price === order.price
              ? { ...ask, quantity: Math.max(0, ask.quantity - Math.floor(ask.quantity * 0.3)) }
              : ask
          );

          // Remove orders with quantity 0
          updated = updated.filter((ask) => ask.quantity > 0);

          // If order count is insufficient, add new orders
          if (updated.length < fixedOrderCount) {
            const lastAsk = updated[updated.length - 1];
            const newPrice = Number((lastAsk.price + 0.5).toFixed(2));
            const newQuantity = Math.floor(Math.random() * 10000) + 1000;

            updated.push({
              price: newPrice,
              quantity: newQuantity,
              total: Number(((newPrice * newQuantity) / 100).toFixed(2)),
            });
          }

          return updated.sort((a, b) => a.price - b.price);
        });
      } else {
        setBids((prevBids) => {
          let updated = prevBids.map((bid) =>
            bid.price === order.price
              ? { ...bid, quantity: Math.max(0, bid.quantity - Math.floor(bid.quantity * 0.3)) }
              : bid
          );

          // Remove orders with quantity 0
          updated = updated.filter((bid) => bid.quantity > 0);

          // If order count is insufficient, add new orders
          if (updated.length < fixedOrderCount) {
            const firstBid = updated[0];
            const newPrice = Number((firstBid.price - 0.5).toFixed(2));
            const newQuantity = Math.floor(Math.random() * 10000) + 1000;

            updated.push({
              price: newPrice,
              quantity: newQuantity,
              total: Number(((newPrice * newQuantity) / 100).toFixed(2)),
            });
          }

          return updated.sort((a, b) => b.price - a.price);
        });
      }
    },
    [lastPrice, fixedOrderCount]
  );

  return (
    <MDBContainer className="mt-5">
      <MDBRow>
        {activeMarkets.length === 0 ? (
          <div>No markets available</div>
        ) : (
          activeMarkets.map((market) => {
            const marketId =  market.marketId;
            const marketOrders = groupedOrders[marketId] || [];
            const title = "Market " + marketId;
            const now = new Date();
            const date = new Date(now);

            const marketChartProps = {
              title,
              subtitle: "",
              mainValue: "75",
              changeValue: 2.5,
              chartData: [{
                date: date.toISOString(),
                price: Number(2),
              },
              {
                date: date.toISOString(),
                price: Number(2),
              }],
              selectedTimeRange,
              onTimeRangeChange: handleTimeRangeChange,
              actions: {
                onBookmark: handleBookmark,
                onShare: handleShare,
                onCopy: handleCopy,
              },
            }
            const orderBookProps = {
              asks,
              bids,
              summary: {
                lastPrice,
                spread: asks.length && bids.length ? Number((asks[0].price - bids[0].price).toFixed(2)) : 0,
                priceDirection,
              },
              config: {
                priceUnit: "$",
                quantityLabel: "Quantity",
                totalLabel: "Total",
                askColor: "text-red-500",
                bidColor: "text-green-500",
              },
              onOrderClick: handleOrderClick,
              title: "Order Book",
              className: ""
            };
            return (
              <>
              <MarketChartUI {...marketChartProps} />
              <OrderBookUI {...orderBookProps} />
              <MDBCol md="12" key={marketId}>
                <MDBCard>
                  <MDBCardHeader>
                    <div className="d-flex">
                      <h5
                        onClick={() => handleMarketClick(marketId)}
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onMouseEnter={(e) => (e.target as HTMLElement).style.textDecoration = 'underline'}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.textDecoration = 'none'}
                      >
                        Market {marketId}
                      </h5>
                    </div>
                  </MDBCardHeader>
                  {selectedMarket === marketId && (
                    <MDBCardBody>
                      {marketOrders.length === 0 ? (
                        <div>No orders available</div>
                      ) : (
                        <>
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
                                .filter((order: any) => order.flag === 0)
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
                                .filter((order: any) => order.flag === 1)
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
                        </>
                      )}
                    </MDBCardBody>
                  )}
                </MDBCard>
              </MDBCol>
              </>
            );
          })
        )}
      </MDBRow>
    </MDBContainer>
  );
};