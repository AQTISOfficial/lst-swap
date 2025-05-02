import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const SWAP_CONTRACT = process.env.SWAP_CONTRACT!;
const QRT_ADDRESS = process.env.QRT_ADDRESS!;
const AMOUNT_TO_SWAP = "192235081"; // 1 QRT in 6 decimals

async function main() {
  const [signer] = await ethers.getSigners();
  const user = signer.address;
  const amount = BigInt(AMOUNT_TO_SWAP);

  console.log(`🔍 Checking QRT allowance for ${user}...`);

  const erc20Abi = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  const swapAbi = ["function swapQRT(uint256 amount) external"];

  const token = new ethers.Contract(QRT_ADDRESS, erc20Abi, signer);
  const contract = new ethers.Contract(SWAP_CONTRACT, swapAbi, signer);

  const allowance: bigint = await token.allowance(user, SWAP_CONTRACT);

  if (allowance < amount) {
    console.log(`❌ Insufficient QRT allowance: allowed = ${allowance}, needed = ${amount}`);
    console.log(`👉 Please approve more QRT before swapping.`);
    return;
  }

  const tx = await contract.swapQRT(amount);
  console.log("⏳ Swapping QRT...");
  await tx.wait();

  console.log(`✅ Swapped ${AMOUNT_TO_SWAP} QRT for USDC`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
//npx hardhat run scripts/swapQRT.ts --network sepolia