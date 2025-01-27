import { ChartActiveDot } from "components/Chart/ChartActiveDot";
import { ChartLineX } from "components/Chart/ChartLineX";
import { ASHSWAP_CONFIG } from "const/ashswapConfig";
import { MONTH_SHORT } from "const/time";
import { fetcher } from "helper/common";
import { formatAmount } from "helper/number";
import { IESDTInfo } from "helper/token/token";
import { useScreenSize } from "hooks/useScreenSize";
import { useValueChart } from "hooks/useValueChart";
import { ChartTimeUnitType } from "interface/chart";
import moment from "moment";
import { useCallback, useMemo, useRef } from "react";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import useSWR from "swr";

const CustomActiveDot = ({ dotColor, ...props }: any) => {
    const { cx, cy } = props;
    return <ChartActiveDot dotColor={dotColor} cx={cx} cy={cy} />;
};
const CustomTooltipCursor = ({ areaRef, ...props }: any) => {
    const { width, height, left, payloadIndex } = props;
    if (!areaRef.current) return null;
    const y = areaRef.current.state.curPoints[payloadIndex]?.y || 0;
    const value =
        areaRef.current.state.curPoints[payloadIndex]?.payload.value || 0;
    return (
        <ChartLineX
            width={width}
            height={height}
            left={left}
            y={y}
            label={formatAmount(value) || ""}
        />
    );
};
function TokenPriceAreaChart({
    token,
    timeUnit,
}: {
    token: IESDTInfo;
    timeUnit: ChartTimeUnitType;
}) {
    const { data } = useSWR<[number, number][]>(
        token.identifier
            ? `${ASHSWAP_CONFIG.ashApiBaseUrl}/token/${token.identifier}/graph-statistic?type=price`
            : null,
        fetcher
    );
    const areaRef = useRef<any>(null);
    const { sm } = useScreenSize();
    const chartData = useMemo(() => {
        if (!data) return [];
        return data.map(([timestampMs, value]) => ({
            timestamp: timestampMs / 1000,
            value,
        }));
    }, [data]);
    const { displayChartData, timestampTicks: ticks } = useValueChart(
        chartData,
        timeUnit
    );
    // Xaxis formatter
    const tickFormatter = useCallback(
        (val, index: number) => {
            const time = moment.unix(val);
            return timeUnit === "D"
                ? time.format("DD/MM/yyyy")
                : timeUnit === "M"
                ? MONTH_SHORT[time.month()]
                : "week " + time.week() + "/" + time.year();
        },
        [timeUnit]
    );
    return (
        <ResponsiveContainer>
            <AreaChart data={displayChartData}>
                <defs>
                    <linearGradient
                        id="TLC-colorUv"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="5%"
                            stopColor="#FF005C"
                            stopOpacity={0.2}
                        />
                        <stop
                            offset="95%"
                            stopColor="#FF005C"
                            stopOpacity={0}
                        />
                    </linearGradient>
                    <filter id="TLC-shadowUv" height="200%">
                        <feDropShadow
                            dx="0"
                            dy="0"
                            stdDeviation="5"
                            floodColor="#FF005C"
                        />
                    </filter>
                </defs>
                <XAxis
                    dataKey="timestamp"
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    padding={{ right: 30 }}
                    interval="preserveStart"
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={tickFormatter}
                    ticks={ticks}
                    tick={{ fill: "#B7B7D7", fontSize: sm ? 12 : 10 }}
                />
                <YAxis
                    dataKey="value"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    padding={{ top: 20, bottom: 20 }}
                    domain={[0, (max: number) => max * 1.5]}
                    tickFormatter={(val: number) => formatAmount(val)}
                    width={50}
                    tick={{ fill: "#B7B7D7", fontSize: sm ? 12 : 10 }}
                />
                <Tooltip
                    coordinate={{ x: 0, y: 0 }}
                    active={true}
                    position={{ x: 0, y: 0 }}
                    cursor={<CustomTooltipCursor areaRef={areaRef} />}
                    content={<></>}
                />
                {/* <Tooltip cursor={{}} content={<CustomTooltip/>}/> */}
                {/* <Tooltip coordinate={{x: 0, y: 0}} active={true} position={{x: 0, y: 0}} cursor={true} content={<CustomTooltip/>}/> */}
                <Area
                    ref={areaRef}
                    type="linear"
                    dataKey="value"
                    stroke="#FF005C"
                    fillOpacity={1}
                    fill="url(#TLC-colorUv)"
                    strokeWidth={3}
                    filter="url(#TLC-shadowUv)"
                    activeDot={(activeDotProps) => (
                        <CustomActiveDot
                            {...activeDotProps}
                            dotColor="#FF005C"
                        />
                    )}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

export default TokenPriceAreaChart;
