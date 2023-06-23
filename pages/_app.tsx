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
export default function App({
	Component,
	pageProps: { session, ...pageProps },
}: AppProps) {
	let socket: any;


	return (
		<SocketProvider>
			<SessionProvider session={session}>
				<QueueProvider>
					<NextUIProvider>
						<NextThemesProvider>
							<Component {...pageProps} />
						</NextThemesProvider>
					</NextUIProvider>
				</QueueProvider>
			</SessionProvider>
		</SocketProvider>
	);
}

export const fonts = {
	sans: fontSans.style.fontFamily,
	mono: fontMono.style.fontFamily,
};
