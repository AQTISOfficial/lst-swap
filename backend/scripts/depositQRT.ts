import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const DEPOSIT_CONTRACT = process.env.DEPOSIT_CONTRACT!;
const QRT_ADDRESS = process.env.QRT_ADDRESS!;
const AMOUNT_TO_DEPOSIT = "192235081"; // 1 QRT in 6 decimals

async function main() {
  const [signer] = await ethers.getSigners();
  const user = signer.address;
  const amount = BigInt(AMOUNT_TO_DEPOSIT);

  console.log(`🔍 Checking QRT allowance for ${user}...`);

  const erc20Abi = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  const depositAbi = ["function depositQRT(uint256 amount) external"];

  const token = new ethers.Contract(QRT_ADDRESS, erc20Abi, signer);
  const contract = new ethers.Contract(DEPOSIT_CONTRACT, depositAbi, signer);

  const allowance: bigint = await token.allowance(user, DEPOSIT_CONTRACT);

  if (allowance < amount) {
    console.log(`❌ Insufficient QRT allowance: allowed = ${allowance}, needed = ${amount}`);
    console.log(`👉 Please approve more QRT before depositing.`);
    return;
  }

  const tx = await contract.swapQRT(amount);
  console.log("⏳ Swapping QRT...");
  await tx.wait();

  console.log(`✅ Deposited ${AMOUNT_TO_DEPOSIT} QRT`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
//npx hardhat run scripts/depositQRT.ts --network sepolia