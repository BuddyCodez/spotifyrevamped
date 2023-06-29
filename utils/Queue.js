import playAudio from '@/components/AudioPlayer';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import YouTubePlayer from 'youtube-player';
const QueueContext = createContext();
import { useSession } from 'next-auth/react';
import { SocketContext } from './SocketProvider';
import { data } from 'autoprefixer';
import { useSeekbar } from './useSeekbar';
export const useQueue = () => useContext(QueueContext);
// const useSocket = useContext(SocketContext);


export const QueueProvider = ({ children }) => {
    const { SetProgress } = useSeekbar();
    const { data: session } = useSession();
    const [player, setPlayer] = useState();
    const [queue, setQueue] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [users, setUsers] = useState('');
    const [playeState, setPlayerState] = useState('');
    const [hasJoined, setHasJoined] = useState(false);
    const [currentTime, setCurrentTime] = useState(null);
    const socket = useContext(SocketContext);
    
    useEffect(() => {
        console.log("Player", player);
    }, [player])

    const addToQueue = (song) => {
        const toadd = {
            ...song, by: session ? session.user : {
                name: "Anonymous"
            }
        }
        socket.emit('addsong', toadd);
    }
    var stateNames = {
        '-1': 'Not Started',
        0: 'Ended',
        1: 'Playing',
        2: 'Paused',
        3: 'Buffering',
        5: 'Song Queued'
    };
    useEffect(() => {
        if (socket && session && !hasJoined) {
            socket.emit('join', session, (data) => {
                console.log('users', data);
                setUsers(data);
            });
            setHasJoined(true);
        }
    }, [socket, session, hasJoined]);
    async function getTime() {
        if (player) {
            let time = await player.getCurrentTime();
            return time;
        }
    }
    useEffect(() => {
        if (socket) {

            socket.on('queue', (data) => {
                setQueue(data);
                // console.log("Queue", data);
                if (data.length <= 1) return;

            })

            socket.on("NewPlayed", (data) => {
                // console.log("New Played", data);
                if (data === null) {
                    setCurrentSong(null);
                    player?.stopVideo();
                    setPlaying(false);
                    return;
                }
                setCurrentSong(data);
            })
            socket.on("getCurrentTime", async (data) => {
                if (currentSong) {
                    var time = await getTime();
                    console.log("Time", time);
                    socket.emit("seek", time);
                }
            })
            socket.on("seekto", (data) => {
                player?.seekTo(data);

            });
            socket.on("pause", (d) => {
                if (currentSong && player) {
                    console.log("Paused playback");
                    player.pauseVideo();
                    setPlaying(false);
                }
            })
        }
    })
    useEffect(() => {
        if (socket) {
            socket.on('play', (data) => {
                console.log("Played..")
                if (currentSong && player) {
                    player.playVideo();
                    setPlaying(true);
                }
            })
            socket.on('setPlaying', (data) => {
                // console.log("Set Playing", data);
                setCurrentSong(data);
            })
            socket.emit("queueAdded", {
                song: queue,
                playing: playing
            });
        }

    }, [queue]);
    useEffect(() => {
        if (player && currentSong) {
            player.loadVideoById({ videoId: currentSong.videoId });
            console.log("Cued Video", currentSong.videoId);

        }
        if (!player && currentSong && !playing) {
            const youtubePlayer = YouTubePlayer('player-1', {
                videoId: currentSong.videoId,
                width: 0,
                height: 0,
                playerVars: {
                    autoplay: 1,
                },
            });
            setPlayer(youtubePlayer);
            setPlaying(true);
        }
    }, [player, currentSong]);

    useEffect(() => {
        if (player && currentSong) {
            console.log("Player state Binded");
            player.on('stateChange', (e) => {
                let id;
                if (e.data == 1) {
                    id = setInterval(async () => {
                        const time = await player.getCurrentTime();
                        const duration = await player.getDuration();
                        setCurrentTime(time);
                        SetProgress((time / duration) * 100);
                    })
                }
                if (e.data == 0) {
                    clearInterval(id);
                    playNextSong();
                }
                const objectKeys = Object.keys(stateNames);
                const objectValues = Object.values(stateNames);
                const state = objectValues[objectKeys.indexOf(String(e.data))];
                setPlayerState(state);
                console.log("State Changed", state);
            })
        }
    }, [player, currentSong])


    const removeFromQueue = () => {

    }
    const playPreviousSong = () => {

    }
    const playNextSong = () => {
        if (player) {
            socket.emit("NextPlay", currentSong);
        }
    }

    const PlayCurrent = () => {
        player && socket?.emit("playSync", currentSong);
    }
    const pause = () => {
        player && socket?.emit("pauseSync", currentSong);
    }
    const seekTo = (time) => {
        player && socket?.emit("seekToSync", time);
    }
    return (
        <QueueContext.Provider value={{ queue, currentSong, addToQueue, removeFromQueue, playPreviousSong, playNextSong, playing, pause, PlayCurrent, player, users, socket, seekTo, currentTime, playeState }}>
            <div id='player-1' style={{

            }}></div>
            {children}
        </QueueContext.Provider>
    );
};
export default QueueProvider;

