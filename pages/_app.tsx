import "@/styles/globals.css";
import "@/styles/index.css";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { fontSans, fontMono } from "@/config/fonts";
import type { AppProps } from "next/app";
import { SessionProvider, useSession } from "next-auth/react"
import { QueueProvider } from '../utils/Queue';
import { SeekbarProvider } from '../utils/useSeekbar';
import { SocketProvider } from '../utils/SocketProvider';

import { io } from "socket.io-client";
import { useEffect } from 'react';
import { Provider } from "react-redux";
export default function App({
	Component,
	pageProps: { session, ...pageProps },
}: AppProps) {


	return (
		<SocketProvider>
			<SessionProvider session={session}>
				<SeekbarProvider>
					<QueueProvider>
						<NextUIProvider>
							<NextThemesProvider>
								<Component {...pageProps} />
							</NextThemesProvider>
						</NextUIProvider>
					</QueueProvider>
				</SeekbarProvider>
			</SessionProvider>
		</SocketProvider>
	);
}

export const fonts = {
	sans: fontSans.style.fontFamily,
	mono: fontMono.style.fontFamily,
};
