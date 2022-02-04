pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract GoalContract is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter public _goalIds;
    Counters.Counter public _goalsAchieved;

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

    // event GoalAchieved(
    //     uint256 goalId,
    //     string goal,
    //     uint256 deadline,
    //     address goalOwnerAddress,
    //     address goalCheckerAddress,
    //     uint256 amountPledged,
    //     bool achieved,
    //     bool withdrawn,
    //     bool started,
    //     bool ended
    // );

    // event PledgedAmountWithdrawn(
    //     uint256 goalId,
    //     string goal,
    //     uint256 deadline,
    //     address goalOwnerAddress,
    //     address goalCheckerAddress,
    //     uint256 amountPledged,
    //     bool achieved,
    //     bool withdrawn,
    //     bool started,
    //     bool ended
    // );

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

        _goalIds.increment();
        uint256 goalId = _goalIds.current();

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

        _goalsAchieved.increment();
        idToGoal[goalId].achieved = achieved;
        idToGoal[goalId].ended = true;

        // emit GoalAchieved(
        //     idToGoal[goalId].goalId,
        //     idToGoal[goalId].goal,
        //     idToGoal[goalId].deadline,
        //     idToGoal[goalId].goalOwnerAddress,
        //     idToGoal[goalId].goalCheckerAddress,
        //     idToGoal[goalId].amountPledged,
        //     idToGoal[goalId].achieved,
        //     idToGoal[goalId].withdrawn,
        //     idToGoal[goalId].started,
        //     idToGoal[goalId].ended
        // );
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

        // emit PledgedAmountWithdrawn(
        //     idToGoal[goalId].goalId,
        //     idToGoal[goalId].goal,
        //     idToGoal[goalId].deadline,
        //     idToGoal[goalId].goalOwnerAddress,
        //     idToGoal[goalId].goalCheckerAddress,
        //     idToGoal[goalId].amountPledged,
        //     idToGoal[goalId].achieved,
        //     idToGoal[goalId].withdrawn,
        //     idToGoal[goalId].started,
        //     idToGoal[goalId].ended
        // );
    }

    // to support receiving ETH by default
    receive() external payable {}

    fallback() external payable {}
}
