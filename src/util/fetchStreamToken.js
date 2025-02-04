export const fetchStreamToken = async (userId) => {
  try {
    const response = await fetch("http://localhost:5000/stream/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Error fetching Stream token:", error);
  }
};
