import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

// === CONFIG ===
const TOKEN_ADDRESS = process.env.QRT_ADDRESS!;             // QRT token address
const SWAP_CONTRACT_ADDRESS = process.env.SWAP_CONTRACT!;   // SwapLst contract address
const AMOUNT_TO_APPROVE = "192235081";                      // 1 token with 6 decimals

async function main() {
  const [signer] = await ethers.getSigners();
  console.log(`Using signer: ${signer.address}`);

  const erc20Abi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function decimals() view returns (uint8)"
  ];

  const token = new ethers.Contract(TOKEN_ADDRESS, erc20Abi, signer);

  const amount = ethers.parseUnits(AMOUNT_TO_APPROVE, 6);

  const tx = await token.approve(SWAP_CONTRACT_ADDRESS, amount);
  console.log(`Approving ${AMOUNT_TO_APPROVE} tokens...`);
  await tx.wait();

  console.log(`✅ Approved ${AMOUNT_TO_APPROVE} tokens for ${SWAP_CONTRACT_ADDRESS}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

//npx hardhat run scripts/approveQRT.ts --network sepolia