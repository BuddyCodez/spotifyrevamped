import NextLink from "next/link";
import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { button as buttonStyles } from "@nextui-org/theme";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { DiscordIcon, GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";
import { Button, Divider, Image, Dropdown, DropdownItem, DropdownTrigger, DropdownMenu, Avatar, DropdownSection, User, Input } from "@nextui-org/react";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";

import SongPlayer from "@/components/SongCard";
import SongList from "@/components/Song";
import { useSession, signIn, signOut } from "next-auth/react"
import { ThemeSwitch } from "@/components/theme-switch";
import { FaJoint, FaPlus, FaUser } from "react-icons/fa";
import { PlayerContextType, QueueStore, playerStore, usePlayer } from "@/store/player";
import { useContext, useEffect, useState } from "react";
import modalStore from "@/store/modal";
import { SocketContext } from "@/utils/SocketProvider";
import { UserContextType, useUsers } from "@/store/users";
import { RoomContextType, useRoom } from "@/store/room";
import { GrClose } from "react-icons/gr";
export default function IndexPage() {
	const socket = useContext(SocketContext);
	const Queue: any = QueueStore();
	const [menu, setmenu] = useState(false);
	const Modalstore: any = modalStore();
	const { data: session } = useSession();
	const { Player, setcurrent, value, getCurrentTime } = usePlayer() as PlayerContextType;
	const { room,
		setRoom,
		hasJoinedRoom,
		setHasJoinedRoom,
		host,
		setHost,
		users: RoomUsers,
		setUsers } = useRoom() as RoomContextType;
	const { users,
		addKnownUser,
		addAknownUser } = useUsers() as UserContextType;
	const onYouTubeIframeAPIReady = () => {
		console.log("ready");
		Player.setPlayer(
			new YT.Player("player", {
				height: "600",
				width: "600",
				playerVars: {
					autoplay: 1,
					controls: 0,
					autohide: 1,
					wmode: "opaque",
					origin: window.location.href,
				},
				videoId: "DArzZ3RvejU",
				events: Player.events,
			}), Queue.currentSong || false
		);
	};
	
	const AddUsers = (data: any) => {
		console.log(data);
		if (Array.isArray(data)) {
			data.forEach((user: any) => {
				if (user.type == "known") {
					addKnownUser(user);
				} else {
					addAknownUser();
				}
			});
		}
	}

	useEffect(() => {
		// @ts-ignore
		window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
		const scriptTag = document.createElement("script");
		scriptTag.src = "https://www.youtube.com/iframe_api";
		const firstScriptTag = document.getElementsByTagName("script")[0];
		firstScriptTag.parentNode?.insertBefore(scriptTag, firstScriptTag);

	}, [])
	useEffect(() => {
		if (socket) {
			if (!hasJoinedRoom) {
				socket.on("JoinResponse", (data: any) => {
					if (data?.error) {
						console.log(data.error);
						return;
					}
					console.log("JoinResponse", data);
					const { members, host, code } = data;
					setHasJoinedRoom(true);
					setRoom(code);
					setHost(host);
					setUsers(members);
				})
			}


			// socket.on("Play", (data: any) => {
			// 	Player.play(Queue?.currentSong?.videoId);
			// });
		}
	}, [socket])
	useEffect(() => {
		if (socket && Player.value) {
			socket.on("PlayerState", (data: any) => {
				console.log("Queue", data);
				if (data?.queue) {
					Queue.queue = data.queue;
				}
				if (data?.currentSong && !Queue.currentSong || data?.nextsong) {
					const song = data.currentSong;
					setcurrent(song);
					Player.value.loadVideoById({ videoId: song.videoId });
				}
				let currentTime = data?.currentTime || 0;
				console.log("currPS", currentTime);
				if (currentTime - 5 > getCurrentTime() ||
					currentTime + 5 < getCurrentTime()) {
					Player.value.seekTo(currentTime);
					room && socket.emit("seekTo", {
						code: room,
						percent: value || 0,
					})
				}
				// data?.playing ? Player.play() : Player.pause();
			});
		}
	}, [socket, Player.value])


	// useEffect(() => {
	// 	if (Queue && !Queue.currentSong && Queue.queue.length > 0) {
	// 		const song = Queue.queue[0];
	// 		Player.value.loadVideoById({ videoId: song.videoId });
	// 		setcurrent(song);
	// 	}
	// }, [Queue]);
	const createRoom = () => {
		if (room) return;
		if (socket) {
			socket.emit("generateRoomCode", { user: session?.user }, (data: any) => {
				socket.emit('joinRoom', { roomCode: data, user: session?.user, host: session?.user?.name });
			});
		}
		return true;
	}
	const JoinRoom = () => {
		const elm = document.getElementById("roomCode") as HTMLInputElement;
		if (!elm || !socket) return;
		const roomCode = elm.value;
		if (!roomCode) return;
		socket.emit('joinRoom', { roomCode, user: session?.user });
	}
	const LoginBtn = () => {
		return (<>
			<Button color="default" variant="shadow"
				onPress={() => {
					signIn("discord")
				}}
				startIcon={
					<DiscordIcon color="#5865F2" />
				}
				style={{
					fontFamily: 'Josefin Sans',
					fontWeight: 500,
					letterSpacing: "0.05em",
				}}
			>
				Login
			</Button>
		</>)
	}
	const UserView = ({ session }: any) => {
		return (<>
			<Avatar
				isBordered
				color="primary"
				as="button"
				className="transition-transform"
				src={session.user.image}
				onClick={() => setmenu(!menu)}
			/>
			{menu && <div className="flex flex-col mydropdown gap-1 bg-black rounded-lg">
				<div className="my-2">
					<User
						name={session.user.name}
						description={session.user.email}
						classNames={{
							name: "text-default-600",
							description: "text-default-500",
						}}
						avatarProps={{
							size: "sm",
							src: session.user.image,
						}}
					/>
				</div>
				<Divider />
				<Button color="default" variant="shadow"

					onPress={() => {
						signIn("discord")
					}}
					startIcon={
						<DiscordIcon color="black" />
					}
					style={{
						fontFamily: 'Josefin Sans',
						fontWeight: 500,
						letterSpacing: "0.05em",
						width: "100%",
					}}
				>Change Account</Button>
				<Button color="default" variant="shadow"
					style={{
						width: "100%",
					}}
					onPress={createRoom}>
					Create Room
				</Button>
				<Button color="default" variant="shadow"
					style={{
						width: "100%",
					}}
					onPress={() => {
						const elm = document.getElementById("jtarget");
						elm?.classList.remove("hid");
					}}
				>
					Join Room
				</Button>
				<p className="flex flex-col">
					{room && <span>Room code: {room}</span>}
					{host && <span>host: {host}</span>}
				</p>
			</div>}

			<div className="hid JoinContainer p-3" id="jtarget">
				<div className="flex flex-col items-center gap-3 w-full h-full">
					<div className="flex w-full justify-end">
						<Button isIconOnly endIcon={<GrClose color="white" />}
							radius="full"
							color="primary"
							onPress={() => {
								const elm = document.getElementById("jtarget");
								elm?.classList?.add("hid");
							}}
						/>
					</div>
					<div className="flex flex-col h-full w-full gap-5 justify-center items-center">
						<h1 className="text-xl">Enter Room code:</h1>

						<Input type="tel" inputMode="numeric"
							color="primary"
							isClearable
							variant="faded"
							label="Room Code"
							required
							id="roomCode"
						/>
						<Button
							type="submit"
							variant="bordered"
							color="primary"
							startIcon={
								<FaUser />
							}
							onPress={JoinRoom}
						>
							Join Room
						</Button>
					</div>
				</div>
			</div>
		</>)


	}
	return (
		<DefaultLayout>
			<div className="player" id="player" />
			{/* <script src="https://www.youtube.com/iframe_api" /> */}
			<section className="flex flex-col" style={{ width: "100%", height: "100vh", }}>
				<div className="sidebar">
					<div className="flex flex-col items-center justify-center gap-3 py-2 px-3">
						<div className="flex justify-between items-center w-full">
							<h3 className={title({ color: "blue" })}>Queue:</h3>
							<div className="btn">

								<button onClick={() => {
									Modalstore.value ? Modalstore.close() : Modalstore.open();
									setTimeout(() => {
										document.getElementById("myel")?.classList.toggle("animate");
									}, 100);
								}}>
									<FaPlus
										style={{
											transition: " transform 0.5s ease-in-out",
											transform: Modalstore.value ? "rotate(225deg)" : "rotate(0deg)",
										}}
									/>
								</button>
							</div>

						</div>
						<Divider style={{
							width: "70%",
							margin: "0 auto",
							marginBottom: "10px",
							height: "3px",


						}} />

						<div className="scrollable flex flex-col gap-3 w-full">
							{Queue?.queue?.length > 0 && Queue?.queue?.map((song: any, index: any) => (
								<div key={index} className="flex rounded-lg items-center gap-2 card cursor-pointer " style={{ width: "100%" }}>
									<Image src={song.thumbnail} width={100} height={100} shadow="md" isZoomed radius="md" />
									<div className="flex flex-col">
										<small>{song.title}</small>
										<small>{song?.by?.name ? "Added by" : "Author"} {song?.by?.name || song?.author}</small>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
				<div className="content max-h-screen">
					{
						Modalstore.value && (
							<div className="songPicker animate-me" id="myel">
								<SongList />
							</div>
						)
					}
					<div className="flex flex-col items-center justify-center gap-3 py-2 px-3">
						<div className="users flex flex-col hid">
							{RoomUsers?.map((user: any, index: number) => {
								// console.log("Index User", user);
								return (
									<div key={index} className="flex items-center gap-2">
										<Image src={user?.image} width={50} height={50} shadow="md" isZoomed radius="full" />
										<div className="flex flex-col">
											<small>{user?.name}</small>
											<small>{user?.role}</small>
										</div>
									</div>
								);
							})}
						</div>
						<SongPlayer />
					</div>
				</div>
				<div className="LoginContainer">
					{session ? (
						<div className="flex gap-2">
							<UserView session={session} />
						</div>
					) : (
						<LoginBtn />
					)}
				</div>
			</section>
		</DefaultLayout>
	);
}

