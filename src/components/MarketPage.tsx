import React, { useMemo, useState, useCallback } from 'react';
import { selectUserState, Order } from '../data/state';
import { useAppSelector } from '../app/hooks';
import { selectMarketInfo } from "../data/market";
import { MarketChartUI, ChartData, OrderBookUI, OrderBookTab } from "polymarket-ui";
import { ResultModal } from "../modals/ResultModal";

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

interface MarketPageProps {
  selectedMarket: number | null;
  setSelectedMarket: React.Dispatch<React.SetStateAction<number | null>>;
  orderBookActiveTab: OrderBookTab;
  handleOrderBookTabChange: (tab: OrderBookTab) => void;
}

export const MarketPage: React.FC<MarketPageProps> = ({
  selectedMarket,
  setSelectedMarket,
  orderBookActiveTab,
  handleOrderBookTabChange
}) => {
  const userState = useAppSelector(selectUserState);
  const marketInfo = useAppSelector(selectMarketInfo);
  const [selectedTimeRange, setSelectedTimeRange] = useState("ALL");
  const [infoMessage, setInfoMessage] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [activeTab, setActiveTab] = useState("orderbook");

  // get orders data
  const orders = useMemo(() => userState?.state?.orders ?? [], [userState?.state?.orders]);

  // group orders by marketId
  const groupedOrders = useMemo(() => {
    return orders.reduce((acc: { [key: number]: any[] }, order) => {
      if (!acc[order.market_id]) acc[order.market_id] = [];
      acc[order.market_id].push(order);
      return acc;
    }, {});
  }, [orders]);

  const handleTabClick = (tab: string) => {
    if (tab !== activeTab) setActiveTab(tab);
  };

  const handleMarketClick = (marketId: number) => {
    setSelectedMarket(marketId === selectedMarket ? null : marketId); // Toggle market selection
  };

  const handleTimeRangeChange = useCallback((range: string) => {
    setSelectedTimeRange(range);
    // In a real implementation, this would fetch new data based on the time range
  }, []);

  const handleBookmark = useCallback(() => {
    setInfoMessage("Bookmark clicked");
    setShowResult(true);
    // Implement bookmark logic
  }, []);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setInfoMessage("Share clicked");
    setShowResult(true);
    // Implement share logic
  }, []);

  const handleCopy = useCallback(() => {
    setInfoMessage("Copy clicked");
    setShowResult(true);
    // Implement copy logic
  }, []);

  const activeMarkets = marketInfo.filter(market => market.status === 1);

  // Mock data generator
  // no data in state from back end now
  const generateMockChartData = (orders: Order[]): ChartData[] => {
    const data: ChartData[] = [];
    const now = new Date();
    let price;
    for (let i = orders.length - 1; i >= 0; i--) {
      const date = new Date(now);
      if(orders.length === 0) {
        price = 0;
      } else {
        price = orders[i].price;
      }
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString(),
        price
      });
    }

    return data;
  };

  const orderBookPropsArray = useMemo(() => {
    return activeMarkets.map((market) => {
      const marketId = market.marketId;
      const marketOrders = groupedOrders[marketId] || [];
      let asks = marketOrders.filter((order: any) => order.flag === 0).sort((a, b) => b.price - a.price);
      asks = asks.map((ask) => {
        let quantity = ask.b_token_amount ? ask.b_token_amount : ask.a_token_amount;
        let price = ask.price;
        let total = parseFloat(((price * quantity) / 100).toFixed(2));
        return {
          price,
          quantity,
          total
        }
      });
      let bids = marketOrders.filter((order: any) => order.flag === 1).sort((a, b) => b.price - a.price);
      bids = bids.map((bid) => {
        let quantity = bid.b_token_amount ? bid.b_token_amount : bid.a_token_amount;
        let price = bid.price;
        let total = parseFloat(((price * quantity) / 100).toFixed(2));
        return {
          price,
          quantity,
          total
        }
      });

      return {
        title: "Market " + marketId,
        asks,
        bids,
        lastPrice: Number(market.lastPrice),
        spread: asks.length && bids.length ? Number((asks[0].price - bids[0].price).toFixed(2)) : 0,
        activeTab: orderBookActiveTab,
        onTabChange: handleOrderBookTabChange,
      }
    });
  }, [activeMarkets, groupedOrders, orderBookActiveTab, handleOrderBookTabChange]);

  const marketChartPropsArray = useMemo(() => {
    return activeMarkets.map((market) => {
      const marketId = market.marketId;
      const marketOrders = groupedOrders[marketId] || [];
      let mainValue;
      let changeValue;
      if(marketOrders.length !== 0) {
        let lastOrder = marketOrders[marketOrders.length - 1];
        let firstOrder = marketOrders[0];
        mainValue = lastOrder.price;
        changeValue = mainValue - firstOrder.price
      } else {
        mainValue = 0;
        changeValue = 0;
      }
      return {
        title: "Market " + marketId,
        mainValue,
        changeValue,
        chartData: generateMockChartData(marketOrders),
        selectedTimeRange,
        onTimeRangeChange: handleTimeRangeChange,
        actions: {
          onBookmark: handleBookmark,
          onShare: handleShare,
          onCopy: handleCopy,
        }
      }
    });
  }, [
    activeMarkets,
    groupedOrders,
    handleBookmark,
    handleCopy,
    handleShare,
    handleTimeRangeChange,
    selectedTimeRange
  ]);

  return (
    <>
    <div className="grid grid-cols-1 gap-4">
      {activeMarkets.length === 0 ? (
        <div>No markets available</div>
      ) : (
        activeMarkets.map((market, index) => {
          const marketId = market.marketId;
          return (
            <div key={marketId} className="col-span-1">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md">
                <div className="pt-4 pl-5">
                  <div className="flex items-center">
                    <h5
                      onClick={() => handleMarketClick(1)}
                      className="cursor-pointer text-black dark:text-white hover:underline"
                    >
                      Market {marketId}
                    </h5>
                  </div>
                </div>

                {selectedMarket === 1 && (
                  <div className="pt-2">
                    <div className="mb-3 flex space-x-4 border-b border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => handleTabClick("orderbook")}
                        className={`py-2 px-4 text-sm font-medium ${
                          activeTab === "orderbook"
                            ? "border-b-2 border-white text-black dark:text-white"
                            : "text-gray-500 hover:text-black dark:hover:text-white"
                        }`}
                      >
                        Orderbook
                      </button>
                      <button
                        onClick={() => handleTabClick("graph")}
                        className={`py-2 px-4 text-sm font-medium ${
                          activeTab === "graph"
                            ? "border-b-2 border-white text-black dark:text-white"
                            : "text-gray-500 hover:text-black dark:hover:text-white"
                        }`}
                      >
                        Graph
                      </button>
                    </div>

                    <div>
                      {activeTab === "orderbook" &&
                        orderBookPropsArray &&
                        orderBookPropsArray[index] && (
                          <OrderBookUI {...orderBookPropsArray[index]} />
                        )}

                      {activeTab === "graph" &&
                        marketChartPropsArray &&
                        marketChartPropsArray[index] && (
                          <MarketChartUI {...marketChartPropsArray[index]} />
                        )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
    <ResultModal
      infoMessage={infoMessage}
      show={showResult}
      onClose={() => setShowResult(false)}
    />
    </>
  );
};