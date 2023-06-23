import NextLink from "next/link";
import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { button as buttonStyles } from "@nextui-org/theme";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { DiscordIcon, GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";
import { Tabs, Tab, Card, CardBody, Button, Avatar, CardHeader, Divider, AvatarGroup, Image } from "@nextui-org/react";
import { useQueue } from "@/utils/Queue";
import SongPlayer from "@/components/SongCard";
import SongList from "@/components/Song";
import { useSession, signIn, signOut } from "next-auth/react"
import { ThemeSwitch } from "@/components/theme-switch";
// import BiLogOut from "react-icons/bi";
export default function IndexPage() {
	const { queue, users } = useQueue();
	const { data: session } = useSession();
	return (
		<DefaultLayout>
			<section className="flex flex-col" style={{ width: "100%", height: "100vh", }}>
				<div className="sidebar">
					<div className="flex flex-col items-center justify-center gap-3 py-2 px-3">
						<h3 className={title({ color: "blue" })}>Queue:</h3>
						<div className="scrollable flex flex-col gap-3 p-2">
							{queue && queue.map((song: any, index: any) => (
								<div key={index} className="flex rounded-lg items-center gap-2 card cursor-pointer" style={{ width: "100%" }}>
									<Image src={song.thumbnail} width={50} height={50} isZoomed />
									<div className="flex flex-col">
										<h3 className={subtitle()}>{song.title}</h3>
										<p>{song?.by?.name ?"Added By" : "Author"} {song?.by?.name || song?.author}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
				<div className="content">
					<SongList />
					<div className="flex flex-col items-center justify-center gap-3 py-2 px-3">
						<SongPlayer />
					</div>
				</div>
			</section>
		</DefaultLayout>
	);
}
