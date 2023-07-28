import "@/styles/globals.css";
import "@/styles/index.css";
import "@/styles/slider.css";
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
import { PlayerProvider } from "@/store/player";
import { UserProvider } from "@/store/users";
import { RoomProvider } from "@/store/room";
export default function App({
	Component,
	pageProps: { session, ...pageProps },
}: AppProps) {


	return (
		<SocketProvider>
			<PlayerProvider>
				<SessionProvider session={session}>
					<RoomProvider>

						<UserProvider>
							<QueueProvider>
								<NextUIProvider>
									<NextThemesProvider>
										<Component {...pageProps} />
									</NextThemesProvider>
								</NextUIProvider>
							</QueueProvider>
						</UserProvider>
					</RoomProvider>
				</SessionProvider>
			</PlayerProvider>
		</SocketProvider>
	);
}

export const fonts = {
	sans: fontSans.style.fontFamily,
	mono: fontMono.style.fontFamily,
};
