import React from 'react';
import { ConnectButton, LoginButton } from "../components/Connect";
import {
  MDBContainer,
  MDBNavbar
} from 'mdb-react-ui-kit';

export default function Nav() {
  return (
    <MDBNavbar expand='lg' light bgColor='light'>
      <MDBContainer fluid>
        <ConnectButton handleRestart={()=>{return;}}></ConnectButton>
        <LoginButton handleRestart={()=>{return;}}></LoginButton>
      </MDBContainer>
    </MDBNavbar>
  );
}