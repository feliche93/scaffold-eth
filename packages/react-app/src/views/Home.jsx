import React from "react";
import { Link } from "react-router-dom";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { useContractReader, useBalance } from "eth-hooks";
import { Button, Steps, Row, Col, Statistic, TimePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
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
import moment from "moment";

import { ethers } from "ethers";

const { Step } = Steps;

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
  const goalContractAddress = readContracts && readContracts.GoalContract && readContracts.GoalContract.address;
  console.log("📟 goalContractAddress:", goalContractAddress);

  const goalsCreated = useContractReader(readContracts, "GoalContract", "goalIds");
  const goalsAchievedd = useContractReader(readContracts, "GoalContract", "goalsAchieved");
  const goalContractETHBalance = useBalance(localProvider, goalContractAddress);

  const goalsCreatedEvents = useEventListener(readContracts, "GoalContract", "GoalCreated", localProvider, 1);

  const current = 0;

  return (
    <>
      <div style={{ padding: 8, marginTop: 60, width: 420, margin: "auto" }}>
        <h1>Go Ape into it! 💪</h1>
        <h2>Put your Crypto where your mouth is to reach goals 🎯 faster 💨</h2>
        <br/>
      </div>
      <div style={{ padding: 8, marginTop: 60, width: 420, margin: "auto" }}>
        <h2>Dapp Stats 📊</h2>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic title="Created Goals" value={goalsCreated} />
          </Col>
          <Col span={8}>
            <Statistic title="Achieved Goals" value={goalsAchievedd} />
          </Col>
          <Col span={8}>
            <div class="ant-statistic">
              <div class="ant-statistic-title">Total Value Locked</div>
              <div class="ant-statistic-content">
                <span class="ant-statistic-content-value">
                  <Balance price={price} balance={goalContractETHBalance} />
                </span>
              </div>
            </div>
          </Col>
        </Row>
        <br/>
      </div>
      <div style={{ padding: 8, marginTop: 50, width: 420, margin: "auto" }}>
        <h3>How does it work?</h3>
        <div style={{ padding: 8, marginTop: 60, width: 420, margin: "auto" }}>
          <Steps current={current} direction="vertical">
            <Step
              status="current"
              title="Step 1: Create a Goal"
              description="Create a goal, put a deadline, pledge some crypto and put a wallet address of a supervisor who will evaluate whether you achieved your goal."
            />
            <Step
              status="current"
              title="Step 2: Supervisor Evaluates Your Goal"
              description="After the deadline has passed, your supervisor will evaluate whether you achieved your goal."
            />
            <Step
              status="current"
              title="Step 3: Withdraw Your Funds"
              description="If you achieved your goal, you can withdraw your funds from the smart contract. Otherwise, your funds are locked and you loose your money."
            />
          </Steps>
        </div>
      </div>
    </>
  );
}

export default Home;
