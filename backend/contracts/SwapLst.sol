// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SwapLst {
    IERC20 public immutable QSD;
    IERC20 public immutable QRT;
    IERC20 public immutable USDC;

    uint256 public constant QSD_RATE = 9e5; // 0.9 USDC per QSD
    uint256 public constant QRT_RATE = 7e6; // 7.0 USDC per QRT

    address public immutable owner;

    mapping(address => uint256) public allowedQSD;
    mapping(address => uint256) public allowedQRT;

    mapping(address => uint256) public swappedQSD;
    mapping(address => uint256) public swappedQRT;

    event Swapped(address indexed user, string token, uint256 amountIn, uint256 amountOut);
    event SnapshotSet(address indexed user, string token, uint256 allowedAmount);

    constructor(address _qsd, address _qrt, address _usdc) {
        QSD = IERC20(_qsd);
        QRT = IERC20(_qrt);
        USDC = IERC20(_usdc);
        owner = msg.sender;
    }

    // Restrict access to the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // Set the allowed amounts for QSD and QRT
    function setSnapshotQSD(address[] calldata users, uint256[] calldata amounts) external onlyOwner {
        require(users.length == amounts.length, "Length mismatch");
        for (uint i = 0; i < users.length; i++) {
            allowedQSD[users[i]] = amounts[i];
            emit SnapshotSet(users[i], "QSD", amounts[i]);
        }
    }

    function setSnapshotQRT(address[] calldata users, uint256[] calldata amounts) external onlyOwner {
        require(users.length == amounts.length, "Length mismatch");
        for (uint i = 0; i < users.length; i++) {
            allowedQRT[users[i]] = amounts[i];
            emit SnapshotSet(users[i], "QRT", amounts[i]);
        }
    }

    // Allow users to swap QSD and QRT for USDC
    function swapQSD(uint256 amount) external {
        require(amount > 0, "Invalid amount");
        require(swappedQSD[msg.sender] + amount <= allowedQSD[msg.sender], "Exceeds limit");

        swappedQSD[msg.sender] += amount;
        uint256 usdcAmount = amount * QSD_RATE / 1e6;

        require(QSD.transferFrom(msg.sender, owner, amount), "QSD transfer failed");
        require(USDC.transfer(msg.sender, usdcAmount), "USDC payout failed");

        emit Swapped(msg.sender, "QSD", amount, usdcAmount);
    }

    function swapQRT(uint256 amount) external {
        require(amount > 0, "Invalid amount");
        require(swappedQRT[msg.sender] + amount <= allowedQRT[msg.sender], "Exceeds limit");

        swappedQRT[msg.sender] += amount;
        uint256 usdcAmount = amount * QRT_RATE / 1e6;

        require(QRT.transferFrom(msg.sender, owner, amount), "QRT transfer failed");
        require(USDC.transfer(msg.sender, usdcAmount), "USDC payout failed");

        emit Swapped(msg.sender, "QRT", amount, usdcAmount);
    }

    // Allow the owner to withdraw USDC from the contract
    function emergencyWithdrawUSDC(uint256 amount) external onlyOwner {
        require(USDC.transfer(owner, amount), "Withdraw failed");
    }
    
    // Retrieve the remaining allowed amounts for QSD and QRT
    function remainingQSD(address user) external view returns (uint256) {
        return allowedQSD[user] - swappedQSD[user];
    }

    function remainingQRT(address user) external view returns (uint256) {
        return allowedQRT[user] - swappedQRT[user];
    }
}
