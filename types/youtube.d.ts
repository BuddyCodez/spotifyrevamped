declare global {
  interface Window {
    YT: any; // Replace 'any' with the actual type of the YT object, if known.
  }
}
declare namespace YT {
  class Player {
    constructor(elementId: string, options: YT.PlayerOptions);
  }

  interface PlayerOptions {
    height: string;
    width: string;
    playerVars?: {
      [key: string]: any;
    };
    // Add other options as needed
  }
}
export {
  YT, PlayerOptions
}