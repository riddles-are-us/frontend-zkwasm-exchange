import { selectUserState } from '../data/state';
import { useAppSelector } from "../app/hooks";
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBTypography } from "mdb-react-ui-kit";

export default function PlayerInfo() {
  const userState = useAppSelector(selectUserState);

  return (
    <MDBContainer className="mt-3">
      <MDBRow>
        {userState && userState.player ? (
          Object.entries(userState.player.data.positions).map(([tokenIndex, position]) => (
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
                <MDBTypography tag="h6" className="mb-2">No player available</MDBTypography>
                <p>Please connect wallet and login apps to view balances.</p>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        )}
      </MDBRow>
    </MDBContainer>
  )
}