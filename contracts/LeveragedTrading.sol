// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPredictionTerminal {
    function getBuyingPower(address user) external view returns (uint256);
    function getDebt(address user) external view returns (uint256);
    function addDebt(address user, uint256 amount) external;
    function reduceDebt(address user, uint256 amount) external;
}

interface IMockUSDC {
    function mint(address to, uint256 amount) external;
}

/**
 * @title LeveragedTrading
 * @notice Use prediction market collateral (75% buying power) to open/close long positions in SOL, ETH, etc. Prices passed from frontend (Pyth).
 */
contract LeveragedTrading {
    uint256 public constant PRECISION = 1e18;

    IPredictionTerminal public predictionTerminal;
    IMockUSDC public mockUsdc;

    struct Position {
        uint256 usdAmount;   // in 1e18
        uint256 entryPrice;  // in 1e18
    }
    mapping(address => mapping(bytes32 => Position)) public positions;

    event PositionOpened(address indexed user, bytes32 indexed symbol, uint256 usdAmount, uint256 entryPrice);
    event PositionClosed(address indexed user, bytes32 indexed symbol, uint256 usdAmount, uint256 pnl);

    error NoPosition();
    error ExceedsBuyingPower();

    constructor(address _predictionTerminal, address _mockUsdc) {
        predictionTerminal = IPredictionTerminal(_predictionTerminal);
        mockUsdc = IMockUSDC(_mockUsdc);
    }

    function symbolToId(string calldata symbol) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(symbol));
    }

    function openLong(string calldata symbol, uint256 usdAmount18, uint256 entryPrice18) external {
        uint256 bp = predictionTerminal.getBuyingPower(msg.sender);
        uint256 debt = predictionTerminal.getDebt(msg.sender);
        if (debt + usdAmount18 > bp) revert ExceedsBuyingPower();

        bytes32 id = keccak256(abi.encodePacked(symbol));
        Position storage pos = positions[msg.sender][id];
        if (pos.usdAmount > 0) {
            // aggregate: new avg entry
            uint256 totalUsd = pos.usdAmount + usdAmount18;
            pos.entryPrice = (pos.entryPrice * pos.usdAmount + entryPrice18 * usdAmount18) / totalUsd;
            pos.usdAmount = totalUsd;
        } else {
            pos.usdAmount = usdAmount18;
            pos.entryPrice = entryPrice18;
        }

        predictionTerminal.addDebt(msg.sender, usdAmount18);
        emit PositionOpened(msg.sender, id, usdAmount18, entryPrice18);
    }

    function closeLong(string calldata symbol, uint256 exitPrice18) external {
        bytes32 id = keccak256(abi.encodePacked(symbol));
        Position storage pos = positions[msg.sender][id];
        if (pos.usdAmount == 0) revert NoPosition();

        uint256 usdAmount = pos.usdAmount;
        uint256 entryPrice = pos.entryPrice;
        // Position value at exit (1e18)
        uint256 valueExit = usdAmount * exitPrice18 / entryPrice;
        uint256 toRepay = valueExit >= usdAmount ? usdAmount : valueExit;

        predictionTerminal.reduceDebt(msg.sender, toRepay);
        if (valueExit > usdAmount) {
            uint256 profit18 = valueExit - usdAmount;
            uint256 profitUsdc6 = profit18 / 1e12;
            if (profitUsdc6 > 0) mockUsdc.mint(msg.sender, profitUsdc6);
        }

        uint256 pnl18 = valueExit >= usdAmount ? valueExit - usdAmount : usdAmount - valueExit;
        pos.usdAmount = 0;
        pos.entryPrice = 0;
        emit PositionClosed(msg.sender, id, usdAmount, pnl18);
    }

    function getPosition(address user, string calldata symbol) external view returns (uint256 usdAmount, uint256 entryPrice) {
        bytes32 id = keccak256(abi.encodePacked(symbol));
        Position storage pos = positions[user][id];
        return (pos.usdAmount, pos.entryPrice);
    }
}
