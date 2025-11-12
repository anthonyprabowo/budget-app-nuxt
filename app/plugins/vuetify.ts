import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify, type ThemeDefinition } from "vuetify";
import { VFileUpload } from "vuetify/labs/VFileUpload";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export default defineNuxtPlugin((app) => {
	const customLightTheme: ThemeDefinition = {
		dark: false,
		colors: {
			primary: "#111111",
			secondary: "#ffbd00",
			background: "#d9d9d9",
			card: "#fff",
			authButton: "#201e39",
			profileHeader: "#fff",
			highlighted: "#e9e9e9",
			profile: "#e9e9e9",
			textarea: "#efefef",
			receiptOne: "#e9e9e9",
			receiptTwo: "#fff",
			search: "#fff",
			drawer: "#1B1D21",
			announcement: "#fff7e8",
			sound: "#c4c4c4",
			buttonAlt: "#dcdbdb",
			paymentOdd: "#e9e9e9",
			notification: "#FFF",
			borderPrimary: "#D3D3D3",
			borderSecondary: "#3b3b3b",
			borderTertiary: "#262626",
			backgroundSecondary: "#242424",
			textMuted: "#A3A3A3",
		},
	};
	const customDarkTheme: ThemeDefinition = {
		dark: true,
		colors: {
			primary: "#FFF",
			secondary: "#ffbd00",
			card: "#242424",
			authButton: "#453cbc",
			profileHeader: "#000",
			highlighted: "#474747",
			profile: "#474747",
			button: "#ffbd00",
			textarea: "#efefef",
			receiptOne: "#484747",
			receiptTwo: "#242424",
			search: "#000",
			drawer: "#1E1E1E",
			announcement: "#000",
			sound: "#3e3e3e",
			buttonAlt: "#4f4f4f",
			paymentOdd: "#434343",
			notification: "#555555",
			borderPrimary: "#D3D3D3",
			borderSecondary: "#3b3b3b",
			borderTertiary: "#262626",
			backgroundSecondary: "#242424",
			textMuted: "#A3A3A3",
		},
	};
	const widgetTheme: ThemeDefinition = {
		dark: false,
		colors: {
			primary: "#000",
			secondary: "#ffbd00",
		},
	};
	const vuetify = createVuetify({
		components: {
			...components,
			VFileUpload,
		},
		// ... your configuration
		ssr: true,
		directives,
		theme: {
			defaultTheme: "customDarkTheme",
			themes: {
				customLightTheme,
				customDarkTheme,
				widgetTheme,
			},
		},
	});
	app.vueApp.use(vuetify);
});
