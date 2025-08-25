/**
 * @file snapshot-test.ts
 * @description Test suite for importing snapshots.
 * npx hardhat compile
 * npx hardhat test test/snapshot-test.ts
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { qsdSnapshot } from "../imports/qsdSnapshot";
import { qrtSnapshot } from "../imports/qrtSnapshot";
import { DepositLst } from "../typechain-types";

describe("Snapshot import test", function () {
  let owner: any;
  let depositLst: DepositLst;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();

    const DepositLst = await ethers.getContractFactory("DepositLst");
    const dummyERC20 = await ethers.getContractFactory("ERC20Mock");

    const qsd = await dummyERC20.deploy("QSD Token", "QSD", 6);
    const qrt = await dummyERC20.deploy("QRT Token", "QRT", 6);

    depositLst = await DepositLst.deploy(await qsd.getAddress(), await qrt.getAddress());
  });

  it("should import and set QSD snapshot correctly", async () => {
    await expect(
      depositLst.setSnapshotQSD(qsdSnapshot.addresses, qsdSnapshot.amounts)
    ).to.not.be.reverted;

    for (let i = 0; i < qsdSnapshot.addresses.length; i++) {
      const remaining = await depositLst.getRemainingQSD(qsdSnapshot.addresses[i]);
      expect(remaining).to.equal(qsdSnapshot.amounts[i]);
    }
  });

  it("should import and set QRT snapshot correctly", async () => {
    await expect(
      depositLst.setSnapshotQRT(qrtSnapshot.addresses, qrtSnapshot.amounts)
    ).to.not.be.reverted;

    for (let i = 0; i < qrtSnapshot.addresses.length; i++) {
      const remaining = await depositLst.getRemainingQRT(qrtSnapshot.addresses[i]);
      expect(remaining).to.equal(qrtSnapshot.amounts[i]);
    }
  });
});
