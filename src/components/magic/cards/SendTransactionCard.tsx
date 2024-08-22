import React, { useCallback, useEffect, useState } from 'react';
import Divider from '@/components/ui/Divider';
import { useMagic } from '../MagicProvider';
import FormButton from '@/components/ui/FormButton';
import FormInput from '@/components/ui/FormInput';
import ErrorText from '@/components/ui/ErrorText';
import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';
import { getFaucetUrl, getNetworkToken, isEip1559Supported } from '@/utils/network';
import showToast from '@/utils/showToast';
import Spacer from '@/components/ui/Spacer';
import TransactionHistory from '@/components/ui/TransactionHistory';
import Image from 'next/image';
import Link from 'public/link.svg';
import { TransactionReceipt } from 'web3-core';

const SendTransaction = () => {
  const { web3 } = useMagic();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [disabled, setDisabled] = useState(!toAddress || !amount);
  const [hash, setHash] = useState('');
  const [toAddressError, setToAddressError] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const publicAddress = localStorage.getItem('user');

  useEffect(() => {
    setDisabled(!toAddress || !amount);
    setAmountError(false);
    setToAddressError(false);
  }, [amount, toAddress]);

  const sendTransaction = useCallback(async () => {
    if (!web3?.utils.isAddress(toAddress)) {
      return setToAddressError(true);
    }
    if (isNaN(Number(amount))) {
      return setAmountError(true);
    }
    setDisabled(true);
    const txnParams = {
      from: publicAddress,
      to: toAddress,
      value: web3.utils.toWei(amount, 'ether'),
      // Specify `gasPrice` if network doesn't support EIP-1559
      ...(!isEip1559Supported() && { gasPrice: await web3.eth.getGasPrice() }),
    };
    web3.eth
      .sendTransaction(txnParams as any)
      .on('transactionHash', (txHash: string) => {  // 显式指定 txHash 类型为 string
        setHash(txHash);
        console.log('Transaction hash:', txHash);
      })
      .then((receipt: TransactionReceipt) => {  // 显式指定 receipt 类型为 TransactionReceipt
        showToast({
          message: 'Transaction Successful',
          type: 'success',
        });
        setToAddress('');
        setAmount('');
        console.log('Transaction receipt:', receipt);
      })
      .catch((error) => {
        console.error(error);
        setDisabled(false);
      });
  }, [web3, amount, publicAddress, toAddress]);

  return (
    <Card>
      <CardHeader id="send-transaction">Send Transaction</CardHeader>
      {getFaucetUrl() && (
        <div>
          <a href={getFaucetUrl()} target="_blank" rel="noreferrer">
            <FormButton onClick={() => null} disabled={false}>
              Get Test {getNetworkToken()}
              <Image src={Link} alt="link-icon" className="ml-[3px]" />
            </FormButton>
          </a>
          <Divider />
        </div>
      )}

      <FormInput
        value={toAddress}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToAddress(e.target.value)}  // 修正事件类型
        placeholder="Receiving Address"
      />
      {toAddressError ? <ErrorText>Invalid address</ErrorText> : null}
      <FormInput
        value={amount}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}  // 修正事件类型
        placeholder={`Amount (${getNetworkToken()})`}
      />
      {amountError ? <ErrorText className="error">Invalid amount</ErrorText> : null}
      <FormButton onClick={sendTransaction} disabled={!toAddress || !amount || disabled}>
        Send Transaction
      </FormButton>

      {hash ? (
        <>
          <Spacer size={20} />
          <TransactionHistory />
        </>
      ) : null}
    </Card>
  );
};

export default SendTransaction;
