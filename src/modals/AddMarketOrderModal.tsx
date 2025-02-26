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
import { Form } from 'react-bootstrap';

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
  const [selectedToken, setSelectedToken] = useState(''); // To track selected token (Token A or Token B)
  const [selectedTokenAmount, setSelectedTokenAmount] = useState('');

  const closeModal = () => {
    setMarketId('');
    setFlag('');
    setSelectedToken('');
    setSelectedTokenAmount('');
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
        throw new Error("Please select buy/sell");
      }

      if(selectedToken == "") {
        throw new Error("Please select token");
      }

      if (!selectedTokenAmount) {
        throw new Error("The aTokenAmount is missing");
      }

      if(selectedToken == 'A') {
        setATokenAmount(selectedTokenAmount);
        setBTokenAmount('0');
      } else if(selectedToken == 'B') {
        setBTokenAmount(selectedTokenAmount);
        setATokenAmount('0');
      }

      setIsExecuting(true);

      // Validate marketId
      const cleanedMarketId = Number(marketId.trim());
      validateIndex(cleanedMarketId, 64);
      // Validate bTokenAmount
      const cleanedBTokenAmount = Number(bTokenAmount.trim());
      validateIndex(cleanedBTokenAmount, 64);
      // Validate bTokenAmount
      const cleanedATokenAmount = Number(aTokenAmount.trim());
      validateIndex(cleanedATokenAmount, 64);

      const result = await handler(BigInt(cleanedMarketId), BigInt(flag), BigInt(cleanedBTokenAmount), BigInt(cleanedATokenAmount));
      if(result) {
        setInfoMessage(result);
        setShowResult(true);
      }
      setMarketId('');
      setFlag('');
      setBTokenAmount('');
      setATokenAmount('');
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
                <Form.Select
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                >
                  <option value="">Select Buy/Sell</option>
                  <option value="1">Buy</option>
                  <option value="0">Sell</option>
                </Form.Select>
              </MDBInputGroup>
              <MDBInputGroup className="mb-3">
                <Form.Select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  required
                >
                  <option value="">Select Token</option>
                  <option value="A">Token A</option>
                  <option value="B">Token B</option>
                </Form.Select>
              </MDBInputGroup>
              <MDBInputGroup className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Enter ${selectedToken} amount as uint32 hexadecimal (e.g., 0x12...)`}
                  value={selectedTokenAmount}
                  onChange={(e) => setSelectedTokenAmount(e.target.value)}
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