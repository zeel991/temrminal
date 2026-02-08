// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/**
 * @title PredictionTerminal
 * @notice Binary YES/NO AMM. Users buy shares with USDC (no leverage). Shares are collateral; 75% buying power is only for leveraged positions (via LeveragedTrading).
 */
contract PredictionTerminal {
    uint256 public constant PRECISION = 1e18;
    uint256 public constant USDC_DECIMALS = 6;
    uint256 public constant USDC_TO_AMM = 1e12; // 6 -> 18
    uint256 public constant BUYING_POWER_BPS = 7500; // 75%
    uint256 public constant LIQUIDATION_BPS = 7500;

    uint256 public marketId;
    uint256 public reserveYes;
    uint256 public reserveNo;

    mapping(address => uint256) public yesShares;
    mapping(address => uint256) public noShares;
    mapping(address => uint256) public debt;

    address public owner;
    address public tradingContract;
    address public mockUsdc;

    event MarketUpdate(uint256 indexed marketId, uint256 yesPrice, uint256 noPrice, uint256 timestamp);
    event Deposited(address indexed user, bool isYes, uint256 amount);
    event Bet(address indexed user, bool isYes, uint256 usdcAmount, uint256 sharesOut);
    event TradeDebtChanged(address indexed user, int256 delta);

    error InsufficientReserve();
    error OnlyTradingContract();
    error DebtWouldExceedBuyingPower();
    error ReduceDebtExceedsCurrent();
    error MockUsdcNotSet();

    constructor() {
        owner = msg.sender;
        marketId = 0;
        reserveYes = 1000 * PRECISION;
        reserveNo = 1000 * PRECISION;
    }

    function setMockUsdc(address _mockUsdc) external {
        require(msg.sender == owner, "Not owner");
        mockUsdc = _mockUsdc;
    }

    function getK() public view returns (uint256) {
        return reserveYes * reserveNo;
    }

    function getYesPrice() public view returns (uint256) {
        uint256 total = reserveYes + reserveNo;
        return total == 0 ? PRECISION / 2 : (reserveNo * PRECISION) / total;
    }

    function getNoPrice() public view returns (uint256) {
        uint256 total = reserveYes + reserveNo;
        return total == 0 ? PRECISION / 2 : (reserveYes * PRECISION) / total;
    }

    function getCurrentShareValue(address user) public view returns (uint256) {
        uint256 yPrice = getYesPrice();
        uint256 nPrice = getNoPrice();
        return (yesShares[user] * yPrice + noShares[user] * nPrice) / PRECISION;
    }

    function getBuyingPower(address user) public view returns (uint256) {
        return (getCurrentShareValue(user) * BUYING_POWER_BPS) / 10000;
    }

    function getDebt(address user) external view returns (uint256) {
        return debt[user];
    }

    function depositYes(uint256 amount) external {
        if (reserveYes < amount) revert InsufficientReserve();
        reserveYes -= amount;
        yesShares[msg.sender] += amount;
        emit Deposited(msg.sender, true, amount);
    }

    function depositNo(uint256 amount) external {
        if (reserveNo < amount) revert InsufficientReserve();
        reserveNo -= amount;
        noShares[msg.sender] += amount;
        emit Deposited(msg.sender, false, amount);
    }

    /// @notice Buy YES shares with USDC. No debt; shares become collateral for leveraged positions.
    function buyYesWithUsdc(uint256 usdcAmount) external {
        if (mockUsdc == address(0)) revert MockUsdcNotSet();
        IERC20(mockUsdc).transferFrom(msg.sender, address(this), usdcAmount);
        uint256 amount18 = usdcAmount * USDC_TO_AMM;
        uint256 k = getK();
        uint256 newNo = reserveNo + amount18;
        uint256 newYes = k / newNo;
        uint256 sharesOut = reserveYes - newYes;
        reserveYes = newYes;
        reserveNo = newNo;
        yesShares[msg.sender] += sharesOut;
        emit Bet(msg.sender, true, usdcAmount, sharesOut);
        emit MarketUpdate(marketId, getYesPrice(), getNoPrice(), block.timestamp);
    }

    /// @notice Buy NO shares with USDC. No debt; shares become collateral for leveraged positions.
    function buyNoWithUsdc(uint256 usdcAmount) external {
        if (mockUsdc == address(0)) revert MockUsdcNotSet();
        IERC20(mockUsdc).transferFrom(msg.sender, address(this), usdcAmount);
        uint256 amount18 = usdcAmount * USDC_TO_AMM;
        uint256 k = getK();
        uint256 newYes = reserveYes + amount18;
        uint256 newNo = k / newYes;
        uint256 sharesOut = reserveNo - newNo;
        reserveNo = newNo;
        reserveYes = newYes;
        noShares[msg.sender] += sharesOut;
        emit Bet(msg.sender, false, usdcAmount, sharesOut);
        emit MarketUpdate(marketId, getYesPrice(), getNoPrice(), block.timestamp);
    }

    function checkLiquidation(address user) external view returns (bool) {
        uint256 shareValue = getCurrentShareValue(user);
        uint256 threshold = (shareValue * LIQUIDATION_BPS) / 10000;
        return debt[user] > threshold;
    }

    function setTradingContract(address _tradingContract) external {
        require(msg.sender == owner, "Not owner");
        tradingContract = _tradingContract;
    }

    function addDebt(address user, uint256 amount) external {
        if (msg.sender != tradingContract) revert OnlyTradingContract();
        uint256 bp = getBuyingPower(user);
        if (debt[user] + amount > bp) revert DebtWouldExceedBuyingPower();
        debt[user] += amount;
        emit TradeDebtChanged(user, int256(uint256(amount)));
    }

    function reduceDebt(address user, uint256 amount) external {
        if (msg.sender != tradingContract) revert OnlyTradingContract();
        if (amount > debt[user]) revert ReduceDebtExceedsCurrent();
        debt[user] -= amount;
        emit TradeDebtChanged(user, -int256(uint256(amount)));
    }
}
