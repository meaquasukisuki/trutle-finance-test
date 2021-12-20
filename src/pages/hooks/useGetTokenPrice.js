import { useGetTokenPositions } from "./useGetTokenPositions";

export const useGetTokenPrice = () => {
	const getTokenPositions = useGetTokenPositions();
	let res = 0;
	async function getTokenPrice(tokenAddress, coinPriceList) {
		getTokenPositions(tokenAddress).then((tokenPostions) => {
			tokenPostions.forEach((tokenPosition) => {
				const address = tokenPosition[0].toLowerCase();
				if (!coinPriceList[address]) {
					getTokenPrice(tokenPosition[0]);
				}
				const amount = Number(Number(tokenPosition[2] / 10 ** 18).toFixed(6));
				res += coinPriceList[address][currency] * amount;
			});
			return res;
		});
	}
	return getTokenPrice;
};
