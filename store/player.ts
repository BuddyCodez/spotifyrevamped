import { createStore } from 'redux';

// Define initial state
const initialState = {
    player: null,
    playing: false,
    currentTime: 0,
};

// Define reducer function
const playerReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case 'SET_PLAYER':
            return {
                ...state,
                player: action.payload,
            };
        case 'SET_PLAYING':
            return {
                ...state,
                playing: action.payload,
            };
        case 'SET_CURRENT_TIME':
            return {
                ...state,
                currentTime: action.payload,
            };
        default:
            return state;
    }
};

// Create store
const store = createStore(playerReducer);

export default store;
export const setPlayer = (player: any) => ({
    type: 'SET_PLAYER',
    payload: player,
});
export const setPlaying = (playing: boolean) => ({
    type: 'SET_PLAYING',
    payload: playing,
});
export const setCurrentTime = (currentTime: Number) => ({
    type: 'SET_CURRENT_TIME',
    payload: currentTime,
});