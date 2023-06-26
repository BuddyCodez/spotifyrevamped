import NextLink from "next/link";
import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { button as buttonStyles } from "@nextui-org/theme";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { DiscordIcon, GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";
import { Button, Image, Popover, PopoverContent, PopoverTrigger, Tooltip } from "@nextui-org/react";
import { useQueue } from "@/utils/Queue";
import SongPlayer from "@/components/SongCard";
import SongList from "@/components/Song";
import { useSession, signIn, signOut } from "next-auth/react"
import { ThemeSwitch } from "@/components/theme-switch";
import { FaPlus } from "react-icons/fa";
// import BiLogOut from "react-icons/bi";
export default function IndexPage() {
	const { queue, users } = useQueue();
	const { data: session } = useSession();
	return (
		<DefaultLayout>
			<section className="flex flex-col" style={{ width: "100%", height: "100vh", }}>
				<div className="sidebar">
					<div className="flex flex-col items-center justify-center gap-3 py-2 px-3">
						<div className="flex justify-between items-center w-full">
							<h3 className={title({ color: "blue" })}>Queue:</h3>
							<Popover placement="right" backdropVariant="opaque"
								triggerType="dialog"
							>
								<PopoverTrigger>
									<Button isIconOnly color="default" className="flex justify-center items-center" variant="light" startIcon={<FaPlus />} />
								</PopoverTrigger>
								<PopoverContent style={{
									height: "500px",
									width: "500px",
								}}>
									<div className="py-2 px-1">
										<SongList />
									</div>

								</PopoverContent>
							</Popover>
						</div>
						<div className="scrollable flex flex-col gap-3 p-2">
							{queue && queue.map((song: any, index: any) => (
								<div key={index} className="flex rounded-lg items-center gap-2 card cursor-pointer " style={{ width: "100%" }}>
									<Image src={song.thumbnail} width={180} isZoomed  radius="md"/>
									<div className="flex flex-col">
										<small>{song.title}</small>
										<small>{song?.by?.name ? "Added by" : "Author"} {song?.by?.name || song?.author}</small>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
				<div className="content">
					{/* <SongList /> */}
					<div className="flex flex-col items-center justify-center gap-3 py-2 px-3">
						<SongPlayer />
					</div>
				</div>
			</section>
		</DefaultLayout>
	);
}
