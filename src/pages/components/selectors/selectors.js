import tokenApis from "../../../services/TokenAPI/TokenApis";
import { atom, selector, selectorFamily } from "recoil";

const { getTokenList, getAllCoins } = tokenApis;

const allTokenState = selector({
	key: "allTokenState",
	get: async ({ get }) => {
		const res = await getTokenList();
		if (res && res.tokens && res.tokens.length) {
			return res.tokens;
		}
	},
});

const allCoinsState = selector({
	key: "allCoinsState",
	get: async ({ get }) => {
		const res = await getAllCoins();
		if (res && res.coins && res.coins.length) {
			return res.coins;
		}
	},
});

const allTokenSets = atom({
	key: "allTokenSets",
	default: allTokenState,
});

const allCoinsAtom = atom({
	key: "allCoins",
	default: allCoinsState,
});

const allTokenNumsState = selector({
	key: "allTokenNumsState",
	get: ({ get }) => {
		const count = get(allTokenSets).length;
		return count;
	},
});

const currentPageTokensState = selectorFamily({
	key: "currentPageTokensState",
	get:
		(page = 1) =>
		({ get }) => {
			const currentPageTokens = get(allTokenSets).slice(
				(page - 1) * 5,
				page * 5
			);

			return currentPageTokens;
		},
});

const currentCoinState = selectorFamily({
	key: "currentCoinState",
	get:
		(coinAddress) =>
		({ get }) => {
			const coin = get(allCoinsAtom).filter((coin) => {
				if (coin.address == coinAddress) {
					return true;
				}
			});
			return coin[0];
		},
});

const tokenInfoState = selectorFamily({
	key: "tokenInfoState",
	get:
		(inputAddress) =>
		({ get }) => {
			const allTokens = JSON.parse(JSON.stringify(get(allTokenSets)));
			return allTokens
				.map((token) => {
					const { address } = token;
					return {
						...token,
						address: address.toLowerCase(),
					};
				})
				.filter((token) => {
					const { address } = token;
					if (address.toLowerCase() == inputAddress.toLowerCase()) {
						return true;
					}
				});
		},
});

export default {
	currentPageTokensState,
	allTokenNumsState,
	allTokenState,
	allTokenSets,
	allCoinsAtom,
	allCoinsState,
	tokenInfoState,
	currentCoinState,
};
