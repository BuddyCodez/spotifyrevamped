import { Card, CardFooter, Image, Button, Progress, CardBody } from "@nextui-org/react";
import { HeartIcon } from "./HeartIcon";
import { PauseCircleIcon } from "./PauseCircleIcon";
import { NextIcon } from "./NextIcon";
import { PreviousIcon } from "./PreviousIcon";
import { RepeatOneIcon } from "./RepeatOneIcon";
import { ShuffleIcon } from "./ShuffleIcon";
import { useState, useEffect } from "react";
import { useQueue } from "@/utils/Queue";
import { BsFillPlayFill } from "react-icons/bs";
export default function SongPlayer() {
    const [liked, setLiked] = useState(false);
    const { currentSong, playNextSong, playPreviousSong, player, playing, pause, PlayCurrent, queue } = useQueue();
    const [timeline, setTimeline] = useState('');

    var stateNames = {
        '-1': 'unstarted',
        0: 'ended',
        1: 'playing',
        2: 'paused',
        3: 'buffering',
        5: 'video cued'
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
                className=" bg-white/5 dark:bg-yellow-100/100 max-w-[610px]"
                radius="xl"
                shadow="2xl"
                style={{
                    width: "100%",
                    // height: "200px",
                    overflow: "hidden"
                }}
            >
                <CardBody style={{
                    padding: "20px 20px 5px 5px"
                }}>
                    <div className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 items-center justify-center">
                        <div className="relative col-span-6 md:col-span-4">
                            <Image
                                isZoomed
                                isBlurred
                                alt="Album cover"
                                className="object-cover"
                                height={200}
                                shadow="lg"
                                src={currentSong?.thumbnail}
                                width="100%"
                            />
                        </div>

                        <div className="flex flex-col col-span-6 md:col-span-8">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-0">
                                    <h3 className="font-semibold text-foreground/90">{currentSong?.title}</h3>
                                    <p className="text-sm text-foreground/80">{queue.length} in Queue</p>
                                    <h1 className="text-lg font-medium mt-2">{currentSong?.description.length > 20 ? currentSong?.description.slice(0, 30) + ".." : currentSong?.description}</h1>
                                </div>
                                <Button
                                    isIconOnly
                                    className="text-default-900/60 data-[hover]:bg-foreground/10 -translate-y-2 translate-x-2"
                                    radius="full"
                                    variant="light"
                                    onPress={() => setLiked((v) => !v)}
                                >
                                    <HeartIcon
                                        className={liked ? "[&>path]:stroke-transparent" : ""}
                                        fill={liked ? "currentColor" : "none"} width={undefined} height={undefined} />
                                </Button>
                            </div>

                            <div className="flex flex-col mt-3 gap-1">
                                <Progress
                                    aria-label="Music progress"
                                    classNames={{
                                        filler: "bg-blue-500",
                                        track: "bg-default-500/30",
                                    }}
                                    color="default"
                                    size="sm"
                                    value={player ? compareTimes(timeline, currentSong?.duration)  : 0}
                                />
                                <div className="flex justify-between">
                                    <p className="text-sm">{player ? timeline : 0}</p>
                                    <p className="text-sm text-foreground/50">{currentSong?.duration}</p>
                                </div>
                            </div>

                            <div className="flex w-full items-center justify-center">
                                <Button
                                    isIconOnly
                                    className="data-[hover]:bg-foreground/10"
                                    radius="full"
                                    variant="light"
                                >
                                    <RepeatOneIcon className="text-foreground/80" width={undefined} height={undefined} />
                                </Button>
                                <Button
                                    isIconOnly
                                    className="data-[hover]:bg-foreground/10"
                                    radius="full"
                                    variant="light"
                                    onPress={() => {
                                        playPreviousSong();
                                    }}
                                >
                                    <PreviousIcon width={undefined} height={undefined} />
                                </Button>
                                <Button
                                    isIconOnly
                                    className="w-auto h-auto data-[hover]:bg-foreground/10"
                                    radius="full"
                                    variant="light"
                                    onPress={() => {
                                        playing ? pause() : PlayCurrent();
                                    }}
                                >
                                    {playing ? <PauseCircleIcon size={54} width={undefined} height={undefined} /> : <BsFillPlayFill size={40} />}
                                </Button>
                                <Button
                                    isIconOnly
                                    className="data-[hover]:bg-foreground/10"
                                    radius="full"
                                    variant="light"
                                    onPress={() => {
                                        playNextSong();
                                    }}
                                >
                                    <NextIcon width={undefined} height={undefined}

                                    />
                                </Button>
                                <Button
                                    isIconOnly
                                    className="data-[hover]:bg-foreground/10"
                                    radius="full"
                                    variant="light"
                                >
                                    <ShuffleIcon className="text-foreground/80" width={undefined} height={undefined} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card> : <h1>
                Play a Song...
            </h1>}
        </>
    );
}