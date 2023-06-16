import playAudio from '@/components/AudioPlayer';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import YouTubePlayer from 'youtube-player';
const QueueContext = createContext();
export const useQueue = () => useContext(QueueContext);

export const QueueProvider = ({ children }) => {
    const [player, setPlayer] = useState(null);
    const [queue, setQueue] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [playing, setPlaying] = useState(false);
    const addToQueue = (song) => {
        const newQueue = [...queue, song];
        console.log('Adding to queue:', song);
        // console.log('New queue:', newQueue);
        setQueue(newQueue);
    };
    useEffect(() => {
        console.log('player', player);
        if (currentSong) {
            player?.playVideo();
        }
      
    }, [player]);
    useEffect(() => {
        if (player) {
            player.on('stateChange', (event) => {
                if (event.data == 0) {
                    playNextSong();
                    console.log('Next song =>', event.data);
                } else {
                    console.log('stateChange', event.data);
                }
            });
        }
    });
    useEffect(() => {
        console.log('Current queue:', queue);
        if (!currentSong) {
            playNextSong();
        }
    }, [queue]);
    const removeFromQueue = () => {
        setQueue(queue.slice(1));
        playNextSong();
    };
    const PlayCurrent = () => {
        setPlaying(true);
        player?.getPlayerState().then((state) => {
            if (state === YT.PlayerState.PAUSED) {
                player?.playVideo();
                console.log('The video is paused.');
            } else {
                console.log('The video is playing or in another state.');
            }
        });
    }
    const playNextSong = () => {
        if (queue.length === 0) {
            setCurrentSong(null);
            return;
        }

        const [nextSong, ...updatedQueue] = queue;
        setQueue(updatedQueue);
        setCurrentSong(nextSong);
    };
    const pause = () => {
        player?.pauseVideo();
        setPlaying(false);
    };
    const playPreviousSong = () => {
        if (queue.length === 0 || !currentSong) {
            return;
        }

        const updatedQueue = [currentSong, ...queue];
        setCurrentSong(updatedQueue.pop());
        setQueue(updatedQueue);
    };

    useEffect(() => {
        if (currentSong) {
            setPlaying(true);
            if(!player)
            setPlayer(YouTubePlayer('player-1', {
                videoId: currentSong.videoId
            }));
            else player?.loadVideoById(currentSong.videoId);
            // playAudio(currentSong.videoId);
        }
    }, [currentSong]);

    return (
        <QueueContext.Provider value={{ queue, currentSong, addToQueue, removeFromQueue, playPreviousSong, playNextSong, playing, pause, PlayCurrent, player }}>
            <div id='player-1' style={{
                width: 0,
                height: 0,
                // display: 'none'
            }}></div>
            {children}
        </QueueContext.Provider>
    );
};
export default QueueProvider;