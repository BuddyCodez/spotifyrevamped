
import Cors from 'cors';
import initMiddleware from '../../utils/initMiddleware';
import search from 'yt-search';
const cors = initMiddleware(
    Cors({
        methods: ['GET', 'OPTIONS'],
    })
);



const handler = async (req, res) => {
    await cors(req, res);

    const { query } = req.query; // Get the search query from the request
    try {
        // Search for videos using the yt-search package
        const searchResults = await search(query);

        const videos = await Promise.all(
            searchResults.videos.map(async (video) => {
              
                return {
                    videoId: video.videoId,
                    title: video.title,
                    thumbnail: video.thumbnail,
                    description: video.description,
                    author: video.author.name,
                    duration: video.timestamp,
                    views: video.views,
                    url: video.url,
                };
            })
        );

        // Return the song list with data
        res.status(200).json(videos);
    } catch (error) {
        console.error('Error searching for videos:', error);
        res.status(500).json({ message: 'Error searching for videos' });
    }
};

export default handler;