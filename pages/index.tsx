import { title } from "@/components/primitives";
import { DiscordIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";
import { Button, Image, Divider } from "@nextui-org/react";
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import SongPlayer from "@/components/SongCard";
import SongList from "@/components/Song";
import { useSession, signIn, } from "next-auth/react"
import { PlayerContextType, QueueStore,  usePlayer } from "@/store/player";
import React, { useContext, useEffect, useState } from "react";
import modalStore from "@/store/modal";
import { SocketContext } from "@/utils/SocketProvider";
import { UserContextType, useUsers } from "@/store/users";
import { RoomContextType, useRoom } from "@/store/room";
import { FaCopy, FaPlus, FaUser } from "react-icons/fa";
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { BiGroup } from "react-icons/bi";
import { MdGroupAdd } from "react-icons/md";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
	props,
	ref,
) {
	return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


export default function IndexPage() {
	const socket = useContext(SocketContext);
	const Queue: any = QueueStore();
	const [menu, setmenu] = useState(false);
	const Modalstore: any = modalStore();
	const { data: session } = useSession();
	const { Player, setcurrent, value, getCurrentTime, dragging } = usePlayer() as PlayerContextType;
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
	const [open, setOpen] = useState(false);
	const [Open, SetOpen] = useState(false);
	const [err, seterr] = useState("");
	const handleClick = () => {
		SetOpen(true);
	};

	const HandleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return;
		}

		SetOpen(false);
	};


	useEffect(() => {
		// @ts-ignore
		window.onYouTubeIframeAPIReady = () => {
			console.log("Player Ready!");
			Player.setPlayer(
				new window.YT.Player("player", {
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
					if (host === session?.user?.name) return;
					socket.emit("getPlayer", { code: code });
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
				let roomUsersLength = RoomUsers?.length || 1;
				console.log("currPS", currentTime);
				if ((currentTime - 5 > getCurrentTime() ||
					currentTime + 5 < getCurrentTime()) && currentTime !== 0 ) {
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
	useEffect(() => {
		if (Player.value) {
			Player.value.addEventListener('onStateChange', (event: any) => {
				if (event.data == 1) {
					setInterval(() => {
						if (dragging) return;
						const currentPos = Player.value.getCurrentTime();
						const duration = Player.value.getDuration();
						const percent = (currentPos / duration) * 100;
						// console.log(percent);
						if (room) {
							socket.emit("updateTime", { code: room, time: percent });
							// update time
						}
					}, 1000);
				}
			})
		}
	}, [Player])

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
		handleClose();
		const elm = document.getElementById("RoomCode-required") as HTMLInputElement;
		if (!elm || !socket) return;
		const roomCode = elm.value;
		if (!roomCode) return;
		socket.emit('joinRoom', { roomCode, user: session?.user });
	}
	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};
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
	const StyledBadge = styled(Badge)(({ theme }) => ({
		'& .MuiBadge-badge': {
			backgroundColor: "#00A86B",
			color: "#00A86B",
			boxShadow: `0 0 0 2px ${theme?.palette?.background.paper}`,
			'&::after': {
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				borderRadius: '50%',
				animation: 'ripple 1.2s infinite ease-in-out',
				border: '1px solid currentColor',
				content: '""',
			},
		},
		'@keyframes ripple': {
			'0%': {
				transform: 'scale(.8)',
				opacity: 1,
			},
			'100%': {
				transform: 'scale(2.4)',
				opacity: 0,
			},
		},
	}));
	const copyRoomCode = () => {
		if (room) {
			try {
				navigator.clipboard.writeText(room);
			} catch {
				console.log("Error Copying");
				seterr("Cant copy room code, try again later.");
			}
			handleClick();
		}
	}
	const UserView = ({ session }: any) => {
		return (<>
			<StyledBadge
				overlap="circular"
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				variant="dot"

			>
				<Avatar alt={session?.user?.name} src={session?.user?.image} onClick={() => setmenu(!menu)} />
			</StyledBadge>

			{menu && <div className="flex flex-col mydropdown gap-1 bg-black rounded-lg">
				<List sx={{ width: '100%', maxWidth: 360, bgcolor: 'black' }}>
					<ListItem alignItems="flex-start">
						<ListItemAvatar>
							<Avatar alt={session?.user?.name} src={session?.user?.image} />
						</ListItemAvatar>
						<ListItemText
							primary={session?.user?.name}
							secondary={
								<>
									<Typography
										sx={{ display: 'inline' }}
										component="span"
										variant="body2"
										color="gray"
									>
										{session?.user?.email}
									</Typography>

								</>
							}
						/>
					</ListItem>
					<Divider style={{
						width: "100%",
						margin: "0 auto",
						height: "1px",
						background: "gray"
					}}  />
					<ListItem>
						<ListItemText>
							<Button color="primary" variant="shadow"
								startIcon={<FaUser />}
								fullWidth
								onPress={() => signIn("discord")}
							>
								Change Account
							</Button>
						</ListItemText>
					</ListItem>
					<ListItem>
						<ListItemText>
							<Button color="primary" variant="shadow"
								startIcon={<BiGroup />}
								onPress={createRoom}
								fullWidth
							>
								Create Room
							</Button>
						</ListItemText>
					</ListItem>
					<ListItem>
						<ListItemText>
							<Button color="primary" variant="shadow"
								fullWidth
								startIcon={<MdGroupAdd />}
								onPress={handleClickOpen}
							>
								Join Room
							</Button>
						</ListItemText>
					</ListItem>
					{room && host && <ListItem>
						<ListItemText
							primary={
								<Typography
									sx={{ display: 'inline' }}
									component="span"
									variant="body2"
									color="gray"
								>
									<span className="flex gap-4 justify-center items-center">
										Host: {host}
									</span>
								</Typography>
							}
							secondary={
								<>
									<Typography
										sx={{ display: 'inline' }}
										component="span"
										variant="body2"
										color="gray"
									>
										<span className="flex gap-4 justify-center items-center">
											Room Code: {room}
											<Button startIcon={
												<FaCopy />
											} isIconOnly
												radius="full"
												style={{
													background: "black"
												}}
												onPress={copyRoomCode}
											/>
										</span>
									</Typography>

								</>
							}
						>

						</ListItemText>
					</ListItem>}
				</List>
			</div>}


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
					<Dialog open={open} onClose={handleClose} style={{
						color: "white"
					}}>
						<DialogTitle style={{
							background: "var(--c4)",
							color: "white"

						}}>Join a Room</DialogTitle>
						<DialogContent style={{
							background: "var(--c4)",
							color: "white"

						}}>
							<DialogContentText color="white">
								Enter Room Code to Join your desired room.
							</DialogContentText>
							<TextField
								style={{
									color: "white",

								}}

								autoFocus
								margin="dense"
								id="RoomCode-required"
								label="RoomCode"
								type="text"
								fullWidth
								variant="filled"
							/>
						</DialogContent>
						<DialogActions style={{
							background: "var(--c4)"
						}}>
							<Button onPress={handleClose}>Cancel</Button>
							<Button onPress={JoinRoom}>
								Join
							</Button>
						</DialogActions>
					</Dialog>
					<Snackbar open={Open} autoHideDuration={6000} onClose={HandleClose}>
						<Alert onClose={HandleClose} severity={err ? "error": "success"} sx={{ width: '100%' }}>
							{err ? err : "Room Code Copied to Clipboard"}
						</Alert>
					</Snackbar>
				</div>
			</section>
		</DefaultLayout>
	);
}

