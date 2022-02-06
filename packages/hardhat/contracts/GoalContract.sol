pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract GoalContract is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter public goalIds;
    Counters.Counter public goalsAchieved;

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

    event GoalEvaluated(
        uint256 goalId,
        string goal,
        address goalOwnerAddress,
        bool achieved
    );

    event PledgedAmountWithdrawn(
        uint256 goalId,
        string goal,
        address goalOwnerAddress,
        uint256 amountPledged
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

        goalIds.increment();
        uint256 goalId = goalIds.current();

        idToGoal[goalId] = Goal(
            goalId, // goalId
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

        emit GoalCreated(
            goalId,
            goal,
            block.timestamp + deadlineInDays * 1 seconds,
            payable(msg.sender),
            payable(goalCheckerAddress),
            msg.value,
            false,
            false,
            true,
            false
        );
    }

    function evaluateGoal(uint256 goalId, bool achieved) public {
        require(
            msg.sender == idToGoal[goalId].goalCheckerAddress,
            "Only goal checker can evaluate goal"
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

        goalsAchieved.increment();
        idToGoal[goalId].achieved = achieved;
        idToGoal[goalId].ended = true;

        emit GoalEvaluated(
            idToGoal[goalId].goalId,
            idToGoal[goalId].goal,
            idToGoal[goalId].goalOwnerAddress,
            idToGoal[goalId].achieved
        );
    }

    function withdrawFunds(uint256 goalId) public nonReentrant {
        require(
            msg.sender == idToGoal[goalId].goalOwnerAddress,
            "Only goal owner can withdraw funds"
        );
        require(idToGoal[goalId].started, "Goal must be started");
        require(idToGoal[goalId].ended, "Goal has not ended yet");
        require(
            block.timestamp >= idToGoal[goalId].deadline,
            "Goal deadline has not passed yet."
        );
        require(!idToGoal[goalId].withdrawn, "Goal has already been withdrawn");
        require(
            idToGoal[goalId].achieved,
            "Goal has not been verified as achieved"
        );

        idToGoal[goalId].withdrawn = true;
        idToGoal[goalId].ended = true;

        (bool sent, ) = msg.sender.call{value: idToGoal[goalId].amountPledged}(
            ""
        );
        require(sent, "Failed to send user ETH back");

        emit PledgedAmountWithdrawn(
            idToGoal[goalId].goalId,
            idToGoal[goalId].goal,
            idToGoal[goalId].goalOwnerAddress,
            idToGoal[goalId].amountPledged
        );
    }

    /* Returns goals that a user can evaluate */
    function fetchEvaluationsByAddress(address targetAddresss)
        public
        view
        returns (Goal[] memory)
    {
        uint256 totalGoalCount = goalIds.current();
        uint256 GoalCount = 0;
        uint256 currentIndex = 0;

        console.log("Total goal count: %s", totalGoalCount);
        console.log("Target Address: %s", targetAddresss);

        for (uint256 i = 0; i < totalGoalCount; i++) {
            console.log("i: %s", i);
            if (
                idToGoal[i + 1].goalCheckerAddress == targetAddresss &&
                !idToGoal[i + 1].ended
            ) {
                console.log(
                    "Goal Checker Address: %s",
                    idToGoal[i + 1].goalCheckerAddress
                );
                GoalCount += 1;
            }
        }

        console.log("Goal count: %s", GoalCount);

        Goal[] memory goals = new Goal[](GoalCount);
        for (uint256 i = 0; i < totalGoalCount; i++) {
            if (
                idToGoal[i + 1].goalCheckerAddress == targetAddresss &&
                !idToGoal[i + 1].ended
            ) {
                uint256 currentId = i + 1;
                Goal storage currentItem = idToGoal[currentId];
                goals[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return goals;
    }

    /* Returns goals that a user complete */
    function fetchAchievedByAddress(address targetAddresss)
        public
        view
        returns (Goal[] memory)
    {
        uint256 totalGoalCount = goalIds.current();
        uint256 GoalCount = 0;
        uint256 currentIndex = 0;

        console.log("Total goal count: %s", totalGoalCount);
        console.log("Target Address: %s", targetAddresss);

        for (uint256 i = 0; i < totalGoalCount; i++) {
            console.log("i: %s", i);
            if (
                idToGoal[i + 1].goalOwnerAddress == targetAddresss &&
                idToGoal[i + 1].achieved &&
                !idToGoal[i + 1].withdrawn
            ) {
                console.log(
                    "Goal Checker Address: %s",
                    idToGoal[i + 1].goalCheckerAddress
                );
                GoalCount += 1;
            }
        }

        console.log("Goal count: %s", GoalCount);

        Goal[] memory goals = new Goal[](GoalCount);
        for (uint256 i = 0; i < totalGoalCount; i++) {
            if (
                idToGoal[i + 1].goalOwnerAddress == targetAddresss &&
                idToGoal[i + 1].achieved &&
                !idToGoal[i + 1].withdrawn
            ) {
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
