import { Image, Select, Space, Table } from "antd";
import Text from "antd/lib/typography/Text";
import React, { useEffect, useState } from "react";
import { useMoralisWeb3Api } from "react-moralis";
import tokenApis from "services/TokenAPI/TokenApis";
import { getABIByAddress } from "../../services/ABI/ABIServices.js";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useRecoilValue } from "recoil";
import selectors from "../components/selectors/selectors.js";
import { styles } from "./styles/styles.js";
import { NavLink, useHistory } from "react-router-dom";
const { getAllTokenListCoinPrice } = tokenApis;
const { currentPageTokensState, allTokenNumsState, allTokenSets } = selectors;

const HomePage = () => {
	const web3Api = useMoralisWeb3Api();
	const [page, setPage] = useState(1);
	const dataCount = useRecoilValue(allTokenNumsState);
	const currentPageTokens = useRecoilValue(currentPageTokensState(page));
	const allTokens = useRecoilValue(allTokenSets);
	const [currentPageCoinPrice, setCurrentPageCoinPrice] = useState({});
	const [currentPageTokensWithPrice, setCurrentPageToken] =
		useState(currentPageTokens);
	const [tableLoading, setTableLoading] = useState(true);
	const history = useHistory();

	async function getTokenPositions(tokenAddress) {
		const abi = await getABIByAddress(tokenAddress);
		const options = {
			abi,
			address: tokenAddress,
			function_name: "getPositions",
		};
		return web3Api.native.runContractFunction(options);
	}

	async function getTokenPrice(tokenAddress, currency = "usd") {
		let res = 0;
		return getTokenPositions(tokenAddress).then((tokenPostions) => {
			tokenPostions.forEach((tokenPosition) => {
				const address = tokenPosition[0].toLowerCase();
				const amount = Number(Number(tokenPosition[2] / 10 ** 18).toFixed(6));
				res += currentPageCoinPrice[address][currency] * amount;
			});
			return res;
		});
	}

	useEffect(() => {
		(async () => {
			const res = await getAllTokenListCoinPrice(
				currentPageTokens,
				getTokenPositions
			);
			setCurrentPageCoinPrice(res);
		})();
	}, [page]);

	useEffect(() => {
		setTableLoading(true);
		const tokenArray = [...currentPageTokens];
		if (tokenArray.length) {
			let tmp = JSON.parse(JSON.stringify(tokenArray));
			let promises = [];
			for (let index = 0; index < tokenArray.length; index++) {
				const { address } = tokenArray[index];
				if (currentPageCoinPrice && Object.keys(currentPageCoinPrice).length) {
					const promise = getTokenPrice(address).then((price) => {
						tmp[index] = {
							...tokenArray[index],
							price,
						};
						setCurrentPageToken(tmp);
					});
					promises.push(promise);
				}
			}

			Promise.allSettled(promises).then(() => {
				setTableLoading(false);
			});
		}
		return () => {};
	}, [currentPageCoinPrice]);
	const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
	const columns = [
		{
			title: "Symbol",
			render: (text, record) => {
				const { symbol, logoURI } = record;
				return (
					<>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								columnGap: "1.5rem",
							}}
						>
							<Image
								loading="lazy"
								placeholder={
									<Spin
										indicator={antIcon}
										style={{
											display: "flex",
											alignContent: "center",
											justifyContent: "center",
										}}
									/>
								}
								height={30}
								width={30}
								src={logoURI}
								preview={false}
							/>
							<Text strong>{symbol}</Text>
						</div>
					</>
				);
			},
		},
		{
			title: "Name",
			// width: 150,
			render: (text, record) => {
				const { name, address } = record;

				return (
					<>
						<NavLink to={`/setDetailInfo/${address.toLowerCase()}`}>
							{name}
						</NavLink>
					</>
				);
			},
			responsive: ["md"],
		},
		{
			title: "Address",
			render: (text, record) => {
				const { address } = record;
				return (
					<>
						<Text copyable={true}>{address}</Text>
					</>
				);
			},
			responsive: ["lg"],
		},
		{
			title: "price",
			sorter: (a, b) => a.price - b.price,
			render: (text, record) => {
				const { price } = record;
				return <Text strong>{Number(price).toFixed(2)}</Text>;
			},
		},
	];

	const onPageChange = (page, pageSize = 5) => {
		setPage(page);
		setTableLoading(true);
	};

	const { Option } = Select;

	function handleTokenSelect(value, option) {
		const address = option.key;

		history.push(`/setDetailInfo/${address}`);
	}
	return (
		<>
			<div
				style={{
					flexDirection: "row",
				}}
			>
				<div>
					<Select
						style={{
							width: 400,
						}}
						size="large"
						placeholder={`Search by name,symbol or address`}
						showSearch
						onSelect={handleTokenSelect}
						optionFilterProp="children"
						filterOption={(input, option) => {
							if (
								option.value &&
								option.value.toLowerCase().includes(input.toLowerCase())
							) {
								return option;
							}
						}}
					>
						{allTokens.map((token) => {
							const { address, name, symbol } = token;
							return (
								<Option
									key={address.toLowerCase()}
									value={JSON.stringify(token)}
								>
									<div>
										<Text strong>{name}</Text>
										<Text> ({symbol}) </Text>
									</div>
								</Option>
							);
						})}
					</Select>
				</div>

				<Table
					loading={tableLoading}
					columns={columns}
					dataSource={currentPageTokensWithPrice.map((token) => {
						return {
							...token,
							key: token.address,
						};
					})}
					pagination={{
						total: dataCount,
						current: page,
						onChange: onPageChange,
					}}
					// scroll={{ y: 240 }}
					style={styles.tableStyle}
				/>
			</div>
		</>
	);
};

export default HomePage;
