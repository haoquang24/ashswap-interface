import { AccountInfoSliceNetworkType } from "@elrondnetwork/dapp-core/types";
import IconNewTab from "assets/svg/new-tab.svg";
import {
    accAddressState,
    accIsLoggedInState,
    networkConfigState
} from "atoms/dappState";
import BaseModal from "components/BaseModal";
import { ASHSWAP_CONFIG } from "const/ashswapConfig";
import pools from "const/pool";
import { toEGLD } from "helper/balance";
import { fetcher } from "helper/common";
import { IESDTInfo } from "helper/token/token";
import { useScreenSize } from "hooks/useScreenSize";
import IPool from "interface/pool";
import { useCallback, useEffect, useMemo } from "react";
import { useRecoilValue } from "recoil";
import useSWR from "swr";

const getTokenFromPools = (...pools: IPool[]) => {
    const map = new Map<string, IESDTInfo>();
    pools.map((pool) => {
        pool.tokens.map((token) => {
            map.set(token.identifier, token);
        });
    });
    return Array.from(map.values());
};
const TOKENS = getTokenFromPools(...pools);
interface Props {
    open: boolean;
    onClose?: () => void;
}
interface TXRecord {
    caller: string;
    epoch: number;
    first_token_amount?: string;
    first_token_id?: string;
    first_token_reserve?: string;
    lp_supply?: string;
    lp_token_amount?: string;
    lp_token_id?: string;
    name: string;
    receiver: string;
    second_out_reserve?: string;
    second_token_amount?: string;
    second_token_id?: string;
    second_token_reserve?: string;
    timestamp: number;
    token_amount_in?: string;
    token_amount_out?: string;
    token_in?: string;
    token_in_reserve?: string;
    token_out?: string;
    total_value?: string;
    transaction_hash: string;
}

const HistoryModal = ({ open, onClose }: Props) => {
    const loggedIn = useRecoilValue(accIsLoggedInState);
    const address = useRecoilValue(accAddressState);
    const { data: txHistory, mutate: refresh } = useSWR<TXRecord[]>(
        loggedIn
            ? `${ASHSWAP_CONFIG.ashApiBaseUrl}/user/${address}/transaction?offset=0&limit=50`
            : null,
        fetcher
    );
    const screenSize = useScreenSize();
    const network: AccountInfoSliceNetworkType =
        useRecoilValue(networkConfigState).network;

    const displayTx = useMemo(() => {
        return (txHistory || [])
            .map((record) => {
                const { name, transaction_hash } = record;
                switch (name) {
                    case "swap":
                        const {
                            token_amount_in,
                            token_amount_out,
                            token_in,
                            token_out,
                        } = record;
                        const tokenIn = TOKENS.find(
                            (t) => t.identifier === token_in
                        );
                        const tokenOut = TOKENS.find(
                            (t) => t.identifier === token_out
                        );

                        if (
                            !token_amount_in ||
                            !token_amount_out ||
                            !tokenIn ||
                            !tokenOut
                        ) {
                            return null;
                        }
                        return {
                            msg: `Swap Success ${toEGLD(
                                tokenIn,
                                token_amount_in
                            ).decimalPlaces(7)} ${tokenIn.symbol} to ${toEGLD(
                                tokenOut,
                                token_amount_out
                            ).decimalPlaces(7)} ${tokenOut.symbol}`,
                            txHash: transaction_hash,
                            status: "success",
                        };
                    case "add_liquidity":
                    case "remove_liquidity":
                        const {
                            first_token_amount,
                            first_token_id,
                            second_token_amount,
                            second_token_id,
                        } = record;
                        const token1 = TOKENS.find(
                            (t) => t.identifier === first_token_id
                        );
                        const token2 = TOKENS.find(
                            (t) => t.identifier === second_token_id
                        );
                        if (
                            !first_token_amount ||
                            !second_token_amount ||
                            !token1 ||
                            !token2
                        )
                            return null;
                        return {
                            msg: `${
                                name === "add_liquidity" ? "Add" : "Remove"
                            } Success ${toEGLD(
                                token1,
                                first_token_amount
                            ).decimalPlaces(7)} ${token1?.symbol} and ${toEGLD(
                                token2,
                                second_token_amount
                            ).decimalPlaces(7)} ${token2.symbol}`,
                            txHash: transaction_hash,
                            status: "success",
                        };
                    default:
                        return null;
                }
            })
            .filter((val) => val !== null);
    }, [txHistory]);
    useEffect(() => {
        if (open) {
            refresh();
        }
    }, [open, refresh]);
    const openTransaction = useCallback(
        (txHash: string) => {
            if (typeof window !== "undefined") {
                window.open(
                    network.explorerAddress + "/transactions/" + txHash,
                    "_blank"
                );
            }
        },
        [network.explorerAddress]
    );

    return (
        <BaseModal
            isOpen={open}
            onRequestClose={() => onClose && onClose()}
            type={screenSize.msm ? "drawer_btt" : "modal"}
            className="clip-corner-4 clip-corner-tl bg-ash-dark-600 p-4 text-white sm:w-[32rem] w-full max-h-full sm:max-h-[80vh] mx-auto flex flex-col"
        >
            <div className="flex justify-end mb-3">
                <BaseModal.CloseBtn />
            </div>
            <div className="px-4 font-bold text-2xl mb-5">History</div>
            <div className="grow overflow-auto">
                <div className="px-4">
                    
                    {displayTx.slice(0, 50).map((record) => {
                        if (!record) {
                            return null;
                        }
                        const { msg, status, txHash } = record;
                        return (
                            <div
                                key={txHash}
                                className={`flex flex-row justify-between py-3 text-xs sm:text-sm ${
                                    status === "success"
                                        ? "text-ash-green-500"
                                        : "text-ash-purple-500"
                                }`}
                            >
                                <div
                                    className="flex flex-row select-none cursor-pointer"
                                    onClick={() => openTransaction(txHash)}
                                >
                                    <div
                                        className={`shrink-0 mt-1.5 h-[5px] w-[5px] ${
                                            status === "success"
                                                ? "bg-ash-green-500"
                                                : "bg-ash-purple-500"
                                        }`}
                                    ></div>
                                    <div className="mx-4 text-sm font-bold hover:underline">
                                        {msg}
                                    </div>
                                </div>
                                <div
                                    className="select-none cursor-pointer"
                                    onClick={() => openTransaction(txHash)}
                                >
                                    <IconNewTab />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </BaseModal>
    );
};

export default HistoryModal;
