import Cors from 'cors';

// Initializing the CORS middleware
const initMiddleware = (middleware) => (req, res) =>
  new Promise((resolve, reject) => {
    middleware(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

// Helper function to initialize the CORS middleware
export default function initCors() {
  return initMiddleware(Cors());
}
