import { Card, CardFooter, Image, Button, Progress, CardBody, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { HeartIcon } from "./HeartIcon";
import { PauseCircleIcon } from "./PauseCircleIcon";
import { PlayIcon } from "./PlayIcon";
import { NextIcon } from "./NextIcon";
import { PreviousIcon } from "./PreviousIcon";
import { RepeatOneIcon } from "./RepeatOneIcon";
import { ShuffleIcon } from "./ShuffleIcon";
import { useState, useEffect } from "react";
import { useQueue } from "@/utils/Queue";
import { BsFillPlayFill } from "react-icons/bs";
import { BiUserCircle } from "react-icons/bi"
import { ThemeSwitch } from "./theme-switch";
export default function SongPlayer() {
    const [liked, setLiked] = useState(false);
    const { currentSong, playNextSong, playPreviousSong, player, playing, pause, PlayCurrent, queue, users, socket } = useQueue();
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
                className=" bg-white/5 dark:bg-yellow-100/100 "
                radius="none"
                shadow="2xl"
                style={{
                    position: "fixed",
                    bottom: "0",
                    width: "100%",
                    overflow: "hidden",
                    right: "0",
                    zIndex: 1000
                }}
            >
                <Progress
                    aria-label="Music progress"
                    color="default"
                    size="sm"
                    radius="none"
                    value={player ? compareTimes(timeline, currentSong?.duration) : 0}
                    style={{
                        width: "100%"
                    }}
                />
                <CardBody style={{
                    padding: "25px 12px"
                }}>
                    <div className="flex justify-center items-center gap-3 w-full flex-wrap">
                        <div className="image self-start" style={{
                            flex: 1
                        }}>
                            <Image src={currentSong?.thumbnail} width={200} height={200} isBlurred isZoomed
                                radius="md"
                                className=" self-start"
                            />
                        </div>
                        <div className="flex flex-col h-full justify-center" style={{ width: "30%", flex: 7 }}>

                            <h4 className="text-lg font-bold">Now Playing: {currentSong?.title}</h4>
                            <h5 className="text-lg font-medium">By {currentSong?.author}</h5>
                        </div>
                        <div className="flex gap-2" style={{
                            flex: 9
                        }}>
                            <PreviousIcon onClick={playPreviousSong} width={undefined} height={undefined} />
                            {playing ? <PauseCircleIcon onClick={pause} width={undefined} height={undefined} /> : <PlayIcon onClick={PlayCurrent} size={25} className="bg-white text-black rounded-full p-1" width={undefined} height={undefined} />}
                            <NextIcon onClick={playNextSong} width={undefined} height={undefined} />
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