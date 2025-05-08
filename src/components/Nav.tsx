import React, { useCallback, useState } from "react";
import { NavbarUI, useThemeContext } from "polymarket-ui";
import {
  UserIcon,
  InformationCircleIcon,
  Squares2X2Icon
} from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { AccountSlice } from "zkwasm-minirollup-browser";
import { extractErrorMessage } from "../utils/transaction";
import { addressAbbreviation } from "../utils/address";
import { ResultModal } from "../modals/ResultModal";

interface NavProps {
  handleTabClick: (value: string) => void;
}

export default function Nav(props: NavProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("123");
  const [userName, setUserName] = useState("");
  const { isDarkMode, toggleDarkMode } = useThemeContext();
  const [infoMessage, setInfoMessage] = useState("");
  const [showResult, setShowResult] = useState(false);
  const dispatch = useAppDispatch();
  const l1account = useAppSelector(AccountSlice.selectL1Account);

  const connect = useCallback(async () => {
    try {
      let action = await dispatch(AccountSlice.loginL1AccountAsync());
      if (AccountSlice.loginL1AccountAsync.fulfilled.match(action)) {
        console.log("Login successful:", action.payload);
        setIsConnected(true);
        setWalletAddress("0x44082c260E532C92cAc0172AbAD7B86B30Ce364b");
      } else if (AccountSlice.loginL1AccountAsync.rejected.match(action)) {
        const errorMessage = action.error.message || 'Unknown error';
        const userMessage = extractErrorMessage(errorMessage);
        throw new Error("Error: " + userMessage);
      }
    } catch (err: any) {
      setInfoMessage(err.message || "Unknown error");
      setShowResult(true);
    }
  }, [dispatch]);

  const login = useCallback(async () => {
    try {
      if (l1account) {
        let action = await dispatch(AccountSlice.loginL2AccountAsync("ZKWASM-BEAT"));
        if (AccountSlice.loginL2AccountAsync.fulfilled.match(action)) {
          console.log("Login successful:", action.payload);
          const l2addresshex = "0x" + action.payload.pubkey;
          setIsLoggedIn(true);
          setUserName("ID(l2address): " + addressAbbreviation(l2addresshex, 5));
        } else if (AccountSlice.loginL2AccountAsync.rejected.match(action)) {
          const errorMessage = action.error.message || 'Unknown error';
          const userMessage = extractErrorMessage(errorMessage);
          throw new Error("Error: " + userMessage);
        }
      } else {
        setInfoMessage("Please connect wallet first!");
        setShowResult(true);
      }
    } catch (err: any) {
      setInfoMessage(err.message || "Unknown error");
      setShowResult(true);
    }
  }, [dispatch, l1account]);

  const handleSearch = useCallback((query: string) => {
    console.log("Search:", query);
    // Implement search logic
  }, []);

  const handleLogin = useCallback(async () => {
    await login();
  }, [login]);

  const handleConnect = useCallback(async () => {
    await connect();
  }, [connect]);

  const handleProfileClick = useCallback(() => {
    console.log("Profile clicked");
  }, []);

  const handleLogoClick = useCallback(() => {
    console.log("Logo clicked");
    // Implement navigation to home
  }, []);

  const menuItems = [
    { label: "Admin Balance", onClick: () => props.handleTabClick("1"), icon: UserIcon },
    { label: "Wallet Player Balance", onClick: () => props.handleTabClick("2"), icon: UserIcon },
    { label: "Token Info", onClick: () => props.handleTabClick("3"), icon: InformationCircleIcon },
    { label: "Market Data", onClick: () => props.handleTabClick("4"), icon: Squares2X2Icon },
    { label: "Trade Info", onClick: () => props.handleTabClick("5"), icon: InformationCircleIcon }
  ];

  const navBarProps = {
    logo: {
      text: "ZKWASM Exchange",
      onClick: handleLogoClick,
    },
    search: {
      placeholder: "Search markets",
      onSearch: handleSearch,
    },
    menuItems: menuItems,
    auth: {
      isLoggedIn,
      isConnected,
      userName,
      walletAddress,
      onLogin: handleLogin,
      onConnect: handleConnect,
      onProfileClick: handleProfileClick,
    },
    darkMode: {
      enabled: isDarkMode,
      onToggle: toggleDarkMode,
    }
  };

  return (
    <>
    <NavbarUI {...navBarProps} />
    <ResultModal
      infoMessage={infoMessage}
      show={showResult}
      onClose={() => setShowResult(false)}
    />
    </>
  );
}