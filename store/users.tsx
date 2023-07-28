import { createContext, useContext, useState } from "react";
import { create } from "zustand";
interface UserType {
    name: string;
    email: string;
    image: string;
    role: string;
}

interface UserContextType {
    users: UserType[];
    addKnownUser: (user: UserType) => void;
    removeKnownUser: (user: UserType) => void;
    addAknownUser: () => void;
};
const UserContext = createContext<UserContextType | null>(null);
const useUsers = () => useContext(UserContext);
const UserProvider = ({ children }: any) => {
    const [users, setUsers] = useState<UserType[]>([]);
    const [counter, setCounter] = useState(1);
    const addKnownUser = (user: UserType) => {
        let isuserFound = users.find((u) => u.email == user.email);
        if (isuserFound) return;
        setUsers([...users, user]);
    }
    const removeKnownUser = (user: UserType) => {
        let isuserFound = users.find((u) => u.email == user.email);
        if (!isuserFound) return;
        setUsers(users.filter((u) => u.email != user.email));
    }
    const addAknownUser = () => {
        const user = {
            name: `Anonymous User ${counter}`,
            email: `Anonymous`,
            image: `https://picsum.photos/200/300?random=${counter}`,
            role: `Listener`,
        }
        setCounter(counter + 1);
        addKnownUser(user);
    }

    return (<>
        <UserContext.Provider value={{
            users,
            addKnownUser,
            removeKnownUser,
            addAknownUser
        }}>
            {children}
        </UserContext.Provider>
    </>
    );
}
export {
    UserContext, UserProvider, useUsers
}
export type {
    UserContextType
};