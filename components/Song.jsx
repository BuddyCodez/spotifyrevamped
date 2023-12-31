import { Card, CardBody, Input, Image, CircularProgress } from "@nextui-org/react";
import { useContext, useState } from 'react';
import { useQueue } from "@/utils/Queue";
import { SearchIcon } from "./SearchIcon";
import { QueueStore } from "@/store/player";
import { useRoom } from "@/store/room";
import { SocketContext } from "@/utils/SocketProvider";
const SongList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToQueue } = useQueue();
  const {
    room
  } = useRoom();
  const socket = useContext(SocketContext);
  const Queue = QueueStore();
  const handleSearch = async () => {
    setLoading(true);
    if (!searchQuery || searchQuery == "") {
      setLoading(false);
      return;
   }
    try {
      const response = await fetch(`api/search?query=${searchQuery}`);
      const data = await response.json();
      console.log(data);
      setLoading(false);
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching for songs:', error);
    }
  };


  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };
  return (
    <div  style={{ width: "100%", height: "100%" }}>
        <Input
        label="Search"
        
        isClearable
        onClear={() => {
          setSearchQuery("");
        }}
        radius="xl"
        classNames={{
          label: "text-primary dark:text-white/90",
          input: [
            " bg-gray-700",
            "text-white/90 dark:text-white/90",
            "placeholder:text-default-700/50 dark:placeholder:text-white/60",
          ],
          innerWrapper: "bg-transparent",
          inputWrapper: [
            "shadow-xl",
            "bg-gray-800",
            "dark:bg-default/60",
            "backdrop-blur-xl",
            "backdrop-saturate-200",
            "hover:bg-default-200/70",
            "dark:hover:bg-default/70",
            "group-data-[focused=true]:bg-default-200/50",
            "dark:group-data-[focused=true]:bg-default/60",
            "!cursor-text",
          ],
        }}
        placeholder="Type to Song Name..."
        startContent={
          <SearchIcon className="text-black/50 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
        }
         onChange={handleInputChange}
        value={searchQuery}
              onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                      handleSearch();
                  }
              }}
      />

      {
        loading && <div className="flex justify-center items-center" style={{
        height: "100%",
        width: "100%"
      }}>
          <CircularProgress />
        </div>
      }
      { searchResults && !loading && <div className="overflow-y-scroll scrollbar" style={{
        height: "90%",
        width: "100%"
      }}>
        <div className="p-3 flex flex-col items-center justify-start" style={{
          width: "100%"
        }}>
{searchResults.map((song, index) => (
          <div className="flex mt-2 mb-2 cursor-pointer" key={index}
    onClick={() => {
      if (room && socket) {
        socket.emit('queueAction', {
          code: room,
          song: song,
          action: 'addSong'
        });
      }
          }}
    style={{width: "100%"}}
          >
            <div className="card flex items-center gap-4 rounded-lg"  style={{
      width: "100%",
              background: "#0c131b",
              
        }}>
        <Image src={song?.thumbnail} width={100} height={100} />
      <div className="flex flex-col gap-2 ">
                <h3>{song?.title}</h3>
                <p>{song?.author}</p>
              </div>
            </div>
            </div>
        ))}
        </div>
      </div>}
    </div>
  );
};

export default SongList;
