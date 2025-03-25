import { useEffect, useState } from 'react';
import { queryStateI } from "../request";
import { server_admin_key } from "../layout/Main";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBTypography
} from "mdb-react-ui-kit";
import { PlayerInfo, GlobalState } from "../data/state";

interface UserState {
  player: PlayerInfo | null,
  state: GlobalState,
}

export default function AdminInfo() {
  const [inc, setInc] = useState(0);
  const [adminState, setAdminState] = useState<UserState | null>(null);

  async function updateAdminState() {
    try {
      const state = await queryStateI(server_admin_key);
      setAdminState(state);
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 500) {
          throw new Error("QueryAdminStateError");
        } else {
          throw new Error("UnknownError");
        }
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        throw new Error("No response was received from the server, please check your network connection.");
      } else {
        throw new Error("UnknownError");
      }
    }
    setInc(inc + 1);
  }

  useEffect(() => {
    setTimeout(() => {
      updateAdminState();
    }, 3000);
  }, [inc]);

  return (
    <MDBContainer className="mt-3">
      <MDBRow>
        {adminState && adminState.player ? (
          Object.entries(adminState.player.data.positions).map(([tokenIndex, position]) => (
            <MDBCol md="6" key={tokenIndex}>
              <MDBCard className="mb-3">
                <MDBCardBody>
                  <MDBTypography tag="h6" className="mb-2">Token {tokenIndex}</MDBTypography>
                  <p className="mb-1"><strong>Balance:</strong> {position.balance}</p>
                  <p className="mb-0"><strong>Locked:</strong> {position.lock_balance}</p>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          ))
        ) : (
          <MDBCol md="12">
            <MDBCard className="mb-3">
              <MDBCardBody className="text-center">
                <MDBTypography tag="h6" className="mb-2">No admin available</MDBTypography>
                <p>Please check admin.</p>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        )}
      </MDBRow>
    </MDBContainer>
  )
}