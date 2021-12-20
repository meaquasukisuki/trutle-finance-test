import axios from "axios";
const key = process.env.REACT_APP_ETHER_SCAN_API_KEY;

/**
 *
 * @param {*} address token address (smart contract address)
 * @returns
 */
export async function getABIByAddress(address) {
	const url = "https://api.etherscan.io/api";
	const res = await axios
		.get(url, {
			params: {
				module: "contract",
				action: "getabi",
				address,
				apikey: key,
			},
		})
		.then((response) => {
			return response.data.result;
		})
		.then((res) => JSON.parse(res));
	return res;
}
