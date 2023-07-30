import React, { createContext, useContext, useEffect, useState } from 'react';
import { create } from 'zustand'
import { RoomContextType, useRoom } from './room';
import { SocketContext } from '@/utils/SocketProvider';

interface Song {
    title: string;
    artist: string;
    author: string;
    views: number;
    id: string;
    thumbnail: string;
    description: string;
    duration: number;
}
const QueueStore = create((set) => ({
    queue: [],
    currentSong: null,
    add: (item: any) => set((state: any) => {
        state.queue.push(item);
        return { queue: state.queue };
    }),
    remove: (id: string) => set((state: any) => ({ queue: state.queue.filter((item: Song) => item.id !== id) })),
    clear: () => set((state: any) => ({ queue: [] })),
    next: () => set((state: any) => {
        if (state.queue.length > 1) {
            state.queue.shift();
            if (state?.queue[0]) {
                state.currentSong = state.queue[0];
            }
            return { queue: state.queue };
        }
    }),
    current: () => set((state: any) => ({ currentSong: state.queue[0] })),
}))
const playerStore = create((set) => ({
    playing: false,
    value: null,
    autoplay: false,
    playerCurrentTime: 0,
    currentTime: () => set((state: any) => {
        if (state.value) return state.value.getCurrentTime();
    }),
    setCurrentTime: (time: number) => set((state: any) => ({ playerCurrentTime: time })),
    setPlayer: (player: any, current: any) => set((state: any) => {
        if (state.value) return;
        // setTimeout(() => {
        //     console.log(player);
        //     player?.stopVideo();
        // }, 2000);
        return { value: player };
    }),
    pause: () => set({ playing: false }),
    onStateChange: (event: any) => {
        // -1 (unstarted)
        // 0 (ended)
        // 1 (playing)
        // 2 (paused)
        // 3 (buffering)
        // 5 (video cued)

        switch (event.data) {
            case 0:
                set({ playing: false });
                break;
            case 1:
                // get players video id

                console.log('started');
                set((state: any) => {
                    state.playing = true;
                    console.log(state.value.getVideoData())
                    if (state.value.getVideoData().video_id == "DArzZ3RvejU") {
                        state.value.stopVideo();
                    }
                    return { playing: true }
                })
                break;
            case 2:
                set({ playing: false });
                break;
            case 3:
                console.log('buffering');
                break;
            default:
                break;
        }
    },
    play: (id: any) => set((state: any) => {

        console.log("Playing", id || state.value.getVideoData());
        state.playing = true;
        return state.value.playVideo();
    }),
    stop: () => set((state: any) => {
        return state.value.stopVideo();
    })
}));
interface PlayerContextType {
    getCurrentTime: () => any;
    Player: any;
    next: () => void;
    current: () => any;
    setcurrent: (song: any) => void;
    value: number;
    setValue: (value: number) => void;
    dragging: boolean;
    SetDragging: (value: boolean) => void;
}
const PlayerContext = createContext<PlayerContextType | null>(null);
const usePlayer = () => useContext(PlayerContext);
const PlayerProvider = ({ children }: any) => {

    const [value, setValue] = useState(0);
    const [dragging, SetDragging] = useState(false);
    const Player: any = playerStore();
    const Queue: any = QueueStore();
    useEffect(() => {
        if (Player.value) {
            Player.value.addEventListener("onStateChange", Player.onStateChange);
            Player.value.addEventListener("onStateChange", (event: any) => {
                // if playing
                if (event.data === 1) {
                    Player.playing = true;
                    setInterval(() => {
                        if (dragging) return;
                        const currentPos = Player.value.getCurrentTime();
                        const duration = Player.value.getDuration();
                        const percent = (currentPos / duration) * 100;

                        setValue(percent);
                        Player.setCurrentTime(percent);
                    }, 1000);

                }
                // if ended
                if (event.data === 0) {
                    if (Queue.queue.length == 1 && Queue.queue[0]) {
                        Queue.currentSong = null;
                        Queue.queue = [];
                        Player.value.stopVideo();
                        Player.playing = false;
                        return;
                    }
                    Queue.next();
                    if (Queue?.queue[0]) {
                        const nextSong = Queue?.queue[0];
                        Player.value.loadVideoById({ videoId: nextSong.videoId });
                        console.log("Next Song Played.");
                        return;
                    }
                }
            });
        }
    }, [Player.value]);

    const getCurrentTime = (): any => {
        if (Player.value) {
            return Player.value.getCurrentTime() || 0;
        }
        return -1;
    }
    const setcurrent = (song: any | null): void => {
        if (!song && Queue.queue.length == 0) {
            Queue.currentSong = song;
        } else {
            Queue.currentSong = Queue.queue[0];
        }
    }
    const next = (): any => {
        if (Queue.queue.length == 0) return;
        if (Queue.queue.length == 1) {
            Queue.currentSong = null;
            Queue.queue = [];
            Player.value.stopVideo();
            Player.playing = false;
            return;
        }
        Queue.next();
        setcurrent(null);
        const nextSong = Queue?.queue[0];
        if (!nextSong) return;
        return Player.value.loadVideoById({ videoId: nextSong.videoId });
    }
    const current = (): any => {
        return Queue.currentSong;
    }
    return (
        <PlayerContext.Provider value={{
            getCurrentTime,
            Player,
            next,
            setcurrent,
            current,
            value,
            setValue,
            dragging,
            SetDragging
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

export { QueueStore, playerStore, PlayerProvider, usePlayer };
export type { PlayerContextType };
