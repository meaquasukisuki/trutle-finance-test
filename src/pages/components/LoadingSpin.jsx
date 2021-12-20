import { Spin } from "antd";
import React from "react";

const LoadingSpin = () => {
	return (
		<div
			style={{
				display: "flex",
				placeContent: "center",
				alignItems: "center",
			}}
		>
			<Spin
				size="large"
				style={{
					width: 60,
					height: 60,
				}}
			/>
		</div>
	);
};

export default LoadingSpin;
