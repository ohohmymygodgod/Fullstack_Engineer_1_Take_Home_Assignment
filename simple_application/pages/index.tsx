import React, { useState } from "react";
import styled from "styled-components";
import { ethers, BigNumber } from "ethers";
// import BigNumber from 'bignumber.js';
import path from 'path';
import { promises as fs } from 'fs';
import 'bootstrap/dist/css/bootstrap.css'

const provider = new ethers.providers.EtherscanProvider('homestead', 'KICQBRWUBNR68JNW8DGI3ZV78SS8J9JHQ1');

export const getStaticProps = async () => {
  const abiDirectory = path.join(process.cwd(), 'abi');

  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  const usdcAbiString = await fs.readFile(abiDirectory + '/USDC_abi.json', 'utf8')
  const usdcAbi = JSON.parse(usdcAbiString);

  const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  const usdtAbiString = await fs.readFile(abiDirectory + '/USDT_abi.json', 'utf8')
  const usdtAbi = JSON.parse(usdtAbiString);

  return {
    props: {
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

interface ContractInfo {
  address: string,
  abi: string,
}

interface ERC20Contract {
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
  width: 1512px;
  height: 982px;\
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

export default function Home({usdcContractInfo, usdtContractInfo}: ERC20Contract) {
  // 0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43
  const [address, setAddress] = useState<string>('');
  const [eth, setEth] = useState<string>('0');
  const [usdc, setUsdc] = useState<string>('0');
  const [usdt, setUsdt] = useState<string>('0');
  const [usdcContract, setUsdcContract] = useState<ethers.Contract>(new ethers.Contract(usdcContractInfo.address, usdcContractInfo.abi, provider))
  const [usdtContract, setUsdtContract] = useState<ethers.Contract>(new ethers.Contract(usdtContractInfo.address, usdtContractInfo.abi, provider))

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
