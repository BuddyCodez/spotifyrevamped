import { Card, CardFooter, Image, Button, Progress, CardBody, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { HeartIcon } from "./HeartIcon";
import { PauseCircleIcon } from "./PauseCircleIcon";
import { PlayIcon } from "./PlayIcon";
import { NextIcon } from "./NextIcon";
import { PreviousIcon } from "./PreviousIcon";
import { RepeatOneIcon } from "./RepeatOneIcon";
import { ShuffleIcon } from "./ShuffleIcon";
import { useState, useEffect, ChangeEvent } from "react";
import { useQueue } from "@/utils/Queue";
import { BsFillPlayFill } from "react-icons/bs";
import { BiUserCircle } from "react-icons/bi"
import { ThemeSwitch } from "./theme-switch";
import { GrForwardTen } from "react-icons/gr";
import { FaFontAwesome } from "react-icons/fa";

export default function SongPlayer() {
    const [liked, setLiked] = useState(false);
    const { currentSong, playNextSong, playPreviousSong, player, playing, pause, PlayCurrent, queue, users, socket, seekTo } = useQueue();
    const [timeline, setTimeline] = useState('');
    const [playerState, setPlayerState] = useState('');


    var stateNames = {
        '-1': 'Not Started',
        0: 'Ended',
        1: 'Playing',
        2: 'Paused',
        3: 'Buffering',
        5: 'Song Queued'
    };
    const handleRangeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const range = e.target as HTMLInputElement;
        const value = parseInt(range.value);

        player?.seekTo(value);
    };
    const compareTimes = (time1: string, time2: string): number => {
        const [hours1, minutes1] = time1.split(':').map(Number);
        const [hours2, minutes2] = time2.split(':').map(Number);

        const totalMinutes1 = hours1 * 60 + minutes1;
        const totalMinutes2 = hours2 * 60 + minutes2;

        const timeDifference = Math.abs(totalMinutes1 - totalMinutes2);
        const maxTimeDifference = 3 * 60; // Maximum difference is 3 hours

        const similarityPercentage = Math.max(0, Math.min(100, 100 - (timeDifference / maxTimeDifference) * 100));
        // console.log("similarityPercentage", similarityPercentage);
        return similarityPercentage;
    };
    useEffect(() => {
        const getTime = async () => {
            if (player) {
                const currentTime = Math.floor(await player?.getCurrentTime());
                const minutes = Math.floor(currentTime / 60);
                const seconds = currentTime % 60;
                const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                // console.log("formattedTime", formattedTime);
                setTimeline(formattedTime);
                return formattedTime;

            }
        }

        player?.on('stateChange', function (event: any) {
            let id;
            //map player state with player name
            const objectKeys = Object.keys(stateNames);
            const objectValues = Object.values(stateNames);
            const state = objectValues[objectKeys.indexOf(String(event.data))];
            setPlayerState(state);
            if (event.data === 1) {
                id = setInterval(() => {
                    getTime();
                }, 1000)
            }
            if (event.data === 0 || event.data === 2) {
                clearInterval(id);
            }
        });
    }, [player])


    return (
        <>

            {currentSong ? <Card
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
                <Progress
                    aria-label="Music progress"
                    size="sm"
                    radius="sm"
                    value={player ? compareTimes(timeline, currentSong?.duration) : 0}
                    style={{
                        width: "100%",
                    }}
                    classNames={{
                        track: "drop-shadow-md border border-default",
                        indicator: "bg-gradient-to-r from-blue-500 to-cyan-700",
                        label: "tracking-wider font-medium text-default-600",
                        value: "text-foreground/60",
                    }}
                />
                {/* <input type="range" className="slider transition-all" min={0} onChange={handleRangeChange}  style={{ width: "100%" }} /> */}
                <div className="flex justify-between w-full px-2 pt-2">
                    <div className="flex gap-2">
                        <small>{timeline ? timeline : playerState || "Loading..."}</small>
                    </div>
                    <div className="flex gap-2">
                        <small>{player ? currentSong?.duration : playerState || "Loading..."}</small>
                    </div>
                </div>
                <CardBody style={{
                    padding: "25px 12px"
                }}>
                    <div className="flex justify-between items-center gap-3 w-full flex-wrap">
                        <div className="flex image gap-3 items-center" style={{
                            // flex: 1
                        }}>
                            <Image src={currentSong?.thumbnail} width={100} height={100} isBlurred isZoomed
                                radius="md"
                                className=" self-start"
                            />
                            <div className="flex flex-col h-full justify-center" >

                                <small className="">Now Playing: {currentSong?.title}</small>
                                <h5 className="">By {currentSong?.author}</h5>
                            </div>

                        </div>

                        <div className="flex gap-2  justify-start items-center" >
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" color="white"
                                onClick={async() => {
                                    const value = await player?.getCurrentTime();
                                    const newValue = value - 10;
                                    seekTo(newValue);
                            }}
                            ><path fill="currentColor" d="M48.5 224H40c-13.3 0-24-10.7-24-24V72c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2L98.6 96.6c87.6-86.5 228.7-86.2 315.8 1c87.5 87.5 87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3c-62.2-62.2-162.7-62.5-225.3-1L185 183c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8H48.5z" /></svg>
                            <PreviousIcon onClick={playPreviousSong} width={undefined} height={undefined} />
                            {playing ? <PauseCircleIcon onClick={pause} width={undefined} height={undefined} /> : <PlayIcon onClick={PlayCurrent} size={25} className="bg-white text-black rounded-full p-1" width={undefined} height={undefined} />}
                            <NextIcon onClick={playNextSong} width={undefined} height={undefined} />
                            
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" color="white"
                                onClick={async () => {
                                    const value = await player?.getCurrentTime();
                                    const newValue = value + 10;
                                    seekTo(newValue);
                                }}
                            ><path fill="currentColor" d="M386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H464c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z" /></svg>
                         
                        </div>
                        <div className="flex pr-6">
                            <Dropdown

                            >
                                <DropdownTrigger
                                >
                                    <Button

                                        isIconOnly
                                        startIcon={
                                            <BiUserCircle size={20} />
                                        }
                                        color="primary"
                                        variant="light"
                                    />
                                </DropdownTrigger>
                                <DropdownMenu
                                    variant="shadow"
                                    aria-label="Users"
                                    color="primary"
                                    style={{
                                        background: "red",
                                        color: "var( --c4)"
                                    }}
                                >
                                    {users ? users.map((user: any, index: number) => {
                                        return <DropdownItem key={index} style={{
                                            background: "red",
                                            color: "var( --c4)"
                                        }}>
                                            <h3 style={{ color: "black" }}>{user?.name}</h3>
                                        </DropdownItem>

                                    }) : <h1>No Users</h1>
                                    }
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    </div>
                </CardBody>
            </Card> : <h1>
                Play a Song...
            </h1>}
        </>
    );
}
const Icon = ({ childern, ...props }: any) => {
    return <>
        {childern}
    </>
};