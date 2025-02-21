import React from 'react';
import { ConnectButton, LoginButton } from "../components/Connect";
import {
  MDBContainer,
  MDBNavbar,
  MDBNavbarBrand,
  MDBCol
} from 'mdb-react-ui-kit';

export default function Nav() {
  return (
    <MDBNavbar expand='lg' light bgColor='light'>
      <MDBContainer fluid>
        <MDBCol md="8">
          <MDBNavbarBrand href='#'>ZKWASM Exchange</MDBNavbarBrand>
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