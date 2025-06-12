import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const SWAP_CONTRACT = process.env.SWAP_CONTRACT!;
const QSD_ADDRESS = process.env.QSD_ADDRESS!;
const AMOUNT_TO_SWAP = "3165451768"; // 1 QSD in 6 decimals

async function main() {
  const [signer] = await ethers.getSigners();
  const user = signer.address;
  const amount = BigInt(AMOUNT_TO_SWAP);

  console.log(`Checking QSD allowance for ${user}...`);

  const erc20Abi = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  const swapAbi = ["function swapQSD(uint256 amount) external"];

  const token = new ethers.Contract(QSD_ADDRESS, erc20Abi, signer);
  const contract = new ethers.Contract(SWAP_CONTRACT, swapAbi, signer);

  const allowance: bigint = await token.allowance(user, SWAP_CONTRACT);

  if (allowance < amount) {
    console.log(`Insufficient QSD allowance: allowed = ${allowance}, needed = ${amount}`);
    console.log(`Please approve more QSD before swapping.`);
    return;
  }

  const tx = await contract.swapQSD(amount);
  console.log("⏳ Swapping QSD...");
  await tx.wait();

  console.log(`Swapped ${AMOUNT_TO_SWAP} QSD for USDC`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
// npx hardhat run scripts/swapQSD.ts --network sepolia