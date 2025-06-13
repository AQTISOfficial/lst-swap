// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import * as dotenv from "dotenv";
dotenv.config();

const SwapLstModule = buildModule("SwapLstModule", (m) => {
  const qsd = m.getParameter("qsdToken", process.env.QSD_ADDRESS); 
  const qrt = m.getParameter("qrtToken", process.env.QRT_ADDRESS);
  const usdc = m.getParameter("usdcToken", process.env.USDC_ADDRESS);
  
  const swap = m.contract("SwapLst", [qsd, qrt, usdc]);

  return { swap };
});

export default SwapLstModule;
