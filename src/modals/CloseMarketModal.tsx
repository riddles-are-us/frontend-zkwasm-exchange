import React, { useState } from "react";
import {
  MDBModal,
  MDBModalHeader,
  MDBModalBody,
  MDBModalFooter,
  MDBBtn,
  MDBInputGroup,
  MDBSpinner,
  MDBModalContent,
  MDBModalDialog
} from "mdb-react-ui-kit";
import ErrorAlert from '../components/ErrorAlert';
import { validateIndex, formatErrorMessage } from "../utils/transaction";
import { ResultModal } from "./ResultModal";

export interface CloseMarketProps {
  show: boolean;
  onClose: () => void;
  handler: (marketId: bigint) => Promise<void>
}

const CloseMarketModal: React.FC<CloseMarketProps> = ({
  show,
  onClose,
  handler
}) => {
  const [marketId, setMarketId] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  const closeModal = () => {
    setMarketId('');
    setErrorMessage("");
    onClose();
  }

  const onConfirm = async () => {
    try {
      setErrorMessage("");
      if (!marketId) {
        throw new Error("The marketId is missing");
      }

      setIsExecuting(true);

      // Validate marketId
      const cleanedMarketId = Number(marketId.trim());
      validateIndex(cleanedMarketId, 64);
      
      await handler(BigInt(cleanedMarketId));
      
      setInfoMessage("Market closed successfully!");
      setMarketId('');
      setShowResult(true);
      onClose();
    } catch (error) {
      const err = formatErrorMessage(error);
      setErrorMessage(`closing market: ${err}`);
    } finally {
      setIsExecuting(false);
    }
  }

  return (
    <>
      <MDBModal open={show} onClose={closeModal} staticBackdrop tabIndex='-1'>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <h5 className="modal-title">Close Market</h5>
            </MDBModalHeader>
            <MDBModalBody>
              {errorMessage && <ErrorAlert message={errorMessage} onClose={() => setErrorMessage("")} />}
              <MDBInputGroup className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter marketId as uint64 hexadecimal (e.g., 0x12...)"
                  value={marketId}
                  onChange={(e) => setMarketId(e.target.value)}
                  required
                />
              </MDBInputGroup>
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={closeModal}>
                Close
              </MDBBtn>
              <MDBBtn color="primary" onClick={onConfirm} disabled={isExecuting}>
                {isExecuting ? <MDBSpinner size="sm" role="status" tag="span" /> : "Confirm"}
              </MDBBtn>
            </MDBModalFooter>
          </ MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      <ResultModal
        infoMessage={infoMessage}
        show={showResult}
        onClose={() => setShowResult(false)}
      />
    </>
  );
};

export default CloseMarketModal;