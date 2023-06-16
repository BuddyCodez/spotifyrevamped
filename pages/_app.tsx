import "@/styles/globals.css";
import "@/styles/index.css";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { fontSans, fontMono } from "@/config/fonts";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react"
import { QueueProvider } from '../utils/Queue';
import { io } from "socket.io-client";
import { useEffect } from 'react';
export default function App({
	Component,
	pageProps: { session, ...pageProps },
}: AppProps) {
	let socket: any;
	const socketInitializer = async () => {
		await fetch("/api/socket");
		socket = io();
		socket.on('connect', () => {
			console.log('connected');
			socket.emit('listeningSession', session);
		})
	}
	useEffect(() => {
		socketInitializer();
	}, []);
	return (
		<SessionProvider session={session}>
			<QueueProvider socket={socket}>
				<NextUIProvider>
					<NextThemesProvider>
						<Component {...pageProps} />
					</NextThemesProvider>
				</NextUIProvider>
			</QueueProvider>
		</SessionProvider>
	);
}

export const fonts = {
	sans: fontSans.style.fontFamily,
	mono: fontMono.style.fontFamily,
};
