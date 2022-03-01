import ICArrowRight from "assets/svg/arrow-right.svg";
import InfoLayout from "components/Layout/Info";
import React, { ReactElement } from "react";
import TokenTable from "views/info/Tokens/TokenTable";

function TokensPage() {
    return (
        <div>
            <div>
                <div className="text-white py-7 max-w-6xl mx-auto px-6 sm:px-0">
                    <ul className="flex space-x-1 text-xs mb-6">
                        <li>Dashboard</li>
                        <li className="text-ash-gray-500">
                            <ICArrowRight className="inline mr-1" />
                            <span>Tokens</span>
                        </li>
                    </ul>
                    <div className="text-4xl font-bold mb-[3.625rem]">
                        Tokens
                    </div>
                    {/* <FeeByTokensChart /> */}
                    <h4 className="font-bold text-lg mb-7 text-white mt-[3.625rem]">
                        Top Tokens
                    </h4>
                    <TokenTable />
                </div>
            </div>
        </div>
    );
}

TokensPage.getLayout = function getLayout(page: ReactElement) {
    return <InfoLayout>{page}</InfoLayout>;
};

export default TokensPage;
