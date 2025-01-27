import ICArrowRight from "assets/svg/arrow-right.svg";
import GovLayout from "components/Layout/Gov";
import { ReactElement } from "react";
import GovBoostStatus from "views/stake/gov/boost/GovBoostStatus";
import GovMenu from "views/stake/gov/components/GovMenu";

function BoostPage() {
    return (
        <>
            <div className="ash-container text-white pt-[1.875rem]">
                <ul className="flex flex-wrap space-x-1 mb-4 md:mb-[3.25rem] text-sm md:text-lg font-bold">
                    <li>Stake</li>
                    <li>
                        <ICArrowRight className="inline mr-1" />
                        <span>Governance Stake</span>
                    </li>
                    <li className="text-ash-gray-500">
                        <ICArrowRight className="inline mr-1" />
                        <span>Farm Boost</span>
                    </li>
                </ul>
                <div className="mb-7">
                    <h1 className="text-pink-600 text-2xl md:text-5xl font-bold mb-7 md:mb-11">
                        Farm Boost
                    </h1>
                    <GovMenu />
                </div>
                <GovBoostStatus />
            </div>
        </>
    );
}

BoostPage.getLayout = function getLayout(page: ReactElement) {
    return <GovLayout>{page}</GovLayout>;
};

export default BoostPage;
