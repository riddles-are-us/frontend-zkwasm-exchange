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

export interface AddLimitOrderProps {
  show: boolean;
  onClose: () => void;
  handler: (marketId: bigint, flag: bigint, limitPrice: bigint, amount: bigint) => Promise<string | undefined>
}

const AddLimitOrderModal: React.FC<AddLimitOrderProps> = ({
  show,
  onClose,
  handler
}) => {
  const [marketId, setMarketId] = useState("");
  const [flag, setFlag] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  const closeModal = () => {
    setMarketId('');
    setFlag('');
    setLimitPrice('');
    setAmount('');
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
      if (!limitPrice) {
        throw new Error("The limitPrice is missing");
      }
      if (!amount) {
        throw new Error("The amount is missing");
      }

      setIsExecuting(true);

      // Validate marketId
      const cleanedOrderId = Number(marketId.trim());
      validateIndex(cleanedOrderId, 64);
      // Validate limitPrice
      const cleanedLimitPrice = Number(limitPrice.trim());
      validateIndex(cleanedLimitPrice, 64);
      // Validate amount
      const cleanedAmount = Number(amount.trim());
      validateIndex(cleanedAmount, 64);

      const result = await handler(BigInt(cleanedOrderId), BigInt(flag), BigInt(cleanedLimitPrice), BigInt(cleanedAmount));
      if(result) {
        setInfoMessage(result);
        setShowResult(true);
      }
      closeModal();
    } catch (error) {
      const err = formatErrorMessage(error);
      setErrorMessage(`${err}`);
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
              <h5 className="modal-title">Add Limit Order</h5>
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
                  <option value="" disabled>Select Buy/Sell</option>
                  <option value="1">Buy</option>
                  <option value="0">Sell</option>
                </Form.Select>
              </MDBInputGroup>
              <MDBInputGroup className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter limitPrice as uint32 hexadecimal (e.g., 0x12...)"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  required
                />
              </MDBInputGroup>
              <MDBInputGroup className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter amount as uint32 hexadecimal (e.g., 0x12...)"
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

export default AddLimitOrderModal;