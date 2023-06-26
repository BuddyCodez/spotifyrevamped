import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import io from "socket.io-client";

// Action Types
const SET_YT_PLAYER = "SET_YT_PLAYER";
const SET_PLAYING = "SET_PLAYING";
const SET_SYNC_PLAYING = "SET_SYNC_PLAYING";
const SET_SYNC_SEEK = "SET_SYNC_SEEK";
// ... other action types

// Action Creators
export const setYTPlayer = (player: any) => ({
    type: SET_YT_PLAYER,
    payload: player,
});

export const setPlaying = (playing: any) => ({
    type: SET_PLAYING,
    payload: playing,
});

export const setSyncPlaying = (playing:any) => ({
    type: SET_SYNC_PLAYING,
    payload: playing,
});

export const setSyncSeek = (time: any) => ({
    type: SET_SYNC_SEEK,
    payload: time,
});
// ... other action creators

// Initial State
const initialState = {
    YTplayer: null,
    playing: false,
    syncPlaying: false,
    syncSeek: 0,
    // ... other state properties
};

// Reducer
const playerReducer = (state = initialState, action:any) => {
    switch (action.type) {
        case SET_YT_PLAYER:
            return {
                ...state,
                YTplayer: action.payload,
            };
        case SET_PLAYING:
            return {
                ...state,
                playing: action.payload,
            };
        case SET_SYNC_PLAYING:
            return {
                ...state,
                syncPlaying: action.payload,
            };
        case SET_SYNC_SEEK:
            return {
                ...state,
                syncSeek: action.payload,
            };
        // ... handle other actions
        default:
            return state;
    }
};

// Socket.IO setup
const socket = io("http://localhost:4200"); // Replace with your Socket.IO server URL

// Socket.IO event listeners
export const initializeSocketListeners = (dispatch:any) => {
    socket.on("syncPlaying", (playing) => {
        dispatch(setSyncPlaying(playing));
    });

    socket.on("syncSeek", (time) => {
        dispatch(setSyncSeek(time));
    });

    // ... add other socket events as needed
};

// Store setup
const store = createStore(playerReducer, applyMiddleware(thunk));

export default store;
