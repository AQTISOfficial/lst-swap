// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

contract SwapLst is Pausable, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable QSD;
    IERC20 public immutable QRT;
    IERC20 public immutable USDC;

    uint256 public constant QSD_RATE = 9e5; // 0.9 USDC per QSD
    uint256 public constant QRT_RATE = 7e6; // 7.0 USDC per QRT

    mapping(address => uint256) public allowedQSD;
    mapping(address => uint256) public allowedQRT;

    mapping(address => uint256) public swappedQSD;
    mapping(address => uint256) public swappedQRT;

    event Swapped(address indexed user, string token, uint256 amountIn, uint256 amountOut, uint256 timestamp);
    event SnapshotSet(address indexed user, string token, uint256 allowedAmount, uint256 timestamp);

    error LengthMismatch();
    error InvalidAmount();
    error ExceedsAllowance();

    constructor(address _qsd, address _qrt, address _usdc) Ownable(msg.sender) 
    {
        QSD = IERC20(_qsd);
        QRT = IERC20(_qrt);
        USDC = IERC20(_usdc);
    }

   function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function setSnapshotQSD(address[] calldata users, uint256[] calldata amounts) external onlyOwner {
        if(users.length != amounts.length) revert LengthMismatch();
        for (uint i = 0; i < users.length; i++) {
            allowedQSD[users[i]] = amounts[i];
            emit SnapshotSet(users[i], "QSD", amounts[i], block.timestamp);
        }
    }

    function setSnapshotQRT(address[] calldata users, uint256[] calldata amounts) external onlyOwner {
        if(users.length != amounts.length) revert LengthMismatch();
        for (uint i = 0; i < users.length; i++) {
            allowedQRT[users[i]] = amounts[i];
            emit SnapshotSet(users[i], "QRT", amounts[i], block.timestamp);
        }
    }

    function swapQSD(uint256 amount) external whenNotPaused {
       if (amount == 0) revert InvalidAmount();
       if (swappedQSD[msg.sender] + amount > allowedQSD[msg.sender]) revert ExceedsAllowance();

        uint256 usdcAmount = (amount * QSD_RATE) / 1e6;

        QSD.safeTransferFrom(msg.sender, address(this), amount);
        USDC.safeTransfer(msg.sender, usdcAmount);

        swappedQSD[msg.sender] += amount;

        emit Swapped(msg.sender, "QSD", amount, usdcAmount, block.timestamp);
    }

    function swapQRT(uint256 amount) external whenNotPaused {
        if (amount == 0) revert InvalidAmount();
        if (swappedQRT[msg.sender] + amount > allowedQRT[msg.sender]) revert ExceedsAllowance();

        uint256 usdcAmount = (amount * QRT_RATE) / 1e6;

        QRT.safeTransferFrom(msg.sender, address(this), amount);
        USDC.safeTransfer(msg.sender, usdcAmount);

        swappedQRT[msg.sender] += amount;

        emit Swapped(msg.sender, "QRT", amount, usdcAmount, block.timestamp);
    }

    function emergencyWithdrawUSDC(uint256 amount) external onlyOwner  {
        USDC.safeTransfer(owner(), amount);
    }

    function getRemainingQSD(address user) external view returns (uint256) {
        return allowedQSD[user] - swappedQSD[user];
    }

    function getRemainingQRT(address user) external view returns (uint256) {
        return allowedQRT[user] - swappedQRT[user];
    }
}
