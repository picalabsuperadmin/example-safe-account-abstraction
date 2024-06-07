import { useCallback, useEffect, useMemo, useState } from 'react';
import Divider from '@/components/ui/Divider';
import { LoginProps } from '@/utils/types';
import { logout } from '@/utils/common';
import { useMagic } from '../MagicProvider';
import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';
import CardLabel from '@/components/ui/CardLabel';
import Spinner from '@/components/ui/Spinner';
import { getNetworkName, getNetworkToken } from '@/utils/network';
import { useSafeProvider } from '@/components/safe/useSafeProvider';
import { formatEther } from 'viem';

const UserInfo = ({ token, setToken }: LoginProps) => {
  const { magic, web3, publicClient } = useMagic();
  const { smartClient } = useSafeProvider();
  const [copied, setCopied] = useState('Copy');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [magicBalance, setMagicBalance] = useState<string>("...");
  const [scaBalance, setScaBalance] = useState<string>("...");
  const [scaAddress, setScaAddress] = useState<string | undefined>("");
  const [magicAddress] = useState(localStorage.getItem("user"));

  const [publicAddress] = useState(localStorage.getItem('user'));

  const getBalance = useCallback(async () => {
    if (magicAddress && publicClient) {
      const magicBalance = await publicClient?.getBalance({
        address: magicAddress as `0x${string}`,
      });
      if (magicBalance == BigInt(0)) {
        setMagicBalance("0");
      } else {
        setMagicBalance(formatEther(magicBalance));
      }
    }
    if (scaAddress && publicClient) {
      const aaBalance = await publicClient?.getBalance({
        address: scaAddress as `0x${string}`,
      });
      if (aaBalance == BigInt(0)) {
        setScaBalance("0");
      } else {
        setScaBalance(formatEther(aaBalance));
      }
    }
  }, [scaAddress, magicAddress, publicClient]);

  const getSmartContractAccount = useCallback(async () => {
    if (smartClient) {
      const address = smartClient.account?.address;
      setScaAddress(address);
    }
  }, [smartClient]);

  useEffect(() => {
    getSmartContractAccount();
  }, [getSmartContractAccount]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await getBalance();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, [getBalance]);

  useEffect(() => {
    if (web3) {
      refresh();
    }
  }, [web3, refresh]);

  useEffect(() => {
    setMagicBalance("...");
    setScaBalance("...");
  }, [magic]);

  const disconnect = useCallback(async () => {
    if (magic) {
      await logout(setToken, magic);
    }
  }, [magic, setToken]);

  const copy = useCallback(() => {
    if (publicAddress && copied === 'Copy') {
      setCopied('Copied!');
      navigator.clipboard.writeText(publicAddress);
      setTimeout(() => {
        setCopied('Copy');
      }, 1000);
    }
  }, [copied, publicAddress]);

  return (
    <Card>
      <CardHeader id="Wallet">Wallet</CardHeader>
      <CardLabel
        leftHeader="Status"
        rightAction={<div onClick={disconnect}>Disconnect</div>}
        isDisconnect
      />
      <div className="flex-row">
        <div className="green-dot" />
        <div className="connected">Connected to {getNetworkName()}</div>
      </div>
      <Divider />
      <CardLabel
        leftHeader="Addresses"
        rightAction={
          !magicAddress ? <Spinner /> : <div onClick={copy}>{copied}</div>
        }
      />
      <div className="flex flex-col gap-2">
        <div className="code">
          Magic Wallet:{" "}
          {magicAddress?.length == 0 ? "Fetching address.." : magicAddress}
        </div>
        <div className="code">
          Smart Contract Wallet:{" "}
          {scaAddress?.length == 0 ? "Fetching address.." : scaAddress}
        </div>
      </div>
      <Divider />
      <CardLabel
        leftHeader="Balance"
        rightAction={
          isRefreshing ? (
            <div className="loading-container">
              <Spinner />
            </div>
          ) : (
            <div onClick={refresh}>Refresh</div>
          )
        }
      />
      <div className="flex flex-col gap-2">
        <div className="code">
          Magic Balance: {magicBalance.substring(0, 7)} {getNetworkToken()}
        </div>
        <div className="code">
          Smart Account Balance: {scaBalance.substring(0, 7)}{" "}
          {getNetworkToken()}
        </div>
      </div>
    </Card>
  );
};

export default UserInfo;
