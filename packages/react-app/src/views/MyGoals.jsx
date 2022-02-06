import React from "react";
import { Link } from "react-router-dom";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { useContractReader } from "eth-hooks";
import { Button, Card, Typography, Radio, DatePicker, List, TimePicker, Divider, Row, Col, Input, Progress, Slider, Spin, Switch } from "antd";
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
  Blockie
} from "./../components";
import { useCallback, useEffect, useState } from "react";
import moment from 'moment';

import { ethers } from "ethers";

const { Title } = Typography;

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function EvaluateGoal({
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
  const goalsAchieved = useContractReader(readContracts, "GoalContract", "fetchAchievedByAddress", [address]);
  console.log("🔥🔥🔥🔥🔥 goalsAchieved 🔥🔥🔥🔥:", goalsAchieved);

  const pledgedAmountWithdrawnEvents = useEventListener(readContracts, "GoalContract", "PledgedAmountWithdrawn", localProvider, 1);
  console.log("📟 pledgedAmountWithdrawnEvents:", pledgedAmountWithdrawnEvents);

  return (
    <>
      <div style={{ padding: 8, marginTop: 50, width: 700, margin: "auto" }}>
        <Card title="Withdraw Funds from Completed Goals ✅">
          <div style={{ padding: 8 }}>
            <List
              itemLayout="vertical"
              dataSource={goalsAchieved}
              renderItem={item => {

                return (
                  <List.Item
                    key={item.id}
                  >
                    <h4>Goal: </h4>
                    <p style={{ fontSize: 24 }}>{item.goal}</p>
                    <h4>Evaluated By: </h4>
                    <p><Address style={{ marginBottom: '24px' }} address={item.goalCheckerAddress} /></p>
                    <h4>Amount Pledged: </h4>
                    <p><Balance price={price} balance={item.amountPledged} /></p>
                    <h4>Deadline: </h4>
                    <p style={{ fontSize: 24 }}>{moment.unix(item.deadline).calendar()}</p>
                    <h4>Goal status: </h4>
                    <p style={{ fontSize: 24 }}>{item.achieved ? 'Completed ✅' : 'Failed to Complete ❌'}</p>
                    { item.achieved && (
                    <div style={{ paddingTop: 30 }}>
                      <Button
                        type={"primary"}
                        onClick={() => {
                          tx(
                            writeContracts.GoalContract.withdrawFunds(item.goalId)
                          );
                        }}
                      >
                        Withdraw Pledged Funds 🚀
                      </Button>
                    </div>
                    )}
                  </List.Item>
                );
              }}
            />
          </div>
        </Card>
      </div>
      <div style={{ width: 500, margin: "auto", marginTop: 64 }}>
        <div>Completed Goals:</div>
        <List
          dataSource={pledgedAmountWithdrawnEvents}
          itemLayout="vertical"
          renderItem={item => {
            return (
              <List.Item key={item.blockNumber + item.blockHash}>
                <Address value={item.args[2]} ensProvider={mainnetProvider} fontSize={16} />
                <span> has </span>
                { item.args[3] ? <span style={{ fontSize: 24 }}>completed ✅ </span> : <span style={{ fontSize: 24 }}>failed to complete ❌ </span> }
                <span> the goal: </span>
                <span style={{ fontSize: 24 }}>{item.args[1]}</span>
                <span> and withdrew </span>
                <Balance price={price} balance={item.args[3]} />
              </List.Item>
            );
          }}
        />
      </div>
    </>

  );
}

export default EvaluateGoal;
