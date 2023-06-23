import playAudio from '@/components/AudioPlayer';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import YouTubePlayer from 'youtube-player';
const QueueContext = createContext();
import { useSession } from 'next-auth/react';
import { SocketContext } from './SocketProvider';
import { data } from 'autoprefixer';
export const useQueue = () => useContext(QueueContext);
// const useSocket = useContext(SocketContext);

export const QueueProvider = ({ children }) => {
    const { data: session } = useSession();
    const [player, setPlayer] = useState();
    const [queue, setQueue] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [users, setUsers] = useState('');
    const [playeState, setPlayerState] = useState('');
    const [hasJoined, setHasJoined] = useState(false);
    const socket = useContext(SocketContext);
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
    useEffect(() => {
        if (socket) {

            socket.on('queue', (data) => {
                setQueue(data);
                // console.log("Queue", data);
                if (data.length <= 1) return;

            })

            socket.on("NewPlayed", (data) => {
                setCurrentSong(data);
            })

        }
    })
    useEffect(() => {
        if (socket) {
            socket.on('play', (data) => {
                console.log("Played..")
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
                width: 640,
                height: 360,
                playerVars: {
                    autoplay: 1,
                },
            });
            setPlayer(youtubePlayer);
            setPlaying(true);
        }
    }, [player, currentSong]);
    // useEffect(() => {
    //     if (!player) {
           
    //     }
    // }, [player]);
    // useEffect(() => {
    //     if (currentSong) {
    //         if (!player) {
    //             setPlayer(YouTubePlayer('player-1', {
    //                 videoId: currentSong.videoId
    //             }))
    //         } else {
    //             player?.loadVideoById({
    //                 videoId: currentSong.videoId
    //             })
    //        }
    //     }
    // }, [currentSong]);

    useEffect(() => {
        if (playeState == 'Not Started') {
            // console.log("state", playeState)
            // player?.playVideo();
            // console.log("Playing...")
        }
    }, [playeState])
    useEffect(() => {
        // player?.on('ready', function (event) {
        //     player?.pauseVideo();
        //     socket.emit("Buffered", true, (res) => {
        //         console.log(res);
        //         if (player?.getPlayerState() !== 1) player?.playVideo();
        //     });
        // });

        player?.on('stateChange', function (event) {
            //map player state with player name
            const objectKeys = Object.keys(stateNames);
            const objectValues = Object.values(stateNames);
            const state = objectValues[objectKeys.indexOf(String(event.data))];
            setPlayerState(state);

        });
    }, [player]);

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

    }
    const pause = () => {

    }

    return (
        <QueueContext.Provider value={{ queue, currentSong, addToQueue, removeFromQueue, playPreviousSong, playNextSong, playing, pause, PlayCurrent, player, users, socket }}>
            <div id='player-1' style={{
                    // width: 0,
                    // height: 0,
                // display: 'none'
            }}></div>
            {children}
        </QueueContext.Provider>
    );
};
export default QueueProvider;