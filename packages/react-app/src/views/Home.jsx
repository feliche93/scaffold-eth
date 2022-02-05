import React from "react";
import { Link } from "react-router-dom";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { useContractReader } from "eth-hooks";
import { Button, Card, DatePicker, List, TimePicker, Divider, Row, Col, Input, Progress, Slider, Spin, Switch } from "antd";
import {
  Account,
  Address,
  AddressInput,
  EtherInput,
  Balance,
  Contract,
  Faucet,
  GasGauge,
  Header,
  Ramp,
  ThemeSwitch,
} from "./../components";
import { useCallback, useEffect, useState } from "react";
import moment from 'moment';

import { ethers } from "ethers";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({
  yourLocalBalance,
  readContracts,
  writeContracts,
  address,
  userSigner,
  mainnetProvider,
  localProvider,
  price,
  tx,
}) {
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract
  const goalsCreated = useContractReader(readContracts, "GoalContract", "_goalIds");

  const goalsCreatedEvents = useEventListener(readContracts, "GoalContract", "GoalCreated", localProvider, 1);
  console.log("📟 goalsCreatedEvents:", goalsCreatedEvents);


  const [goalCheckerAddress, setGoalCheckerAddress] = useState();
  const [goal, setGoal] = useState();
  const [deadline, setDeadline] = useState();
  const [deadlineInDays, setDeadlineInDays] = useState();
  const [amountPledged, setAmountPledged] = useState();

  return (
    <div style={{ padding: 8, marginTop: 32, width: 420, margin: "auto" }}>
      <Card title="Create a Goal">
        <div style={{ padding: 8 }}>
          <Input
            style={{ textAlign: "center" }}
            placeholder={"Describe your goal"}
            onOk={goal}
            onChange={e => {
              setGoal(e.target.value);
            }}
          />
        </div>
        <div style={{ padding: 8 }}>
          <Input
            style={{ textAlign: "center" }}
            placeholder={"How many days do you have to reach your goal?"}
            value={deadlineInDays}
            onChange={e => {
              setDeadlineInDays(e.target.value);
            }}
          />
        </div>
        {/* <div style={{ padding: 8 }}>
          <DatePicker
            showTime
            value={deadline}
            onOk={deadline}
            onChange={e => {
              console.log(e);
              setGoal(e);
            }}
            placeholder="Set a deadline for your goal"
            style={{ width: '100%' }}
          />
        </div> */}
        <div style={{ padding: 8 }}>
          <EtherInput
            autofocus={true}
            price={price}
            value={amountPledged}
            placeholder="Amount pledged"
            onChange={value => {
              setAmountPledged(value);
            }}
          />
        </div>
        <div>
          <div style={{ padding: 8 }}>
            <AddressInput
              ensProvider={mainnetProvider}
              placeholder="Adress who verifies your goal"
              value={goalCheckerAddress}
              onChange={setGoalCheckerAddress}
            />
          </div>
        </div>
        <div style={{ padding: 8 }}>
          <Button
            type={"primary"}
            onClick={() => {
              tx(
                writeContracts.GoalContract.createGoal(goal, deadlineInDays, goalCheckerAddress, { value: ethers.utils.parseEther("" + amountPledged) }),
              );
            }}
          >
            Start Challenge
          </Button>
        </div>
      </Card>
      <div style={{ width: 500, margin: "auto", marginTop: 64 }}>
        <div>Created Goals:</div>
        <List
          dataSource={goalsCreatedEvents}
          renderItem={item => {
            return (
              <List.Item key={item.blockNumber + item.blockHash}>
                <Address value={item.args[3]} ensProvider={mainnetProvider} fontSize={16} /> pledged
                <Balance balance={item.args[5]} />
                {'ETH to '}
                {item.args[1]}
                {/* until */}
                {/* {item.args[2]} */}
              </List.Item>
            );
          }}
        />
      </div>
    </div>


  );
}

export default Home;
