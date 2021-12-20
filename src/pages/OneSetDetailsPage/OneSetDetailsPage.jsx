import { Image, Spin } from "antd";
import { useGetTokenPositions } from "../hooks/useGetTokenPositions.js";
import LoadingSpin from "pages/components/LoadingSpin.jsx";

import React, { useEffect, useState } from "react";
import { useRouteMatch } from "react-router-dom";
import { useRecoilValue } from "recoil";

import selectors from "../components/selectors/selectors.js";
import tokenAPI from "../../services/TokenAPI/TokenApis.js";
import { Table } from "antd";
import Text from "antd/lib/typography/Text";
import { styles } from "./styles/styles.js";
import { LoadingOutlined } from "@ant-design/icons";

const { allTokenSets, tokenInfoState, allCoinsAtom } = selectors;

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const OneSetDetailsPage = () => {
	const match = useRouteMatch();
	const { getCoinPrice, getTokenDetailInfo } = tokenAPI;
	let setAddress = "";
	if (match && match.params && match.params.setAddress) {
		setAddress = match.params.setAddress;
	}
	const getTokenPositions = useGetTokenPositions();
	const allTokens = useRecoilValue(allTokenSets);
	const allCoins = useRecoilValue(allCoinsAtom);
	const currentToken = useRecoilValue(tokenInfoState(setAddress));
	const [tokenBasicInfo, setTokenBasicInfo] = useState({
		tokenInfo: {},
		coinInfo: [],
	});
	const [coinPriceInfo, setCoinPriceInfo] = useState({});
	const [tokenDetailInfo, setTokenDetailInfo] = useState({});

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			if (setAddress.length) {
				const tokenPositions = await getTokenPositions(setAddress);
				let coinPricesInfo = {};
				for (let index = 0; index < tokenPositions.length; index++) {
					const address = tokenPositions[index][0];
					const oneCoinInfoArr = allCoins.filter((coin) => {
						return address.toLowerCase() == coin.address.toLowerCase();
					});

					if (Array.isArray(oneCoinInfoArr) && oneCoinInfoArr.length) {
						const address = oneCoinInfoArr[0].address.toLowerCase();
						coinPricesInfo[address] = {
							usd: oneCoinInfoArr[0].price_usd,
							eth: oneCoinInfoArr[0].price_eth,
						};
					}
				}

				setCoinPriceInfo(coinPricesInfo);

				let coinInfoArr = [];
				let tokenValue = 0;
				for (let index = 0; index < tokenPositions.length; index++) {
					const coinAddress = tokenPositions[index][0].toLowerCase();
					const coinQuantity = Number(tokenPositions[index][2]) / 10 ** 18;
					let coinValue;
					if (coinPricesInfo[coinAddress]) {
						coinValue = coinQuantity * coinPricesInfo[coinAddress]["usd"];
					} else {
						throw new Error(`cannot find coin price info : ${coinAddress}`);
					}
					// const coinValue = coinQuantity * coinPricesInfo[coinAddress]["usd"];
					tokenValue += coinValue;

					const coinInfo = allCoins.filter((coin) => {
						if (coin.address.toLowerCase() == coinAddress) {
							return true;
						}
					})[0];
					if (coinInfo) {
						coinInfoArr.push({
							coinAddress,
							coinQuantity,
							coinValue,
							name: coinInfo.name,
							logoUri: coinInfo.image_url,
							symbol: coinInfo.symbol,
							price: {
								usd: Number(coinInfo.price_usd),
								eth: Number(coinInfo.price_eth),
							},
						});
					} else {
						throw new Error(`cannot find coin  info`);
					}
				}

				setTokenBasicInfo({
					coinInfo: [...coinInfoArr],
					tokenInfo: currentToken.length
						? {
								...JSON.parse(JSON.stringify(currentToken[0])),
								tokenPrice: tokenValue,
						  }
						: tokenBasicInfo.tokenInfo,
				});

				getTokenDetailInfo(setAddress)
					.then((tokenDetail) => {
						if (!tokenDetail.error) {
							setTokenDetailInfo(tokenDetail);
						}
					})
					.catch((e) => {
						setTokenDetailInfo({});
					});
			}
		})().then(() => {
			setLoading(false);
		});

		return () => {};
	}, [setAddress, allTokens]);

	const columns = [
		{
			title: "Token Name",
			render: (text, record) => {
				const { logoUri, name } = record;
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
								src={logoUri}
								preview={false}
							/>
							<Text strong>{name}</Text>
						</div>
					</>
				);
			},
		},
		{
			title: "Quantity per set",
			render: (text, record) => {
				const { quantity, symbol } = record;
				if (
					record.children &&
					Array.isArray(record.children) &&
					record.children.length
				) {
					return <></>;
				} else {
					return (
						<>
							<Text strong>{Number(quantity).toFixed(6)}</Text>{" "}
							<Text>{symbol}</Text>
						</>
					);
				}
			},
			responsive: ["sm"],
		},
		{
			title: "Token Price",
			render: (text, record) => {
				const { tokenPrice } = record;
				if (
					record.children &&
					Array.isArray(record.children) &&
					record.children.length
				) {
					return <></>;
				} else {
					return <Text strong>${tokenPrice.usd}</Text>;
				}
			},
			responsive: ["md"],
		},
		{
			title: "Current Price Allocation",
			render: (text, record) => {
				const { currentPricePercent } = record;
				if (
					record.children &&
					Array.isArray(record.children) &&
					record.children.length
				) {
					return <></>;
				} else {
					return (
						<Text strong>
							{(Number(currentPricePercent) * 100).toFixed(2)}%
						</Text>
					);
				}
			},
			responsive: ["md"],
		},
		{
			title: "Total Price (per set)",
			render: (text, record) => {
				const { totalPrice } = record;
				return <Text strong>${Number(totalPrice).toFixed(2)}</Text>;
			},
		},
	];

	const tableData = [
		{
			key: tokenBasicInfo.tokenInfo.address,
			name: tokenBasicInfo.tokenInfo.name,
			quantity: "",
			tokenPrice: "",
			currentPricePercent: "",
			totalPrice: tokenBasicInfo.tokenInfo.tokenPrice,
			logoUri: tokenBasicInfo.tokenInfo.logoURI,
			children: tokenBasicInfo.coinInfo
				.map((oneCoinInfo) => {
					const key = oneCoinInfo.coinAddress;
					const { name, logoUri, symbol } = oneCoinInfo;
					const totalPrice = oneCoinInfo.coinValue;
					const quantity = oneCoinInfo.coinQuantity;
					const currentPricePercent =
						totalPrice / tokenBasicInfo.tokenInfo.tokenPrice;

					const tokenPrice = oneCoinInfo.price;
					return {
						key,
						name,
						logoUri,
						symbol,
						totalPrice,
						quantity,
						currentPricePercent,
						tokenPrice,
					};
				})
				.sort((a, b) =>
					a.currentPricePercent > b.currentPricePercent
						? -1
						: b.currentPricePercent > a.currentPricePercent
						? 1
						: 0
				),
		},
	];

	// rowSelection objects indicates the need for row selection
	const rowSelection = {
		onChange: (selectedRowKeys, selectedRows) => {
			console.log(
				`selectedRowKeys: ${selectedRowKeys}`,
				"selectedRows: ",
				selectedRows
			);
		},
		onSelect: (record, selected, selectedRows) => {
			console.log(record, selected, selectedRows);
		},
		onSelectAll: (selected, selectedRows, changeRows) => {
			console.log(selected, selectedRows, changeRows);
		},
	};

	return (
		<>
			{loading ? (
				<LoadingSpin />
			) : (
				<div>
					<Table
						pagination={false}
						columns={columns}
						// rowSelection={{ ...rowSelection, checkStrictly }}
						dataSource={tableData}
						style={styles.tableStyle}
					/>
				</div>
			)}
		</>
	);
};

export default OneSetDetailsPage;
