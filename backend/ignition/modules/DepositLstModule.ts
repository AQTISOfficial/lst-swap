// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import * as dotenv from "dotenv";
dotenv.config();

const DepositLstModule = buildModule("DepositLstModule", (m) => {
  const qsd = m.getParameter("qsdToken", process.env.QSD_ADDRESS);
  const qrt = m.getParameter("qrtToken", process.env.QRT_ADDRESS);

  const deposit = m.contract("DepositLst", [qsd, qrt]);

  return { deposit };
});

export default DepositLstModule;
