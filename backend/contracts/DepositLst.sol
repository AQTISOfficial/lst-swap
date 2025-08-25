// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

contract DepositLst is Pausable, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable QSD;
    IERC20 public immutable QRT;

    mapping(address => uint256) public allowedQSD;
    mapping(address => uint256) public allowedQRT;

    mapping(address => uint256) public depositedQSD;
    mapping(address => uint256) public depositedQRT;

    event Deposited(address indexed user, string token, uint256 amount, uint256 timestamp);
    event SnapshotSet(address indexed user, string token, uint256 allowedAmount, uint256 timestamp);

    error LengthMismatch();
    error InvalidAmount();
    error ExceedsAllowance();

    constructor(address _qsd, address _qrt) Ownable(msg.sender) 
    {
        QSD = IERC20(_qsd);
        QRT = IERC20(_qrt);
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

    function depositQSD(uint256 amount) external whenNotPaused {
       if (amount == 0) revert InvalidAmount();
       if (depositedQSD[msg.sender] + amount > allowedQSD[msg.sender]) revert ExceedsAllowance();


        QSD.safeTransferFrom(msg.sender, address(this), amount);

        depositedQSD[msg.sender] += amount;

        emit Deposited(msg.sender, "QSD", amount, block.timestamp);
    }

    function depositQRT(uint256 amount) external whenNotPaused {
        if (amount == 0) revert InvalidAmount();
        if (depositedQRT[msg.sender] + amount > allowedQRT[msg.sender]) revert ExceedsAllowance();

        QRT.safeTransferFrom(msg.sender, address(this), amount);

        depositedQRT[msg.sender] += amount;

        emit Deposited(msg.sender, "QRT", amount, block.timestamp);
    }

   function emergencyWithdrawLst() external onlyOwner {
        uint256 qsdBalance = QSD.balanceOf(address(this));
        uint256 qrtBalance = QRT.balanceOf(address(this));

        if (qsdBalance > 0) {
            QSD.safeTransfer(owner(), qsdBalance);
        }
        if (qrtBalance > 0) {
            QRT.safeTransfer(owner(), qrtBalance);
        }
}

    function getRemainingQSD(address user) external view returns (uint256) {
        return allowedQSD[user] - depositedQSD[user];
    }

    function getRemainingQRT(address user) external view returns (uint256) {
        return allowedQRT[user] - depositedQRT[user];
    }
}
