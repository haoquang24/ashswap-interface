import { sendTransactions as _sendTxs } from "@elrondnetwork/dapp-core/services";
import {
    AccountInfoSliceNetworkType,
    LoginMethodsEnum
} from "@elrondnetwork/dapp-core/types";
import { getAccountProviderType } from "@elrondnetwork/dapp-core/utils";
import { ExtensionProvider } from "@elrondnetwork/erdjs-extension-provider/out";
import {
    Address,
    CallArguments,
    SmartContract,
    Transaction
} from "@elrondnetwork/erdjs/out";
import {
    accAddressState,
    accIsLoggedInState,
    networkConfigState
} from "atoms/dappState";
import { gasLimitBuffer, gasPrice, maxGasLimit } from "const/dappConfig";
import { DappSendTransactionsPropsType } from "interface/dappCore";
import { useRecoilValue } from "recoil";
const emptyTx = new Transaction({
    nonce: 0,
    receiver: new Address(""),
    chainID: "",
    gasLimit: 0,
});
// flow create TXS -> set nonce -> sign TXS -> send TXS -> update local nonce
export const useCreateTransaction = () => {
    const isLoggedIn = useRecoilValue(accIsLoggedInState);
    const address = useRecoilValue(accAddressState);
    const network: AccountInfoSliceNetworkType =
        useRecoilValue(networkConfigState).network;
    /** Create transaction with nonce = 0, set nonce with useSetTransactionsNonce or let useSignTransactions handle it automaticlly  */
    return async (scAddress: Address, arg: Omit<CallArguments, "chainID">) => {
        if (!isLoggedIn || !address) {
            return emptyTx;
        }

        let contract = new SmartContract({
            address: scAddress,
        });

        let tx = contract.call({ ...arg, chainID: network.chainId });
        tx = new Transaction({
            chainID: network.chainId,
            data: tx.getData(),
            receiver: scAddress,
            gasPrice: gasPrice,
            gasLimit: Math.min(
                Math.floor(arg.gasLimit.valueOf() * gasLimitBuffer),
                maxGasLimit
            ),
            version: tx.getVersion(),
        });
        return tx;
    };
};
export const sendTransactions = async (
    payload: DappSendTransactionsPropsType
) => {
    const accProviderType = getAccountProviderType();
    if (accProviderType === LoginMethodsEnum.extension) {
        await ExtensionProvider.getInstance()?.cancelAction?.();
    }

    return await _sendTxs(payload);
};
