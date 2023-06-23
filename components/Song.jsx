import { Card, CardBody, Input, Image, CircularProgress } from "@nextui-org/react";
import { useState } from 'react';
import playAudio from './AudioPlayer';
import { useQueue } from "@/utils/Queue";
import { SearchIcon } from "./SearchIcon";
const SongList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
 const { addToQueue } = useQueue();
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
    <div style={{ width: "100%" }}>
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
            "bg-transparent",
            "text-white/90 dark:text-white/90",
            "placeholder:text-default-700/50 dark:placeholder:text-white/60",
          ],
          innerWrapper: "bg-transparent",
          inputWrapper: [
            "shadow-xl",
            "bg-default-200/50",
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
        height: "287px",
        width: "100%"
      }}>
          <CircularProgress />
        </div>
      }
      { searchResults && !loading && <div className="overflow-y-scroll scrollbar" style={{
        height: "350px",
        width: "100%"
      }}>
        <div className="p-3 flex flex-col items-center justify-center">
{searchResults.map((song, index) => (
          <div className="flex mt-2 mb-2 cursor-pointer" key={index} style={{ width: "90%" }}
          onClick={() => {
               addToQueue(song);
            }}
          >
            <div className="card flex items-center gap-4 rounded-lg" style={{width:"100%"}}>
              <Image
                src={song.thumbnail}
                width={100}
                height={100}
                shadow="lg"
                isZoomed
                isBlurred
                alt="Song Thumbnail"
              />
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
