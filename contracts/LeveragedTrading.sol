// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPredictionTerminal {
    function getBuyingPower(address user) external view returns (uint256);
    function getDebt(address user) external view returns (uint256);
    function getCurrentShareValue(address user) external view returns (uint256);
    function getHealthFactor(address user) external view returns (uint256);
    function checkLiquidation(address user) external view returns (bool);
    function checkCriticalLiquidation(address user) external view returns (bool);
    function addDebt(address user, uint256 amount) external;
    function reduceDebt(address user, uint256 amount) external;
    function forceReduceDebt(address user, uint256 amount) external;
    function seizeCollateral(address user, uint256 amount) external returns (uint256);
}

interface IMockUSDC {
    function mint(address to, uint256 amount) external;
    function transfer(address to, uint256 amount) external returns (bool);
}

/**
 * @title LeveragedTrading
 * @notice Use prediction market collateral (75% buying power) to open/close 
 * long positions in SOL, ETH, etc. Includes robust liquidation system.
 */
contract LeveragedTrading {
    uint256 public constant PRECISION = 1e18;
    uint256 public constant LIQUIDATOR_REWARD_BPS = 300;  // 3% reward
    uint256 public constant PROTOCOL_FEE_BPS = 200;        // 2% fee
    uint256 public constant MAX_LIQUIDATION_PENALTY_BPS = 500; // 5% total

    IPredictionTerminal public predictionTerminal;
    IMockUSDC public mockUsdc;
    address public owner;
    address public protocolFeeRecipient;

    struct Position {
        uint256 usdAmount;   // Position size in 1e18
        uint256 entryPrice;  // Entry price in 1e18
        uint256 timestamp;   // When position was opened
    }
    
    mapping(address => mapping(bytes32 => Position)) public positions;
    mapping(address => bytes32[]) public userPositions; // Track all positions per user

    event PositionOpened(address indexed user, bytes32 indexed symbol, uint256 usdAmount, uint256 entryPrice, uint256 timestamp);
    event PositionClosed(address indexed user, bytes32 indexed symbol, uint256 exitPrice, int256 pnl, bool isProfit);
    event PositionLiquidated(address indexed user, bytes32 indexed symbol, address indexed liquidator, uint256 debtRecovered, uint256 liquidatorReward);
    event ProtocolFeeCollected(uint256 amount);

    error NoPosition();
    error ExceedsBuyingPower();
    error NotLiquidatable();
    error PositionAlreadyExists();
    error PriceCannotBeZero();
    error InvalidAmount();

    constructor(address _predictionTerminal, address _mockUsdc) {
        predictionTerminal = IPredictionTerminal(_predictionTerminal);
        mockUsdc = IMockUSDC(_mockUsdc);
        owner = msg.sender;
        protocolFeeRecipient = msg.sender;
    }

    function setProtocolFeeRecipient(address _recipient) external {
        require(msg.sender == owner, "Not owner");
        protocolFeeRecipient = _recipient;
    }

    function symbolToId(string calldata symbol) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(symbol));
    }

    /**
     * @notice Open a long position using prediction market collateral
     * @param symbol Trading pair symbol (e.g., "SOL", "ETH")
     * @param usdAmount18 Position size in USD (18 decimals)
     * @param entryPrice18 Entry price from oracle (18 decimals)
     */
    function openLong(string calldata symbol, uint256 usdAmount18, uint256 entryPrice18) external {
        if (usdAmount18 == 0) revert InvalidAmount();
        if (entryPrice18 == 0) revert PriceCannotBeZero();
        
        uint256 bp = predictionTerminal.getBuyingPower(msg.sender);
        uint256 debt = predictionTerminal.getDebt(msg.sender);
        
        if (debt + usdAmount18 > bp) revert ExceedsBuyingPower();

        bytes32 id = keccak256(abi.encodePacked(symbol));
        Position storage pos = positions[msg.sender][id];
        
        if (pos.usdAmount > 0) {
            // Increase existing position - calculate new average entry price
            uint256 totalUsd = pos.usdAmount + usdAmount18;
            pos.entryPrice = (pos.entryPrice * pos.usdAmount + entryPrice18 * usdAmount18) / totalUsd;
            pos.usdAmount = totalUsd;
            pos.timestamp = block.timestamp;
        } else {
            // New position
            pos.usdAmount = usdAmount18;
            pos.entryPrice = entryPrice18;
            pos.timestamp = block.timestamp;
            userPositions[msg.sender].push(id);
        }

        predictionTerminal.addDebt(msg.sender, usdAmount18);
        emit PositionOpened(msg.sender, id, usdAmount18, entryPrice18, block.timestamp);
    }

    /**
     * @notice Close a long position
     * @param symbol Trading pair symbol
     * @param exitPrice18 Current market price from oracle (18 decimals)
     */
    function closeLong(string calldata symbol, uint256 exitPrice18) external {
        if (exitPrice18 == 0) revert PriceCannotBeZero();
        
        bytes32 id = keccak256(abi.encodePacked(symbol));
        Position storage pos = positions[msg.sender][id];
        if (pos.usdAmount == 0) revert NoPosition();

        _closePosition(msg.sender, id, exitPrice18, false);
    }

    /**
     * @notice Internal function to close a position
     * @param user User address
     * @param positionId Position identifier
     * @param exitPrice18 Exit price
     * @param isLiquidation Whether this is a liquidation
     */
    function _closePosition(
        address user, 
        bytes32 positionId, 
        uint256 exitPrice18,
        bool isLiquidation
    ) internal returns (int256 pnl) {
        Position storage pos = positions[user][positionId];
        
        uint256 usdAmount = pos.usdAmount;
        uint256 entryPrice = pos.entryPrice;
        
        // Calculate position value at exit
        // valueExit = usdAmount * (exitPrice / entryPrice)
        uint256 valueExit = (usdAmount * exitPrice18) / entryPrice;
        
        bool isProfit = valueExit >= usdAmount;
        uint256 pnlAbs;
        
        if (isProfit) {
            pnlAbs = valueExit - usdAmount;
            pnl = int256(pnlAbs);
        } else {
            pnlAbs = usdAmount - valueExit;
            pnl = -int256(pnlAbs);
        }
        
        if (!isLiquidation) {
            // Normal close: repay debt fully
            predictionTerminal.reduceDebt(user, usdAmount);
            
            // Pay profit to user if any
            if (isProfit && pnlAbs > 0) {
                uint256 profitUsdc6 = pnlAbs / 1e12;
                if (profitUsdc6 > 0) {
                    mockUsdc.mint(user, profitUsdc6);
                }
            }
        }
        
        // Clear position
        pos.usdAmount = 0;
        pos.entryPrice = 0;
        pos.timestamp = 0;
        
        // Remove from user positions array
        _removeUserPosition(user, positionId);
        
        emit PositionClosed(user, positionId, exitPrice18, pnl, isProfit);
    }

    /**
     * @notice Liquidate an undercollateralized position
     * @param user User to liquidate
     * @param symbol Trading pair symbol
     * @param currentPrice18 Current market price from oracle
     */
    function liquidatePosition(
        address user,
        string calldata symbol,
        uint256 currentPrice18
    ) external {
        if (currentPrice18 == 0) revert PriceCannotBeZero();
        
        // Check if user is liquidatable
        if (!predictionTerminal.checkLiquidation(user)) revert NotLiquidatable();
        
        bytes32 id = keccak256(abi.encodePacked(symbol));
        Position storage pos = positions[user][id];
        if (pos.usdAmount == 0) revert NoPosition();
        
        uint256 entryPrice = pos.entryPrice;
        uint256 usdAmount = pos.usdAmount;
        
        // Calculate current position value
        uint256 valueNow = (usdAmount * currentPrice18) / entryPrice;
        
        // Calculate liquidation penalty (5% of original position size)
        uint256 liquidatorReward = (usdAmount * LIQUIDATOR_REWARD_BPS) / 10000;
        uint256 protocolFee = (usdAmount * PROTOCOL_FEE_BPS) / 10000;
        uint256 totalPenalty = liquidatorReward + protocolFee;
        
        // Amount available to repay debt (position value minus penalties)
        uint256 availableForDebt = valueNow > totalPenalty ? valueNow - totalPenalty : 0;
        uint256 toRepay = availableForDebt > usdAmount ? usdAmount : availableForDebt;
        
        // Reduce user's debt
        if (toRepay > 0) {
            predictionTerminal.forceReduceDebt(user, toRepay);
        }
        
        // If position value couldn't cover debt, seize collateral
        if (toRepay < usdAmount) {
            uint256 shortfall = usdAmount - toRepay;
            predictionTerminal.seizeCollateral(user, shortfall);
        }
        
        // Pay liquidator reward
        if (liquidatorReward > 0) {
            uint256 rewardUsdc6 = liquidatorReward / 1e12;
            if (rewardUsdc6 > 0) {
                mockUsdc.mint(msg.sender, rewardUsdc6);
            }
        }
        
        // Pay protocol fee
        if (protocolFee > 0) {
            uint256 feeUsdc6 = protocolFee / 1e12;
            if (feeUsdc6 > 0) {
                mockUsdc.mint(protocolFeeRecipient, feeUsdc6);
                emit ProtocolFeeCollected(feeUsdc6);
            }
        }
        
        // Close position
        int256 pnl = _closePosition(user, id, currentPrice18, true);
        
        emit PositionLiquidated(user, id, msg.sender, toRepay, liquidatorReward);
    }

    /**
     * @notice Batch liquidate all positions for a user
     * @param user User to liquidate
     * @param symbols Array of symbols to liquidate
     * @param prices Array of current prices (must match symbols length)
     */
    function liquidateAllPositions(
        address user,
        string[] calldata symbols,
        uint256[] calldata prices
    ) external {
        require(symbols.length == prices.length, "Length mismatch");
        if (!predictionTerminal.checkLiquidation(user)) revert NotLiquidatable();
        
        for (uint256 i = 0; i < symbols.length; i++) {
            bytes32 id = keccak256(abi.encodePacked(symbols[i]));
            if (positions[user][id].usdAmount > 0) {
                // Re-use liquidatePosition logic without re-checking liquidation
                _liquidateSinglePosition(user, id, symbols[i], prices[i]);
            }
        }
    }

    function _liquidateSinglePosition(
        address user,
        bytes32 id,
        string calldata symbol,
        uint256 currentPrice18
    ) internal {
        Position storage pos = positions[user][id];
        if (pos.usdAmount == 0) return;
        
        uint256 entryPrice = pos.entryPrice;
        uint256 usdAmount = pos.usdAmount;
        uint256 valueNow = (usdAmount * currentPrice18) / entryPrice;
        
        uint256 liquidatorReward = (usdAmount * LIQUIDATOR_REWARD_BPS) / 10000;
        uint256 protocolFee = (usdAmount * PROTOCOL_FEE_BPS) / 10000;
        uint256 totalPenalty = liquidatorReward + protocolFee;
        
        uint256 availableForDebt = valueNow > totalPenalty ? valueNow - totalPenalty : 0;
        uint256 toRepay = availableForDebt > usdAmount ? usdAmount : availableForDebt;
        
        if (toRepay > 0) {
            predictionTerminal.forceReduceDebt(user, toRepay);
        }
        
        if (toRepay < usdAmount) {
            uint256 shortfall = usdAmount - toRepay;
            predictionTerminal.seizeCollateral(user, shortfall);
        }
        
        if (liquidatorReward > 0) {
            uint256 rewardUsdc6 = liquidatorReward / 1e12;
            if (rewardUsdc6 > 0) mockUsdc.mint(msg.sender, rewardUsdc6);
        }
        
        if (protocolFee > 0) {
            uint256 feeUsdc6 = protocolFee / 1e12;
            if (feeUsdc6 > 0) {
                mockUsdc.mint(protocolFeeRecipient, feeUsdc6);
                emit ProtocolFeeCollected(feeUsdc6);
            }
        }
        
        _closePosition(user, id, currentPrice18, true);
        emit PositionLiquidated(user, id, msg.sender, toRepay, liquidatorReward);
    }

    /**
     * @notice Get position details for a user
     * @param user User address
     * @param symbol Trading pair symbol
     */
    function getPosition(address user, string calldata symbol) 
        external 
        view 
        returns (
            uint256 usdAmount, 
            uint256 entryPrice, 
            uint256 timestamp,
            int256 unrealizedPnl,
            uint256 healthFactor
        ) 
    {
        bytes32 id = keccak256(abi.encodePacked(symbol));
        Position storage pos = positions[user][id];
        
        usdAmount = pos.usdAmount;
        entryPrice = pos.entryPrice;
        timestamp = pos.timestamp;
        healthFactor = predictionTerminal.getHealthFactor(user);
        
        // Note: unrealizedPnl requires current price, which we don't have in view function
        unrealizedPnl = 0;
    }

    /**
     * @notice Calculate unrealized PnL for a position
     * @param user User address
     * @param symbol Trading pair symbol
     * @param currentPrice18 Current market price
     */
    function calculatePnL(address user, string calldata symbol, uint256 currentPrice18) 
        external 
        view 
        returns (int256 pnl, bool isProfit) 
    {
        bytes32 id = keccak256(abi.encodePacked(symbol));
        Position storage pos = positions[user][id];
        
        if (pos.usdAmount == 0) return (0, false);
        
        uint256 valueNow = (pos.usdAmount * currentPrice18) / pos.entryPrice;
        
        if (valueNow >= pos.usdAmount) {
            pnl = int256(valueNow - pos.usdAmount);
            isProfit = true;
        } else {
            pnl = -int256(pos.usdAmount - valueNow);
            isProfit = false;
        }
    }

    /**
     * @notice Get all positions for a user
     * @param user User address
     */
    function getUserPositions(address user) external view returns (bytes32[] memory) {
        return userPositions[user];
    }

    /**
     * @notice Check if a user's position is liquidatable
     * @param user User address
     */
    function isLiquidatable(address user) external view returns (bool) {
        return predictionTerminal.checkLiquidation(user);
    }

    function _removeUserPosition(address user, bytes32 positionId) internal {
        bytes32[] storage userPos = userPositions[user];
        for (uint256 i = 0; i < userPos.length; i++) {
            if (userPos[i] == positionId) {
                userPos[i] = userPos[userPos.length - 1];
                userPos.pop();
                break;
            }
        }
    }
}