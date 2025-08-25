import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config();

const DEPOSIT_CONTRACT = process.env.DEPOSIT_CONTRACT!;

async function main() {
  const contract = await ethers.getContractAt("DepositLst", DEPOSIT_CONTRACT);

  type SnapshotFile = {
    addresses: string[];
    amounts: (string | number)[];
  }[];

  // JSON-bestanden inlezen
  const qsdData: SnapshotFile = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../imports/snapshotQsd.json"), "utf8")
  );
  const qrtData: SnapshotFile = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../imports/snapshotQrt.json"), "utf8")
  );

  // Direct naar BigInt mappen
  const qsdUsers = qsdData[0].addresses;
  const qsdAmounts = qsdData[0].amounts.map((a) => BigInt(a));

  const qrtUsers = qrtData[0].addresses;
  const qrtAmounts = qrtData[0].amounts.map((a) => BigInt(a));

  // batch size instellen om gas limit te vermijden
  const BATCH_SIZE = 50;

  async function batchCall(
    users: string[],
    amounts: bigint[],
    fnName: "setSnapshotQSD" | "setSnapshotQRT"
  ) {
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const sliceUsers = users.slice(i, i + BATCH_SIZE);
      const sliceAmounts = amounts.slice(i, i + BATCH_SIZE);

      console.log(
        `▶️ Calling ${fnName} with batch ${i / BATCH_SIZE + 1} (${sliceUsers.length} entries)`
      );

      const tx = await contract[fnName](sliceUsers, sliceAmounts);
      await tx.wait();

      console.log(`✅ Batch ${i / BATCH_SIZE + 1} confirmed`);
    }
  }

  // snapshots zetten
  await batchCall(qsdUsers, qsdAmounts, "setSnapshotQSD");
  await batchCall(qrtUsers, qrtAmounts, "setSnapshotQRT");

  console.log("🎉 Alle snapshots zijn gezet!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
// npx hardhat run scripts/setSnapshot.ts --network sepolia
