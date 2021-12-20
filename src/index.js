import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { MoralisProvider } from "react-moralis";
import "./index.css";
import QuickStart from "components/QuickStart";
import { RecoilRoot } from "recoil";
import { Spin } from "antd";
import LoadingSpin from "pages/components/LoadingSpin";

/** Get your free Moralis Account https://moralis.io/ */

const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;

const Application = () => {
	const isServerInfo = APP_ID && SERVER_URL ? true : false;
	//Validate
	if (!APP_ID || !SERVER_URL)
		throw new Error(
			"Missing Moralis Application ID or Server URL. Make sure to set your .env file."
		);
	if (isServerInfo)
		return (
			<MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
				<App isServerInfo />
			</MoralisProvider>
		);
	else {
		return (
			<div style={{ display: "flex", justifyContent: "center" }}>
				<QuickStart />
			</div>
		);
	}
};

ReactDOM.render(
	// <React.StrictMode>
	<RecoilRoot>
		<Suspense fallback={<LoadingSpin />}>
			<Application />
		</Suspense>
	</RecoilRoot>,
	// </React.StrictMode>,
	document.getElementById("root")
);
