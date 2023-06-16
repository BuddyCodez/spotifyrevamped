import "@/styles/globals.css";
import "@/styles/index.css";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { fontSans, fontMono } from "@/config/fonts";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react"
import { QueueProvider } from '../utils/Queue';
export default function App({
	Component,
	pageProps: { session, ...pageProps },
}: AppProps) {
	return (
		<QueueProvider>
			<SessionProvider session={session}>
				<NextUIProvider>
					<NextThemesProvider>
						<Component {...pageProps} />
					</NextThemesProvider>
				</NextUIProvider>
			</SessionProvider>
		</QueueProvider>
	);
}

export const fonts = {
	sans: fontSans.style.fontFamily,
	mono: fontMono.style.fontFamily,
};
