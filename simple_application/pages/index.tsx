import React, { useState } from "react";
import styled from "styled-components";
import { ethers, BigNumber } from "ethers";
import path from 'path';
import { promises as fs } from 'fs';
import 'bootstrap/dist/css/bootstrap.css'


export const getStaticProps = async () => {
  const abiDirectory = path.join(process.cwd(), 'abi');

  const usdcAddress = process.env.USDC_ADDRESS
  const usdcAbiString = await fs.readFile(abiDirectory + '/USDC_abi.json', 'utf8')
  const usdcAbi = JSON.parse(usdcAbiString);

  const usdtAddress = process.env.USDT_ADDRESS
  const usdtAbiString = await fs.readFile(abiDirectory + '/USDT_abi.json', 'utf8')
  const usdtAbi = JSON.parse(usdtAbiString);

  return {
    props: {
      providerInfo: {
        chain: process.env.CHAIN,
        apiKey: process.env.ETHERSCAN_API_KEY,
      },
      usdcContractInfo: {
        address: usdcAddress,
        abi: usdcAbi
      },
      usdtContractInfo: {
        address: usdtAddress,
        abi: usdtAbi
      },
    },
  }
};

interface ProviderInfo {
  chain: string,
  apiKey: string,
}

interface ContractInfo {
  address: string,
  abi: string,
}

interface Config {
  providerInfo: ProviderInfo,
  usdcContractInfo: ContractInfo,
  usdtContractInfo: ContractInfo
}

const Container = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
`;

const Box = styled.div`
  height: 173px;
  width: 512px;
  border: solid;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
  justify-content: center;
  background: #000000;
  border-radius: 16px;
`;

const TextBox = styled.div`
  height: 44px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Text = styled.div`
  height: 100%;
  font-size: 36px;
  font-family: Inter;
  font-style: normal;
  font-weight: 400;
  line-height: 44px;
  color: #FFFFFF;
`;

const checkAllZero = (str: string) => {
  let allZero = true
  for(let c of str) {
    if(c != '0') {
      allZero = false
      break
    }
  }
  return allZero
}

const formatUSD = (usd: string) => {
  let front = usd.slice(0, usd.length-6)
  let back = usd.slice(usd.length-6, usd.length)
  if(checkAllZero(front)) {
    front = '0'
  }
  if(checkAllZero(back)) {
    back = ''
  }
  if(back) {
    return front + '.' + back
  } else {
    return front
  }
}

export default function Home({providerInfo, usdcContractInfo, usdtContractInfo}: Config) {
  const provider = new ethers.providers.EtherscanProvider(providerInfo.chain, providerInfo.apiKey);
  // 0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43
  const [address, setAddress] = useState<string>('');
  const [eth, setEth] = useState<string>('0');
  const [usdc, setUsdc] = useState<string>('0');
  const [usdt, setUsdt] = useState<string>('0');
  const [usdcContract, setUsdcContract] = useState<ethers.Contract>(new ethers.Contract(usdcContractInfo.address, usdcContractInfo.abi, provider))
  const [usdtContract, setUsdtContract] = useState<ethers.Contract>(new ethers.Contract(usdtContractInfo.address, usdtContractInfo.abi, provider))

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if(!ethers.utils.isAddress(address)) {
      setEth('0')
      setUsdc('0')
      setUsdt('0')
      return
    }

    const balanceInEth = await provider.getBalance(address);
    const balanceInUsdc = await usdcContract.balanceOf(address)
    const balanceInUsdt = await usdtContract.balanceOf(address)

    const balanceInEthString =  ethers.utils.formatUnits(balanceInEth, 'ether');
    const balanceInUsdcString = balanceInUsdc.toString()
    const balanceInUsdtString = balanceInUsdt.toString()

    const balanceInUsdcFormatString = formatUSD(balanceInUsdcString);
    const balanceInUsdtFormatString = formatUSD(balanceInUsdtString);
    
    setEth(balanceInEth.isZero()? '0' : balanceInEthString);
    setUsdc(balanceInUsdc.isZero()? '0' : balanceInUsdcFormatString);
    setUsdt(balanceInUsdt.isZero()? '0' : balanceInUsdtFormatString);
  }
  return (
    <Container>
      <Box style={{marginTop: 100}}>
        <div style={{width: 448, height: 96, borderRadius: 16, marginTop: 16, background: '#FFFFFF'}}>
          <form onSubmit={handleSubmit}>
            <input 
              id='address'
              name='address'
              type='text'
              placeholder='E.g. 0x000...000...'
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{border: 'none', outline: 'none', fontSize: 36, color: 'grey', fontFamily: 'Inter', fontStyle: 'normal', fontWeight: 200, lineHeight: 44, padding: 16}}
            >
            </input>
          </form>
        </div>
        <Text style={{textAlign: 'left', width: '100%', paddingLeft: 32}}>
          Address
        </Text>
      </Box>
      <Box style={{marginTop: 76}}>
        <TextBox>
          <Text style={{paddingLeft: 48}}>Ethereum:</Text>
          <Text style={{marginLeft: 10, marginRight: 10, overflow: 'auto', whiteSpace: 'nowrap', textAlign: 'right', width: '100%'}}>{eth}</Text>
          <Text style={{paddingRight: 48}}>ETH</Text>
        </TextBox>
      </Box>
      <Box style={{marginTop: 26}}>
        <TextBox>
          <Text style={{paddingLeft: 48}}>USDC:</Text>
          <Text style={{marginLeft: 10, marginRight: 10, overflow: 'auto', whiteSpace: 'nowrap', textAlign: 'right', width: '100%'}}>{usdc}</Text>
          <Text style={{paddingRight: 48}}>USDC</Text>
        </TextBox>
      </Box>
      <Box style={{marginTop: 26, marginBottom: 62}}>
        <TextBox>
          <Text style={{paddingLeft: 48}}>USDT:</Text>
          <Text style={{marginLeft: 10, marginRight: 10, overflow: 'auto', whiteSpace: 'nowrap', textAlign: 'right', width: '100%'}}>{usdt}</Text>
          <Text style={{paddingRight: 48}}>USDT</Text>
        </TextBox>
      </Box>
    </Container>
  )
}
