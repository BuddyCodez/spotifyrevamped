import { type } from "os";
import { createContext, useContext, useState } from "react";
interface RoomContextType {
    room: any;
    setRoom: (room: any) => void;
    hasJoinedRoom: boolean;
    setHasJoinedRoom: (hasJoinedRoom: boolean) => void;
    host: string;
    setHost: (host: string) => void;
    users: any[];
    setUsers: (users: any) => void;
};
const RoomContext = createContext<RoomContextType | null>(null);
const useRoom = () => useContext(RoomContext);
const RoomProvider = ({ children }: any) => {
    const [room, setRoom] = useState<any>(null);
    const [hasJoinedRoom, setHasJoinedRoom] = useState<boolean>(false);
    const [host, setHost] = useState<string>("");
    const [users, setUsers] = useState<any>(null);
    return (<>
        <RoomContext.Provider
            value={{
                room,
                setRoom,
                hasJoinedRoom,
                setHasJoinedRoom,
                host,
                setHost,
                users,
                setUsers
            }}
        >
            {children}
        </RoomContext.Provider>
    </>)
}
export {
    RoomContext, RoomProvider, useRoom, 
}
export type {
    RoomContextType
}