let currentAudioPlayer = null;

const playAudio = (videoId) => {
  // Remove the previously playing audio player, if any
  if (currentAudioPlayer) {
    currentAudioPlayer.parentNode.removeChild(currentAudioPlayer);
    currentAudioPlayer = null;
  }

  // Create a new audio player
  const audioPlayer = document.createElement('iframe');
  audioPlayer.width = '0';
  audioPlayer.height = '0';
  audioPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  audioPlayer.frameBorder = '0';
    audioPlayer.allow = 'autoplay';
    audioPlayer.id = 'player';
  document.body.appendChild(audioPlayer);

  // Set the current audio player
    currentAudioPlayer = audioPlayer;
  
};

export default playAudio;