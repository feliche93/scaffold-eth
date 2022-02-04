import React from "react";
import { Link } from "react-router-dom";
import { useContractReader } from "eth-hooks";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import {
  Account,
  Address,
  AddressInput,
  Balance,
  Contract,
  Faucet,
  GasGauge,
  Header,
  Ramp,
  ThemeSwitch,
} from "./../components";
import { useCallback, useEffect, useState } from "react";

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

  const [goalCheckerAddress, setGoalCheckerAddress] = useState();
  const [goal, setGoal] = useState();


  return (
    <div style={{ padding: 8, marginTop: 32, width: 420, margin: "auto" }}>
      <Card title="Create a Goal">
        <div style={{ padding: 8 }}>
          <Input
            style={{ textAlign: "center" }}
            placeholder={"Goal"}
            value={goal}
            onChange={e => {
              setGoal(e.target.value);
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
          {/* <Button
            type={"primary"}
            onClick={() => {
              tx(
                writeContracts.YourToken.transfer(tokenSendToAddress, ethers.utils.parseEther("" + tokenSendAmount)),
              );
            }}
          >
            Send Tokens
          </Button> */}
        </div>
      </Card>
    </div>
  );
}

export default Home;
