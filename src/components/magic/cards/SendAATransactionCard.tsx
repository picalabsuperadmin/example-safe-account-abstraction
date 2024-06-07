import React, { useCallback, useEffect, useState } from "react";
import Divider from "@/components/ui/Divider";
import FormButton from "@/components/ui/FormButton";
import FormInput from "@/components/ui/FormInput";
import ErrorText from "@/components/ui/ErrorText";
import Card from "@/components/ui/Card";
import CardHeader from "@/components/ui/CardHeader";
import { getFaucetUrl, getNetworkToken } from "@/utils/network";
import Spacer from "@/components/ui/Spacer";
import TransactionHistory from "@/components/ui/TransactionHistory";
import Image from "next/image";
import Link from "public/link.svg";
import { useSafeProvider } from "@/components/safe/useSafeProvider";
import { isAddress, parseEther } from "viem";
import showToast from "@/utils/showToast";

const SendAATransaction = () => {
  const { smartClient } = useSafeProvider();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [disabled, setDisabled] = useState(!toAddress || !amount);
  const [hash, setHash] = useState<any>("");
  const [toAddressError, setToAddressError] = useState(false);
  const [amountError, setAmountError] = useState(false);

  useEffect(() => {
    setDisabled(!toAddress || !amount);
    setAmountError(false);
    setToAddressError(false);
  }, [amount, toAddress]);

  const sendTransaction = useCallback(async () => {
    if (!smartClient || !smartClient.account) return;

    if (!isAddress(toAddress)) {
      return setToAddressError(true);
    }
    if (isNaN(Number(amount))) {
      return setAmountError(true);
    }
    setDisabled(true);

    // @ts-ignore
    const result = await smartClient.sendTransaction({
      to: toAddress,
      value: parseEther(amount),
    });

    if (result) {
      setToAddress("");
      setAmount("");
      console.log("Transaction hash:", result);
      showToast({
        message: "Transaction Successful.",
        type: "success",
      });
      setHash(result);
      console.log("UserOp Transaction receipt:", result);
    }
    setDisabled(false);
  }, [smartClient, amount, toAddress]);

  return (
    <Card>
      <CardHeader id="send-transaction">Send AA Transaction</CardHeader>
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
        onChange={(e: any) => setToAddress(e.target.value)}
        placeholder="Receiving Address"
      />
      {toAddressError ? <ErrorText>Invalid address</ErrorText> : null}
      <FormInput
        value={amount}
        onChange={(e: any) => setAmount(e.target.value)}
        placeholder={`Amount (${getNetworkToken()})`}
      />
      {amountError ? (
        <ErrorText className="error">Invalid amount</ErrorText>
      ) : null}
      <FormButton
        onClick={sendTransaction}
        disabled={!toAddress || !amount || disabled}
      >
        Send Transaction
      </FormButton>
    </Card>
  );
};

export default SendAATransaction;
