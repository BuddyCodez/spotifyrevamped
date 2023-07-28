const client_id = "749949773364068399";
const token = "NzQ5OTQ5NzczMzY0MDY4Mzk5.GqRF6y.e0exFUrZMWsEjUmSc9g5fUPIHrzDDU8eIMGgiA";
import { Client, Intents } from 'discord.js';

const setDiscordRPC = async (user) => {
    try {
        const { name: status, image: largeImage, songTitle, songImage } = user;
        const details = `Listening to ${songTitle}`;
        const largeImageText = 'Listening to:';
        const smallImageURL = songImage; // Use the song thumbnail URL

        // Replace 'YOUR_DISCORD_BOT_TOKEN' with your actual bot token
        const client = new Client({ intents: [Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES] });
        await client.login(token);

        // Set the RPC presence data
        await client.user.setPresence({
            activity: {
                state: details,
                details: status,
                timestamps: { start: Date.now() },
                assets: {
                    largeImage,
                    largeText: largeImageText,
                    smallImageURL, // Use the song thumbnail URL here
                    smallText: songTitle,
                },
            },
        });

        // Close the Discord connection
        await client.destroy();
    } catch (error) {
        console.error('Error setting Discord RPC:', error);
    }
};
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { body } = req;
        if (body) {
            await setDiscordRPC(body);
            return res.status(200).json({ message: 'OK' });
        }
    } 
    return res.status(404).json({ error: 'Not Found' });
}
