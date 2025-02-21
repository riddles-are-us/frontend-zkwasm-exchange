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

export interface AddTokenProps {
  show: boolean;
  onClose: () => void;
  handler: (marketId: bigint, flag: bigint, bTokenAmount: bigint, aTokenAmount: bigint) => Promise<string | undefined>
}

const AddMarketOrderModal: React.FC<AddTokenProps> = ({
  show,
  onClose,
  handler
}) => {
  const [marketId, setMarketId] = useState('');
  const [flag, setFlag] = useState('');
  const [bTokenAmount, setBTokenAmount] = useState('');
  const [aTokenAmount, setATokenAmount] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  const closeModal = () => {
    setMarketId('');
    setFlag('');
    setBTokenAmount('');
    setATokenAmount('');
    setErrorMessage("");
    onClose();
  }

  const onConfirm = async () => {
    try {
      setErrorMessage("");
      if (!marketId) {
        throw new Error("The marketId is missing");
      }

      if (!flag) {
        throw new Error("The flag is missing");
      }

      if (!bTokenAmount) {
        throw new Error("The bTokenAmount is missing");
      }

      if (!aTokenAmount) {
        throw new Error("The aTokenAmount is missing");
      }

      setIsExecuting(true);

      // Validate marketId
      const cleanedMarketId = Number(marketId.trim());
      validateIndex(cleanedMarketId, 64);
      // Validate flag
      const cleanedFlag = Number(flag.trim());
      validateIndex(cleanedFlag, 64);
      // Validate bTokenAmount
      const cleanedBTokenAmount = Number(bTokenAmount.trim());
      validateIndex(cleanedBTokenAmount, 64);
      // Validate bTokenAmount
      const cleanedATokenAmount = Number(aTokenAmount.trim());
      validateIndex(cleanedATokenAmount, 64);

      const result = await handler(BigInt(cleanedMarketId), BigInt(cleanedFlag), BigInt(cleanedBTokenAmount), BigInt(cleanedATokenAmount));

      setInfoMessage(result!);
      setMarketId('');
      setFlag('');
      setBTokenAmount('');
      setATokenAmount('');
      setShowResult(true);
      onClose();
    } catch (error) {
      const err = formatErrorMessage(error);
      setErrorMessage(`adding market order: ${err}`);
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
              <h5 className="modal-title">Add Market Order</h5>
            </MDBModalHeader>
            <MDBModalBody>
              {errorMessage && <ErrorAlert message={errorMessage} onClose={() => setErrorMessage("")} />}
              <MDBInputGroup className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter marketId as uint32 hexadecimal (e.g., 0x12...)"
                  value={marketId}
                  onChange={(e) => setMarketId(e.target.value)}
                  required
                />
              </MDBInputGroup>
              <MDBInputGroup className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter flag as uint32 hexadecimal (e.g., 0x12...)"
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  required
                />
              </MDBInputGroup>
              <MDBInputGroup className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter token B amount as uint32 hexadecimal (e.g., 0x12...)"
                  value={bTokenAmount}
                  onChange={(e) => setBTokenAmount(e.target.value)}
                  required
                />
              </MDBInputGroup>
              <MDBInputGroup className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter token A amount as uint32 hexadecimal (e.g., 0x12...)"
                  value={aTokenAmount}
                  onChange={(e) => setATokenAmount(e.target.value)}
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

export default AddMarketOrderModal;