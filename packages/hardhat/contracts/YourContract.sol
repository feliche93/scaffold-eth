pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract YourContract is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _goalsCreated;

    struct Goal {
        uint256 goalId;
        string goal;
        uint256 deadline;
        address goalOwnerAddress;
        address goalCheckerAddress;
        uint256 amountPledged;
        bool achieved;
        bool withdrawn;
        bool started;
        bool ended;
    }

    event GoalCreated(
        uint256 goalId,
        string goal,
        uint256 deadline,
        address goalOwnerAddress,
        address goalCheckerAddress,
        uint256 amountPledged,
        bool achieved,
        bool withdrawn,
        bool started,
        bool ended
    );

    mapping(uint256 => Goal) public idToGoal;
    mapping(address => uint256) public amountLockedByAddress;

    constructor() payable {
        // what should we do on deploy?
    }

    function createGoal(
        string memory goal,
        uint256 deadlineInDays,
        address goalCheckerAddress
    ) public payable {
        require(deadlineInDays > 0, "Deadline must be at least 1 day");
        require(
            goalCheckerAddress != address(0),
            "Goal checker address must be set"
        );
        require(
            goalCheckerAddress != msg.sender,
            "Goal checker address cannot be the one of setting the goal"
        );

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToGoal[itemId] = Goal(
            itemId, // goalId
            goal, // goal
            block.timestamp + deadlineInDays * 1 seconds, // deadline calculated from timestamp of block on
            payable(msg.sender), // goalOwnerAddress
            payable(goalCheckerAddress), // goalCheckerAddress
            msg.value, // amountPledged
            false, // achieved
            false, // withdrawn
            true, // started
            false // ended
        );

        // keeping a glboal mapping of each challengers address to the amount they have locked
        amountLockedByAddress[payable(msg.sender)] += msg.value;

        // keeping track of achieved goals
        _goalsCreated.increment();
    }

    function verifyGoal(uint256 goalId, bool achieved) public {
        require(
            msg.sender == idToGoal[goalId].goalCheckerAddress,
            "Only goal checker can verify goal"
        );
        require(idToGoal[goalId].started, "Goal must be started");
        require(
            !idToGoal[goalId].ended,
            "Goal has already ended and been verified"
        );
        require(
            block.timestamp >= idToGoal[goalId].deadline,
            "Goal deadline has not passed yet."
        );

        idToGoal[goalId].achieved = achieved;
        idToGoal[goalId].ended = true;
    }

    function fetchGoals() public view returns (Goal[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 notAchievedGoalsCount = _itemIds.current() -
            _goalsCreated.current();
        uint256 currentIndex = 0;

        Goal[] memory goals = new Goal[](notAchievedGoalsCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToGoal[i + 1].achieved) {
                uint256 currentId = i + 1;
                Goal storage currentItem = idToGoal[currentId];
                goals[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return goals;
    }

    // to support receiving ETH by default
    receive() external payable {}

    fallback() external payable {}
}
