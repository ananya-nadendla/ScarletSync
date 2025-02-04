export const STREAM_API_KEY = process.env.REACT_APP_STREAM_API_KEY;

if (!STREAM_API_KEY) {
  console.error("Error: STREAM_API_KEY is missing. Check your .env file.");
}
