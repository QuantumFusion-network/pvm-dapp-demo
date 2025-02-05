import React, { useState, useEffect } from 'react';
import { Wallet, Copy, ExternalLink, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3FromSource, web3Enable, web3FromAddress, web3Accounts } from '@polkadot/extension-dapp';
import { Keyring } from '@polkadot/keyring';
import { useRef } from 'react';


const RPC_URL = 'wss://dev.qfnetwork.xyz/socket';

const Step = ({ number, title, children, isOpen, toggle }) => (
  <div className="border rounded-xl px-5 py-4 bg-white">
    <button
      onClick={toggle}
      className="w-full flex items-center justify-between font-medium text-lg"
    >
      <h1 className="flex items-center text-left font-karla font-semibold gap-4">
        {title}
      </h1>
      <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
        <ChevronDown className="w-5 h-5" />
      </div>
    </button>
    <div
      className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
    >
      <div className="overflow-hidden">
        <div className="mt-4">{children}</div>
      </div>
    </div>
  </div>
);

const LoadFileStep = () => {

  // Uploaded PVM SmartContract
  const address = "0x248e8fa75194f1dd671bdb220b59936a13fed06f8bd29ed1e5e06e6de2b974e6"

  const contract = useRef();
  const [file, setFile] = useState()
  const [values, setValues] = useState({
    a: 10,
    b: 5
  })

  const [api, setApi] = useState(null);

  const [logs, setLogs] = useState([]);

  const [status, setStatus] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const initApi = async () => {
      try {
        const wsProvider = new WsProvider(RPC_URL);
        const api = await ApiPromise.create({ provider: wsProvider });

        setApi(api);
      } catch (error) {
        setStatus('Failed to connect to network: ' + error.message);
      }
    };

    initApi();
    return () => {
      if (api) {
        api.disconnect();
      }
    };
  }, []);


  const execute = (a, b, op) => async () => {
    // Run qfPolkaVM Transaction :
    const tx = await api.tx.qfPolkaVM.execute(address, a, b, op);

    const unsub = await tx.signAndSend(account.addressData.address,
                { signer: account.signer },
                async (res) => {
                    const { status, events } = res;
                    const result =
                        await api.query.qfPolkaVM.calculationResult(
                                      [address, account.addressData.address]);

                    const logs = events?.map(({ event }) => `Event: ${event.section}.${event.method}`);
                    logs.push('-------------------------------');
                    logs.push(`TRANSACTION RESULT: ${result}`);
                    setLogs(logs);
                    if (status.isInBlock) {
                      setStatus(`In block: ${status.asInBlock.toString()}`);
                    }
                }
    );
  }

  const connectWallet = async () => {
    try {
      setStatus('Connecting to wallet...');

      // Enable extension
      const injected = await window.injectedWeb3['polkadot-js'].enable();
      const accounts = await injected.accounts.get();

      if (accounts.length > 0) {
        setAccount({
          ...injected,
          addressData: accounts[0]
        });
        setStatus(`Wallet connected: ${accounts[0].address}`);
      } else {
        setStatus('No accounts found. Please create one first.');
      }
    } catch (err) {
      setStatus('Failed to connect: ' + err.message);
    }
  };



  return (
    <div className='space-y-4'>
      <button onClick={connectWallet} disable={!!account} className={`w-full mb-2 p-2 ${!account ? 'bg-green-600' : 'bg-gray-600'} text-white rounded-md  disabled:opacity-50`}>
        {!!account ? "Account connected" : "Connect account"}
      </button>


      <h2>Input values</h2>

      <input value={values.a} placeholder='A value' className='rounded-md mr-2' onChange={(e) => setValues({...values, a: e.target.value})} />
      <input value={values.b} placeholder='B value' className='rounded-md mr-2' onChange={(e) => setValues({...values, b: e.target.value})} />

      <div>
        <button onClick={execute(values.a, values.b, 0)} className={`w-full p-2 my-2 ${account ? 'bg-green-600' : 'bg-gray-600'} text-white rounded-md  disabled:opacity-50`}>+</button>
        <button onClick={execute(values.a, values.b, 1)} className={`w-full p-2 my-2 ${account ? 'bg-green-600' : 'bg-gray-600'} text-white rounded-md  disabled:opacity-50`}>-</button>
        <button onClick={execute(values.a, values.b, 2)} className={`w-full p-2 my-2 ${account ? 'bg-green-600' : 'bg-gray-600'} text-white rounded-md  disabled:opacity-50`}>*</button>

        <h2 className='text-center my-4'>{status}</h2>

        <div className='w-full m-4'>
          {logs.map((l, k) => (
            <p key={k}>{l}</p>
          ))}
        </div>
      </div>
    </div>
  )
}

const Faucet = () => {
  const [openStep, setOpenStep] = useState(4);

  return (
    <div className="relative p-6 pt-10 sm:pt-10 pb-20">
      <div className="text-center relative z-[1] mb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-bold mb-2">QF | dApp demo | Calculator</h1>
      </div>

      <div className="space-y-4 relative z-[1] max-w-2xl mx-auto">

        <Step
          number="4"
          title=""
          isOpen={openStep === 4}
          toggle={() => setOpenStep(openStep === 4 ? null : 4)}
        >
          <LoadFileStep />
        </Step>
      </div>


      <div className="h-[1px] bg-[#DCDCDC] mt-8 w-[90%] mx-auto"></div>
      <div className="mt-8 p-5 relative z-[1] bg-white max-w-2xl mx-auto rounded-2xl border border-black">
        <h3 className="font-semibold mb-2 text-xl">Network Information</h3>
        <div className="text-sm">
          <p><strong>RPC Endpoint:</strong> {RPC_URL}</p>
        </div>
      </div>

      <img src="/circle.webp" alt="" className='absolute md:top-0 top-16 w-[35%] left-0 z-[0] md:w-[25%] max-w-sm' />
      <div className='h-[40%] bg-gradient-to-b from-[#C3230B] top-1/2 to-[#D6AE10] fixed right-0 w-3'></div>
    </div>
  );
};

export default Faucet;
