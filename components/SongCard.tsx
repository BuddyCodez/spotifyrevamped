import { Card, CardFooter, Image, Button, Progress, CardBody, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { HeartIcon } from "./HeartIcon";
import { PauseCircleIcon } from "./PauseCircleIcon";
import { PlayIcon } from "./PlayIcon";
import { NextIcon } from "./NextIcon";
import { PreviousIcon } from "./PreviousIcon";
import { RepeatOneIcon } from "./RepeatOneIcon";
import { ShuffleIcon } from "./ShuffleIcon";
import { useState, useEffect, ChangeEvent, useContext } from "react";
import { useQueue } from "@/utils/Queue";
import { BsFillPlayFill } from "react-icons/bs";
import { BiPause, BiPlay, BiUserCircle, BiVolume, BiVolumeFull } from "react-icons/bi"
import { ThemeSwitch } from "./theme-switch";
import { GrForwardTen } from "react-icons/gr";
import { FaFontAwesome } from "react-icons/fa";
import { useSeekbar } from "@/utils/useSeekbar";
import { PlayerContextType, QueueStore, playerStore, usePlayer } from "@/store/player";
import modalStore from "@/store/modal";
import { SocketContext } from "@/utils/SocketProvider";
import { UserContextType, useUsers } from "@/store/users";
import { RoomContextType, useRoom } from "@/store/room";
export default function SongPlayer() {
    const [VolumeSlider, SetVolumeSlider] = useState(false);
    // const { currentSong, playNextSong, playPreviousSong, player, playing, pause, PlayCurrent, queue, users, socket, seekTo, currentTime, playerState } = useQueue();
    const Player: any = playerStore();
    const Queue: any = QueueStore();
    const Modal: any = modalStore();
    const [volume, setVolume] = useState(Player?.playing ? Player?.value?.getVolume() : 100 || 100);

    const [progress, setProgress] = useState(0);
    const { dragging, SetDragging, value, setValue, next } = usePlayer() as PlayerContextType;
    const socket = useContext(SocketContext);
    const { users,
        addKnownUser,
        addAknownUser } = useUsers() as UserContextType;
    const { room, setUsers, users: RoomUsers} = useRoom() as RoomContextType;
    useEffect(() => {
        if (value) {
            setProgress(value);
        }
    }, [value]);
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
    const playPreviousSong = () => {

    }
    const changePlayState = (state: string) => {
        if (state == "play" && !Player.playing) {
            Player.playing = true;
            Player.play();
        } else {
            Player.playing = false;
            Player.value.pauseVideo();
        }
    }
    const NextSong = () => {
        if (room) {
            socket.emit("queueAction", {
                code: room,
                action: "nextSong"
            })
        } else {
            next();
        }
    }
    const getTime = () => {
        const seconds = Math.floor(Player.value.getCurrentTime());
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
        let time = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        time = time.includes("NaN") ? "00:00" : time;
        return time;
    }
    const getTimeAndDuration = () => {
        const currentTime = Player.value.getCurrentTime();
        const duration = Player.value.getDuration();
        return { currentTime, duration };
    };
    return (
        <>

            {Queue?.currentSong ? <Card
                isBlurred
                // className=" bg-white/5 dark:bg-yellow-100/100 "
                radius="none"
                shadow="2xl"
                style={{
                    position: "fixed",
                    bottom: "0",
                    width: "100%",
                    overflow: "hidden",
                    right: "0",
                    zIndex: 1000,
                    background: "var(--c1)"
                }}
            >
                <div className="sseekbar">
                    <input type="range" value={progress || 0}
                        max={100}
                        style={{
                            width: "100%"
                        }}
                        onMouseDown={() => SetDragging(true)}
                        onMouseUp={() => {
                            setProgress(value);
                            const { duration } = getTimeAndDuration();
                            const seekTime = (value / 100) * duration; // milliseconds
                            // time in percent
                            const time = (seekTime / duration) * 100;
                            Player.value.seekTo(seekTime);
                            room && socket?.emit("seekTo", {
                                code: room,
                                percent: time
                            })
                            SetDragging(false);
                        }}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            SetDragging(true);
                            setValue(parseInt(e.target.value));
                        }}
                        onDrag={() => SetDragging(true)}
                    />
                </div>
                <div className="flex justify-between w-full px-2 pt-2">
                    <div className="flex gap-2">
                        <small>{getTime()}</small>
                    </div>
                    <div className="flex gap-2">
                        <small>{Queue.currentSong.duration}</small>
                    </div>
                </div>
                <CardBody style={{
                    padding: "25px 12px"
                }}>
                    <div className="flex justify-between items-center w-full">
                        <div className="flex image gap-3 items-center" style={{
                            width: "33.34%"
                        }}>
                            <Image src={Queue.currentSong?.thumbnail} width={200} height={200} isBlurred isZoomed
                                radius="md"
                                className=" self-start"
                                style={{
                                    width: "120px"
                                }}
                            />
                            <div className="flex flex-col h-full justify-center" >

                                <span className="fade-text ">{Queue.currentSong?.title}</span>
                                <h5 className="">By {Queue.currentSong?.author}</h5>
                            </div>

                        </div>

                        <div className="flex gap-3  justify-center items-center transition-all"
                            style={{
                                width: "33.34%"
                            }}>
                            <PreviousIcon onClick={playPreviousSong} width={undefined} height={undefined} style={{
                                transform: "scale(1.4)"
                            }} />
                            {Player.playing ? <BiPause
                                onClick={() => changePlayState("pause")} size={25} className="pause bg-white text-black rounded-full p-1" style={{
                                    transform: "scale(1.4)"
                                }} /> : <BiPlay
                                onClick={() => changePlayState("play")} size={25} className="play bg-white text-black rounded-full p-1" style={{
                                    transform: "scale(1.4)"
                                }} />}
                            <NextIcon onClick={NextSong} width={undefined} height={undefined} style={{
                                transform: "scale(1.4)"
                            }} />


                        </div>
                        <div className="flex justify-center" style={{
                            width: "33.34%"
                        }}>
                            <div className="flex gap-2">
                                {/* for volume */}
                                {
                                    VolumeSlider && <div className="slider flex items-center">
                                        <input type="range" value={volume}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                setVolume(parseInt(e.target.value));
                                                Player.value.setVolume(parseInt(e.target.value));
                                            }}
                                        />
                                    </div>
                                }
                                <Button isIconOnly radius="full"
                                    variant="flat"
                                    className="volume"
                                    onPress={() => {
                                        SetVolumeSlider(!VolumeSlider);
                                    }}
                                    endIcon={
                                        <BiVolumeFull />
                                    }
                                >
                                </Button>
                                <Button isIconOnly radius="full"
                                    variant="flat"
                                    onPress={() => {
                                       room && socket.emit("RoomMembers", {
                                           roomCode: room 
                                        },  (data: any) => setUsers(data));
                                        let elemnt = document.querySelector(".users");
                                        if (elemnt) {
                                            elemnt.classList.toggle("hid");
                                        }
                                    }}
                                    endIcon={
                                        <BiUserCircle />
                                    }
                                >
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card> : !Modal.value &&
            <h1>
                Play a Song...
            </h1>
            }
        </>
    );
}

function calculateSeekBarValue(currentTime: number, duration: any) {
    const [minutes, seconds] = duration.split(":");
    const totalDuration = parseInt(minutes) * 60 + parseInt(seconds);

    const seekBarValue = (currentTime / totalDuration) * 100;
    return seekBarValue;
}