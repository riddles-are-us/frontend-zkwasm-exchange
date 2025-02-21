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
import { sendTransaction } from "../request";

export interface DepositTokenProps {
  show: boolean;
  onClose: () => void;
  handler: (tokenIdx: bigint, amount: bigint) => Promise<string | undefined>
}

const DepositTokenModal: React.FC<DepositTokenProps> = ({
  show,
  onClose,
  handler
}) => {
  const [tokenIndex, setTokenIndex] = useState('');
  const [amount, setAmount] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  const closeModal = () => {
    setTokenIndex('');
    setAmount('');
    setErrorMessage("");
    onClose();
  }

  const onConfirm = async () => {
    try {
      setErrorMessage("");
      if (!tokenIndex) {
        throw new Error("Token index is missing");
      }

      if (!amount) {
        throw new Error("Token amount is missing");
      }

      setIsExecuting(true);

      // Validate token index
      const cleanedTokenIndex = Number(tokenIndex.trim());
      validateIndex(cleanedTokenIndex);

      // Validate token amount
      const cleanedAmount = Number(amount.trim());
      validateIndex(cleanedAmount, 64);

      const result = await handler(BigInt(cleanedTokenIndex), BigInt(cleanedAmount));

      setInfoMessage(result!);
      setTokenIndex('');
      setAmount('');
      setShowResult(true);
      onClose();
    } catch (error) {
      const err = formatErrorMessage(error);
      setErrorMessage(`depositing token: ${err}`);
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
              <h5 className="modal-title">Deposit Token</h5>
            </MDBModalHeader>
            <MDBModalBody>
              {errorMessage && <ErrorAlert message={errorMessage} onClose={() => setErrorMessage("")} />}
              <MDBInputGroup className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter token index as uint32 hexadecimal (e.g., 0x12...)"
                  value={tokenIndex}
                  onChange={(e) => setTokenIndex(e.target.value)}
                  required
                />
              </MDBInputGroup>
              <MDBInputGroup className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter token amount as uint64 hexadecimal (e.g., 0x12...)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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

export default DepositTokenModal;