import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const DEPOSIT_CONTRACT = process.env.DEPOSIT_CONTRACT!;
const QSD_ADDRESS = process.env.QSD_ADDRESS!;
const AMOUNT_TO_DEPOSIT = "2105451768"; // 1 QSD in 6 decimals

async function main() {
  const [signer] = await ethers.getSigners();
  const user = signer.address;
  const amount = BigInt(AMOUNT_TO_DEPOSIT);

  console.log(`Checking QSD allowance for ${user}...`);

  const erc20Abi = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  const depositAbi = ["function depositQSD(uint256 amount) external"];

  const token = new ethers.Contract(QSD_ADDRESS, erc20Abi, signer);
  const contract = new ethers.Contract(DEPOSIT_CONTRACT, depositAbi, signer);

  const allowance: bigint = await token.allowance(user, DEPOSIT_CONTRACT);

  if (allowance < amount) {
    console.log(`Insufficient QSD allowance: allowed = ${allowance}, needed = ${amount}`);
    console.log(`Please approve more QSD before depositing.`);
    return;
  }

  const tx = await contract.depositQSD(amount);
  console.log("⏳ Depositing QSD...");
  await tx.wait();

  console.log(`Deposited ${AMOUNT_TO_DEPOSIT} QSD`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
// npx hardhat run scripts/depositQSD.ts --network sepolia