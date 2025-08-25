/**
 * @file depositLst-test.ts
 * @description Test suite for DepositLst contract using local ERC20 mocks.
 * npx hardhat compile
 * npx hardhat test test/depositLst-test.ts
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { ERC20Mock, DepositLst } from "../typechain-types";

describe("DepositLst", function () {
  let owner: any;
  let user: any;
  let depositLst: DepositLst;
  let QSD: ERC20Mock;
  let QRT: ERC20Mock;
  let USDC: ERC20Mock;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    QSD = await ERC20Mock.connect(owner).deploy("QSD Token", "QSD", 6);
    QRT = await ERC20Mock.connect(owner).deploy("QRT Token", "QRT", 6);

    const DepositLst = await ethers.getContractFactory("DepositLst");
    depositLst = await DepositLst.connect(owner).deploy(
      QSD.getAddress(),
      QRT.getAddress()
    );

    // Mint & approve
    await QSD.mint(user.address, ethers.parseUnits("1000", 6));
    await QRT.mint(user.address, ethers.parseUnits("1000", 6));

    await QSD.connect(user).approve(await depositLst.getAddress(), ethers.MaxUint256);
    await QRT.connect(user).approve(await depositLst.getAddress(), ethers.MaxUint256);
  });

  // QSD deposit tests
  it("should set snapshot for QSD", async () => {
    await depositLst.connect(owner).setSnapshotQSD([user.address], [ethers.parseUnits("500", 6)]);
    const remaining = await depositLst.getRemainingQSD(user.address);
    expect(remaining).to.equal(ethers.parseUnits("500", 6));
  });

  it("should revert on QSD deposit amount is zero", async () => {
    await depositLst.connect(owner).setSnapshotQSD([user.address], [ethers.parseUnits("500", 6)]);
    await expect(depositLst.connect(user).depositQSD(0))
      .to.be.revertedWithCustomError(depositLst, "InvalidAmount");
  });

  it("should allow QSD deposit within amount snapshot", async () => {
    await depositLst.connect(owner).setSnapshotQSD([user.address], [ethers.parseUnits("500", 6)]);
    await depositLst.connect(user).depositQSD(ethers.parseUnits("100", 6));
    const remaining = await depositLst.getRemainingQSD(user.address);
    expect(remaining).to.equal(ethers.parseUnits("400", 6));
  });

  it("should revert on QSD deposit above allowed amount snapshot", async () => {
    await depositLst.connect(owner).setSnapshotQSD([user.address], [ethers.parseUnits("100", 6)]);
    await expect(depositLst.connect(user).depositQSD(ethers.parseUnits("200", 6)))
      .to.be.revertedWithCustomError(depositLst, "ExceedsAllowance");
  });

   it("should compare gas usage of depositQSD", async function () {
    await depositLst.connect(owner).setSnapshotQSD([user.address], [ethers.parseUnits("500", 6)]);
    const tx = await depositLst.connect(user).depositQSD(ethers.parseUnits("500", 6));
    const receipt = await tx.wait();
    if (receipt) {
      console.log("Gas used:", receipt.gasUsed.toString());
    } else {
      console.log("Transaction receipt is null");
    }
  });

  // QRT deposit tests
  it("should set snapshot for QRT", async () => {
    await depositLst.connect(owner).setSnapshotQRT([user.address], [ethers.parseUnits("500", 6)]);
    const remaining = await depositLst.getRemainingQRT(user.address);
    expect(remaining).to.equal(ethers.parseUnits("500", 6));
  });

  it("should revert on QRT deposit amount is zero", async () => {
    await depositLst.connect(owner).setSnapshotQRT([user.address], [ethers.parseUnits("500", 6)]);
    await expect(depositLst.connect(user).depositQRT(0))
      .to.be.revertedWithCustomError(depositLst, "InvalidAmount");
  });

  it("should allow QRT deposit within amount snapshot", async () => {
    await depositLst.connect(owner).setSnapshotQRT([user.address], [ethers.parseUnits("500", 6)]);
    await depositLst.connect(user).depositQRT(ethers.parseUnits("200", 6));
    const remaining = await depositLst.getRemainingQRT(user.address);
    expect(remaining).to.equal(ethers.parseUnits("300", 6));
  });

  it("should revert on QRT deposit above allowed amount snapshot", async () => {
    await depositLst.connect(owner).setSnapshotQRT([user.address], [ethers.parseUnits("100", 6)]);
    await expect(depositLst.connect(user).depositQRT(ethers.parseUnits("200", 6)))
      .to.be.revertedWithCustomError(depositLst, "ExceedsAllowance");
  });

  // Snapshot management tests
  it("should revert on mismatched snapshot input lengths", async () => {
    await expect(
      depositLst.connect(owner).setSnapshotQSD([user.address], [])
    ).to.be.revertedWithCustomError(depositLst, "LengthMismatch");
  });

  // Pause functionality tests
  it("should pause and prevent deposits", async () => {
    await depositLst.connect(owner).pause();
    await expect(
      depositLst.connect(user).depositQSD(ethers.parseUnits("10", 6))
    ).to.be.revertedWithCustomError(depositLst, "EnforcedPause")
  });
});
