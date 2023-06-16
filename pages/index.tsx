import NextLink from "next/link";
import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { button as buttonStyles } from "@nextui-org/theme";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { DiscordIcon, GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";
import { Tabs, Tab, Card, CardBody, Button, Avatar, CardHeader, Divider } from "@nextui-org/react";
import { useQueue } from "@/utils/Queue";
import SongPlayer from "@/components/SongCard";
import SongList from "@/components/Song";
import { useSession, signIn, signOut } from "next-auth/react"
import { ThemeSwitch } from "@/components/theme-switch";
// import BiLogOut from "react-icons/bi";
export default function IndexPage() {
	const { queue } = useQueue();
	const { data: session } = useSession()
	return (
		<DefaultLayout>
			<section className="flex flex-col items-center justify-center gap-4 " style={{ width: "100%", height: "100vh" }}>
				<div className="flex justify-between items-center" style={{ width: "100%", height: "100%" }}>
					<Card style={{ width: "100%", height: "450px" }} className="mt-5 mr-2">
						<CardHeader className="p-0 px-5 pt-2 pb-1">
							<div className="flex justify-end items-center w-full">
								<ThemeSwitch />
							</div>
						</CardHeader>
						<Divider />
						<div className="justify-between  p-4" style={{ width: "100%", height: "90%" }}>
							<Tabs variant="light" aria-label="Queue" color="primary">
								<Tab key="Tab1" title="Queue">
									<div className="flex flex-col justify-center gap-3">
										{queue && queue.map((song: any) => (
											<Card
												isBlurred
												className="border-none bg-white/20 dark:bg-default-100/50 max-w-[610px]"
												radius="2xl"
												shadow="lg"
												style={{
													width: "70%",
												}}
											>
												<CardBody>
													<div className="flex flex-col gap-2">
														<h1>{song.title}</h1>
														<p>
															{song.author}
														</p>
													</div>
												</CardBody>
											</Card>
										))}
									</div>
								</Tab>
								<Tab key="Tab2" title="Lyrics">
								</Tab>
							</Tabs>
						</div>
					</Card>
					<Card style={{ width: "100%", height: "450px" }} className="mt-5 ml-2">
						<CardHeader className="p-0 px-5  pt-2 pb-1">
							<div className="flex justify-end items-center w-full">
								<Link isExternal href={siteConfig.links.github}>
									<GithubIcon className="text-default-500" />
								</Link>
							</div>
						</CardHeader>
						<Divider />
						<div className=" justify-between items-center p-4" style={{ width: "100%", height: "90%" }}>
							<Tabs variant="light" aria-label="User" color="primary">
								<Tab key="Tab1" title="Song">
									<SongList />
								</Tab>
								<Tab key="Tab2" title="Chat">
								</Tab>
								<Tab key="Tab3" title="Users">
									{session ? <>
										<div className="flex justify-center items-center gap-2">
											<Avatar src={session?.user?.image || ""} />
											<h1>{session?.user?.name}</h1>
											<Button
												variant="solid"
												color="secondary"
												onPress={() => signOut()}
												size="xs"
											// startIcon={
											// 	<BiLogOut />
											// }
											>
												Logout
											</Button>

										</div>
									</> : <Button
										onPress={() => signIn("discord")}
										variant="solid" color="primary" startIcon={
											<DiscordIcon />
										}>Login</Button>
									}
								</Tab>
							</Tabs>
						</div>
					</Card>

				</div>
				<div className="player flex flex-col items-center justify-center " style={{ width: "100%", height: "100%" }}>
					<SongPlayer />
				</div>
			</section>
		</DefaultLayout>
	);
}
