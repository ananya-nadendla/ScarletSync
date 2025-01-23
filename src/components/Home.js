// src/components/Home.js
import React from "react";
import { Link } from "react-router-dom"; // Import Link component from react-router-dom

const Home = () => {
  return (
    <div>
      <h1>Welcome to ScarletSync</h1>
      <p>This is the home page!</p>

      {/* Navigation links to login and sign-up pages */}
      <div>
        <Link to="/login">
          <button>Login</button>
        </Link>
        <Link to="/signup">
          <button>Sign Up</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
