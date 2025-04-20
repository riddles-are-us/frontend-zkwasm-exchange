import React, { useCallback, useState } from "react";
import { ConnectButton, LoginButton } from "../components/Connect";
import {
  MDBContainer,
  MDBNavbar,
  MDBCol
} from 'mdb-react-ui-kit';
import { NavbarUI, useThemeContext } from "polymarket-ui";
import {
  UserIcon,
  InformationCircleIcon,
  Squares2X2Icon
} from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {AccountSlice} from "zkwasm-minirollup-browser";
import { extractErrorMessage } from "../utils/transaction";

interface NavProps {
  handleTabClick: (value: string) => void;
}

export default function Nav(props: NavProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>();
  const { isDarkMode, toggleDarkMode } = useThemeContext();
  const [infoMessage, setInfoMessage] = useState("");
  const [showResult, setShowResult] = useState(false);
  const dispatch = useAppDispatch();
  const l1account = useAppSelector(AccountSlice.selectL1Account);

 async function connect() {
    try {
      let action = await dispatch(AccountSlice.loginL1AccountAsync());
      if (AccountSlice.loginL1AccountAsync.fulfilled.match(action)) {
        console.log("Login successful:", action.payload);
      } else if (AccountSlice.loginL1AccountAsync.rejected.match(action)) {
        const errorMessage = action.error.message || 'Unknown error';
        const userMessage = extractErrorMessage(errorMessage);
        throw new Error("Error: " + userMessage);
      }
    } catch (err: any) {
      setInfoMessage(err.message || "Unknown error");
      setShowResult(true);
    }
  }

  const handleSearch = useCallback((query: string) => {
    console.log("Search:", query);
    // Implement search logic
  }, []);

  const handleLogin = useCallback(() => {
    console.log("Login clicked");
    setIsLoggedIn(true);
    setUserName("John Doe"); // Mock user data
  }, []);

  const handleSignUp = useCallback(() => {
    console.log("Sign up clicked");
    // Implement sign up logic
  }, []);

  const handleProfileClick = useCallback(() => {
    console.log("Profile clicked");
    // Implement profile menu logic
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
      userName,
      onLogin: handleLogin,
      onSignUp: handleSignUp,
      onProfileClick: handleProfileClick,
    },
    darkMode: {
      enabled: isDarkMode,
      onToggle: toggleDarkMode,
    }
  };

  return (
    <MDBNavbar expand='lg' light bgColor='light'>
      <MDBContainer fluid>
        <MDBCol md="12">
          <NavbarUI {...navBarProps} />
        </MDBCol>
        <MDBCol md="2">
          <ConnectButton handleRestart={()=>{return;}}></ConnectButton>
        </MDBCol>
        <MDBCol>
          <LoginButton handleRestart={()=>{return;}}></LoginButton>
        </MDBCol>
      </MDBContainer>
    </MDBNavbar>
  );
}