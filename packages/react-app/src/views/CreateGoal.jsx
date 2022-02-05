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
function CreateGoal({
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
    <>
      <div style={{ padding: 8, marginTop: 50, width: 420, margin: "auto" }}>
        <Card title="Put your Crypto where your mouth is 💪">
          <div style={{ padding: 8 }}>
            <Input
              style={{ textAlign: "center" }}
              placeholder={"Your goal 🎯"}
              onOk={goal}
              onChange={e => {
                setGoal(e.target.value);
              }}
            />
          </div>
          <div style={{ padding: 8 }}>
            <Input
              style={{ textAlign: "center" }}
              placeholder={"Days to deadline 📆"}
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
              placeholder="Pledged Amount 💰"
              onChange={value => {
                setAmountPledged(value);
              }}
            />
          </div>
          <div>
            <div style={{ padding: 8 }}>
              <AddressInput
                ensProvider={mainnetProvider}
                placeholder="Supervisor's address 📫"
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
              Start Challenge 🚀
            </Button>
          </div>
        </Card>
      </div>
      <div style={{ width: 500, margin: "auto", marginTop: 64 }}>
        <div>Created Goals:</div>
        <List
          dataSource={goalsCreatedEvents}
          renderItem={item => {
            return (
              <List.Item key={item.blockNumber + item.blockHash}>
                <Address value={item.args[3]} ensProvider={mainnetProvider} fontSize={16} /> will
                <span style={{ fontSize: 24 }}> {item.args[1]} </span>
                <span> until </span>
                <span style={{ fontSize: 24 }}>{moment.unix(item.args[2].toNumber()).fromNow()}</span>
                <span> or loose</span>
                <Balance price={price} balance={item.args[5]} />



              </List.Item>
            );
          }}
        />
      </div>
    </>

  );
}

export default CreateGoal;
