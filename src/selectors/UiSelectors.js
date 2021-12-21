import themeModeValues from "../config/ThemeModes";

const { atom } = require("recoil");

export const themeAtom = atom({
	key: "themeAtom",
	default: themeModeValues.light,
});
