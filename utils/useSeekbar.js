import { createContext, useContext, useEffect, useRef, useState } from 'react';
const Seekbar = createContext();
export const useSeekbar = () => useContext(Seekbar);
export const SeekbarProvider = ({ children }) => {
    const [progress, setProgress] = useState(0);
    const [dragging, setDragging] = useState(false);
    const SetProgress = (value) => {
        setProgress(value);
    }
    const SetDragging = (value) => {
        setDragging(value);
    }
    return (
        <Seekbar.Provider value={{ progress, dragging, SetProgress, SetDragging }}>
            {children}
        </Seekbar.Provider>
    )
}
export default SeekbarProvider;