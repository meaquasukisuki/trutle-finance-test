import axios from "axios";

const allTokenListUrl =
	"https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/set.tokenlist.json";

async function getTokenList() {
	const tokenList = await axios.get(allTokenListUrl).then((response) => {
		return response.data;
	});
	return tokenList;
}

/**
 *
 * @param {*} address
 * @param {*} platform currently only ethereum
 * @returns
 */
async function getCoinInfo(address, platform = "ethereum") {
	const url = `https://api.coingecko.com/api/v3/coins/${platform}/contract/${address}`;
	const info = await axios.get(url).then((res) => res.data);
	return info;
}

async function getCoinPrice(
	addresses,
	platform = "ethereum",
	currencyUnit = "usd,btc,eth"
) {
	const url = `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${addresses}&vs_currencies=${currencyUnit}`;
	const price = await axios.get(url).then((res) => res.data);

	return price;
}

async function getAllTokenListCoinPrice(tokenList, getTokenPositions) {
	let addresses = "";
	const tokenListPositionPromises = [];
	for (let index = 0; index < tokenList.length; index++) {
		const token = tokenList[index];
		if (token && token.address) {
			const tokenPositionPromise = getTokenPositions(token.address).then(
				(tokenPositions) => {
					if (Array.isArray(tokenPositions)) {
						return tokenPositions.map((tokenPosition) => {
							return tokenPosition;
						});
					}
				}
			);
			tokenListPositionPromises.push(tokenPositionPromise);
		}
	}

	// Promise.all((tokenListPositionPromises))

	const res = Promise.allSettled(tokenListPositionPromises).then(
		(tokenListPositions) => {
			tokenListPositions.forEach((tokenPositionArr) => {
				tokenPositionArr = tokenPositionArr.value;
				if (Array.isArray(tokenPositionArr) && tokenPositionArr.length) {
					tokenPositionArr.forEach((tokenPosition) => {
						if (Array.isArray(tokenPosition) && tokenPosition.length) {
							addresses += tokenPosition[0] + ",";
						}
					});
				}
			});
			addresses = addresses.substring(0, addresses.length - 1);
			return getCoinPrice(addresses);
		}
	);
	return res;
}

async function getTokenDetailInfo(address, platform = "ethereum") {
	const url = `https://api.coingecko.com/api/v3/coins/${platform}/contract/${address}`;
	const detailInfo = await axios.get(url).then((res) => {
		if (res.status === 404) {
			return {
				error: "Cannot find token detail info!",
			};
		}
		return res.data;
	});
	return detailInfo;
}

async function getAllCoins() {
	const url = "https://api.tokensets.com/v1/coins";
	const data = await axios.get(url).then((res) => {
		return res.data;
	});
	return data;
}

const tokenApis = {
	getTokenList,
	getCoinInfo,
	getCoinPrice,
	getAllTokenListCoinPrice,
	getTokenDetailInfo,
	getAllCoins,
};

export default tokenApis;
