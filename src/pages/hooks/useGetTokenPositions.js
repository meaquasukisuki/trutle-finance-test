import { useMoralisWeb3Api } from "react-moralis";
import { getABIByAddress } from "services/ABI/ABIServices";

/**
 *  const getTokenPositions = useGetTokenPositions() ,
 *  inside async function :       const tokenPosition = getTokenPositions(smartContractAddress)
 * @returns {function}    getTokenPositions  async function
 */
export const useGetTokenPositions = () => {
	const web3Api = useMoralisWeb3Api();
	async function getTokenPositions(tokenAddress) {
		const abi = await getABIByAddress(tokenAddress);
		const options = {
			abi,
			address: tokenAddress,
			function_name: "getPositions",
		};
		return web3Api.native.runContractFunction(options);
	}

	return getTokenPositions;
};
