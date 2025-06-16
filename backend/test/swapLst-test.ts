/**
 * @file swapLst-test.ts
 * @description Test suite for SwapLst contract using local ERC20 mocks.
 * npx hardhat compile
 * npx hardhat test test/swapLst-test.ts
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { ERC20Mock, SwapLst } from "../typechain-types";

describe("SwapLst", function () {
  let owner: any;
  let user: any;
  let swapLst: SwapLst;
  let QSD: ERC20Mock;
  let QRT: ERC20Mock;
  let USDC: ERC20Mock;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    QSD = await ERC20Mock.connect(owner).deploy("QSD Token", "QSD", 6);
    QRT = await ERC20Mock.connect(owner).deploy("QRT Token", "QRT", 6);
    USDC = await ERC20Mock.connect(owner).deploy("USD Coin", "USDC", 6);

    const SwapLst = await ethers.getContractFactory("SwapLst");
    swapLst = await SwapLst.connect(owner).deploy(
      QSD.getAddress(),
      QRT.getAddress(),
      USDC.getAddress()
    );

    // Mint & approve
    await QSD.mint(user.address, ethers.parseUnits("1000", 6));
    await QRT.mint(user.address, ethers.parseUnits("1000", 6));
    await USDC.mint(await swapLst.getAddress(), ethers.parseUnits("10000", 6));

    await QSD.connect(user).approve(await swapLst.getAddress(), ethers.MaxUint256);
    await QRT.connect(user).approve(await swapLst.getAddress(), ethers.MaxUint256);
  });

  // QSD swap tests
  it("should set snapshot for QSD", async () => {
    await swapLst.connect(owner).setSnapshotQSD([user.address], [ethers.parseUnits("500", 6)]);
    const remaining = await swapLst.getRemainingQSD(user.address);
    expect(remaining).to.equal(ethers.parseUnits("500", 6));
  });

  it("should revert on QSD swap amount is zero", async () => {
    await swapLst.connect(owner).setSnapshotQSD([user.address], [ethers.parseUnits("500", 6)]);
    await expect(swapLst.connect(user).swapQSD(0))
      .to.be.revertedWithCustomError(swapLst, "InvalidAmount");
  });

  it("should allow QSD swap within amount snapshot", async () => {
    await swapLst.connect(owner).setSnapshotQSD([user.address], [ethers.parseUnits("500", 6)]);
    await swapLst.connect(user).swapQSD(ethers.parseUnits("100", 6));
    const remaining = await swapLst.getRemainingQSD(user.address);
    expect(remaining).to.equal(ethers.parseUnits("400", 6));
  });

  it("should revert on QSD swap above allowed amount snapshot", async () => {
    await swapLst.connect(owner).setSnapshotQSD([user.address], [ethers.parseUnits("100", 6)]);
    await expect(swapLst.connect(user).swapQSD(ethers.parseUnits("200", 6)))
      .to.be.revertedWithCustomError(swapLst, "ExceedsAllowance");
  });

   it("should compare gas usage of swapQSD", async function () {
    await swapLst.connect(owner).setSnapshotQSD([user.address], [ethers.parseUnits("500", 6)]);
    const tx = await swapLst.connect(user).swapQSD(ethers.parseUnits("500", 6));
    const receipt = await tx.wait();
    if (receipt) {
      console.log("Gas used:", receipt.gasUsed.toString());
    } else {
      console.log("Transaction receipt is null");
    }
  });

  // QRT swap tests
  it("should set snapshot for QRT", async () => {
    await swapLst.connect(owner).setSnapshotQRT([user.address], [ethers.parseUnits("500", 6)]);
    const remaining = await swapLst.getRemainingQRT(user.address);
    expect(remaining).to.equal(ethers.parseUnits("500", 6));
  });

  it("should revert on QRT swap amount is zero", async () => {
    await swapLst.connect(owner).setSnapshotQRT([user.address], [ethers.parseUnits("500", 6)]);
    await expect(swapLst.connect(user).swapQRT(0))
      .to.be.revertedWithCustomError(swapLst, "InvalidAmount");
  });

  it("should allow QRT swap within amount snapshot", async () => {
    await swapLst.connect(owner).setSnapshotQRT([user.address], [ethers.parseUnits("500", 6)]);
    await swapLst.connect(user).swapQRT(ethers.parseUnits("200", 6));
    const remaining = await swapLst.getRemainingQRT(user.address);
    expect(remaining).to.equal(ethers.parseUnits("300", 6));
  });

  it("should revert on QRT swap above allowed amount snapshot", async () => {
    await swapLst.connect(owner).setSnapshotQRT([user.address], [ethers.parseUnits("100", 6)]);
    await expect(swapLst.connect(user).swapQRT(ethers.parseUnits("200", 6)))
      .to.be.revertedWithCustomError(swapLst, "ExceedsAllowance");
  });

  // Snapshot management tests
  it("should revert on mismatched snapshot input lengths", async () => {
    await expect(
      swapLst.connect(owner).setSnapshotQSD([user.address], [])
    ).to.be.revertedWithCustomError(swapLst, "LengthMismatch");
  });

  // Pause functionality tests
  it("should pause and prevent swaps", async () => {
    await swapLst.connect(owner).pause();
    await expect(
      swapLst.connect(user).swapQSD(ethers.parseUnits("10", 6))
    ).to.be.revertedWithCustomError(swapLst, "EnforcedPause")
  });
});
