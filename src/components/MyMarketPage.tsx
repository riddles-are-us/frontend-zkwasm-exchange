import { MarketPageWidget, OrderBookWidget, TradingPanelWidget, useThemeContext } from "polymarket-ui";

export function MyMarketPage() {
  const { isDarkMode, toggleDarkMode } = useThemeContext();

  return (
    <div>
      <button onClick={toggleDarkMode}>Toggle {isDarkMode ? "Light" : "Dark"} Mode</button>
      <MarketPageWidget />
    </div>
  );
}