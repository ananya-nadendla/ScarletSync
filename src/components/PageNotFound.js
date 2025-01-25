import React from 'react';
import '../styles/PageNotFound.css'; // Import the CSS file for styling

const PageNotFound = () => {
  return (
    <div className="pagenotfound-container">
      <div className="pagenotfound-content">
        <h1 className="pagenotfound-heading">Sorry, this page isn't available.</h1>
        <p className="pagenotfound-message">The link may be invalid, or you need to be signed in to access this page.</p>
        <a href="/" className="pagenotfound-link">Go back to Home</a>
      </div>
    </div>
  );
};

export default PageNotFound;
