import Transfer from "./components/Transfer";
import NativeBalance from "../NativeBalance";
import Address from "../Address/Address";
import Blockie from "../Blockie";
import { Card } from "antd";
import { useMoralis } from "react-moralis";
import { useHistory } from "react-router-dom";

const styles = {
	title: {
		fontSize: "30px",
		fontWeight: "600",
	},
	header: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: "5px",
	},
	card: {
		boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
		border: "1px solid #e7eaf3",
		borderRadius: "1rem",
		width: "450px",
		fontSize: "16px",
		fontWeight: "500",
	},
};

function Wallet() {
	const { isAuthenticated, isWeb3Enabled, is } = useMoralis();
	const history = useHistory();
	if (!isWeb3Enabled) {
		return <Card style={styles.card}>Add metamask extensions first!</Card>;
	}
	if (!isAuthenticated) {
		setTimeout(() => {
			history.push("/nonauthenticated");
		}, 5000);
		return (
			<Card style={styles.card}>
				{"Please Authenticate metamask first! Redirectting in 5 seconds"}
			</Card>
		);
	}
	return (
		<Card
			style={styles.card}
			title={
				<div style={styles.header}>
					<Blockie scale={5} avatar currentWallet style />
					<Address size="6" copyable />
					<NativeBalance />
				</div>
			}
		>
			<Transfer />
		</Card>
	);
}

export default Wallet;
