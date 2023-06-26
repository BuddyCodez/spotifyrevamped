import "@/styles/globals.css";
import "@/styles/index.css";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { fontSans, fontMono } from "@/config/fonts";
import type { AppProps } from "next/app";
import { SessionProvider, useSession } from "next-auth/react"
import { QueueProvider } from '../utils/Queue';
import { SocketProvider } from '../utils/SocketProvider';

import { io } from "socket.io-client";
import { useEffect } from 'react';
import { store, initializeSocketListeners } from "@/store";
import { Provider } from "react-redux";
export default function App({
	Component,
	pageProps: { session, ...pageProps },
}: AppProps) {
	let socket: any;
	initializeSocketListeners(store.dispatch);

	return (
		<SocketProvider>
			<SessionProvider session={session}>
				<Provider store={store}>
					<QueueProvider>
						<NextUIProvider>
							<NextThemesProvider>
								<Component {...pageProps} />
							</NextThemesProvider>
						</NextUIProvider>
					</QueueProvider>
				</Provider>
			</SessionProvider>
		</SocketProvider>
	);
}

export const fonts = {
	sans: fontSans.style.fontFamily,
	mono: fontMono.style.fontFamily,
};
