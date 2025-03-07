import React, { useState } from "react";
import { ethers } from "ethers";
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
import { validateIndex, validateHexString, formatAddress, formatErrorMessage } from "../utils/transaction";
import { ResultModal } from "./ResultModal";

export interface UpdateTokenProps {
  show: boolean;
  onClose: () => void;
  handler: (tokenIndex: bigint, address: string) => Promise<void>
}

const UpdateTokenModal: React.FC<UpdateTokenProps> = ({
  show,
  onClose,
  handler
}) => {
  const [tokenIndex, setTokenIndex] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  const closeModal = () => {
    setTokenIndex('');
    setTokenAddress('');
    setErrorMessage("");
    onClose();
  }

  const onConfirm = async () => {
    try {
      setErrorMessage("");
      if (!tokenIndex) {
        throw new Error("Token index is missing");
      }

      if (!tokenAddress) {
        throw new Error("Token address is missing");
      }

      setIsExecuting(true);

      // Validate token index
      const cleanedTokenIndex = Number(tokenIndex.trim());
      validateIndex(cleanedTokenIndex);

      // Validate token address
      const cleanedTokenAddress = tokenAddress.trim();
      validateHexString(cleanedTokenAddress, 40);
      const formattedAddress = formatAddress(cleanedTokenAddress);
      const validTokenAddress = ethers.getAddress(formattedAddress);

      await handler(BigInt(cleanedTokenIndex), validTokenAddress);

      setInfoMessage("Update token successfully!");
      setTokenIndex('');
      setTokenAddress('');
      setShowResult(true);
      onClose();
    } catch (error) {
      const err = formatErrorMessage(error);
      setErrorMessage(`updating token: ${err}`);
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
              <h5 className="modal-title">Update Token</h5>
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
                  placeholder="Enter token Address as uint256 hexadecimal (e.g., 0x12...)"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
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

export default UpdateTokenModal;