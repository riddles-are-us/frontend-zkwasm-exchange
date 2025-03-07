import BN from "bn.js";
import { queryStateI } from "../request";

export function removeHexPrefix(value: string): string {
  return value.startsWith("0x") ? value.slice(2) : value;
}

export function formatAddress(address: string) {
  // Remove the "0x" prefix if it exists
  let cleanAddress = removeHexPrefix(address);

  // Ensure the address is 40 characters long by padding with leading zeros
  while (cleanAddress.length < 40) {
    cleanAddress = "0" + cleanAddress;
  }

  // Ensure it's exactly 40 characters
  if (cleanAddress.length !== 40) {
    throw new Error("Invalid address, cannot pad to 40 characters.");
  }

  // Re-add the "0x" prefix
  return "0x" + cleanAddress;
}

// Validate if the index is in valid scope
export const validateIndex = (index: number, maxLength: number = 32) => {
  return index >= 0 && index < 2 ** maxLength;
};

export function validateHexString (value: string, maxLength: number = 64) {
  // Create a dynamic regular expression based on the maxLength parameter
  const regex = new RegExp(`^(0x)?[0-9a-fA-F]{1,${maxLength}}$`);

 // Check if the value is a valid hex string (optional 0x prefix)
 if (!regex.test(value)) {
   throw new Error(`Invalid input. Must be a valid hex string with up to ${maxLength} characters.`);
 }

 return null; // Return null if valid
};

export const formatErrorMessage = (error: any): string => {
  const fullMessage = error.message || "Unknown error";

  const message = fullMessage.replace(/\([^)]*\)/g, "");

  if (message) {
    return message;
  } else {
    return fullMessage.Error;
  }
};

function bytesToHex(bytes: Array<number>): string  {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function address2BigUint64Array(address: string): BigUint64Array {
  address = address.startsWith("0x") ? address.slice(2): address;
  let addressBN = new BN(address, 16);
  let a = addressBN.toArray("be", 20); // 20 bytes = 160 bits and split into 4, 8, 8

  console.log("address is", address);
  console.log("address be is", a);


  /*
(32 bit amount | 32 bit highbit of address)
(64 bit mid bit of address (be))
(64 bit tail bit of address (be))
   */


  let firstLimb = BigInt('0x' + bytesToHex(a.slice(0,4).reverse()));
  let sndLimb = BigInt('0x' + bytesToHex(a.slice(4,12).reverse()));
  let thirdLimb = BigInt('0x' + bytesToHex(a.slice(12, 20).reverse()));
  return new BigUint64Array([firstLimb<<32n, sndLimb, thirdLimb]);
}

export async function getNonce(processingKey: string): Promise<bigint> {
  let state:any = await queryStateI(processingKey);
  let nonce = 0n;
  if (state.player) {
    nonce = BigInt(state.player.nonce);
  }
  return nonce;
}