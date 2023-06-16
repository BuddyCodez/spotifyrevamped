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
        {searchResults.map((song, index) => (
          <Card
            isBlurred
            className="border-none bg-white/20 dark:bg-default-100/50 max-w-[610px] mt-2 mb-2"
            radius="2xl"
            shadow="lg"
            key={index} 
            isPressable
            isHoverable
            style={{ width: "450px" }}
            onPress={() => {
               addToQueue(song);
            }}
            
          >
            <CardBody>
              <div className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 items-center justify-center">
                <div className="relative col-span-6 md:col-span-4">
                  <Image
                    alt="Album cover"
                    className="object-cover"
                    height={200}
                    shadow="lg"
                    src={song?.thumbnail}
                    width="100%"
                    isZoomed
                    isBlurred
                  />
                </div>
                <div className="flex flex-col col-span-6 md:col-span-8">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-0">
                      <h3 className="font-semibold text-foreground/90">{song?.author}</h3>
                      <h1 className="text-lg font-medium mt-2">{
                        song?.title
                      }</h1>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>}
    </div>
  );
};

export default SongList;
