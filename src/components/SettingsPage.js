import React, { useState, useEffect } from "react";
import { db, auth } from "../config/firebase";
import { doc, getDoc, setDoc, collection, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import '../styles/SettingsPage.css'; // Add your custom CSS file for styling

const SettingsPage = () => {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    bio: "",
    schoolYear: "",
    major: [],  // Ensure this is an array
    minor: [],  // Ensure this is an array
    campusLocation: "",
    selectedSubInterests: [],
  });

  const [options, setOptions] = useState({
    majors: [],
    minors: [],
    campusLocations: [],
    interests: [],
  });

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [selectedSubInterests, setSelectedSubInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMajor, setSelectedMajor] = useState(""); // Track selected major
  const [selectedMinor, setSelectedMinor] = useState(""); // Track selected minor
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const user = auth.currentUser;
  const [originalUsername, setOriginalUsername] = useState(""); // Store the original username

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        if (user) {
          const userProfileDoc = await getDoc(doc(db, "profiles", user.uid));
          if (userProfileDoc.exists()) {
            const data = userProfileDoc.data();
            setProfileData({
              ...data,
              major: Array.isArray(data.major) ? data.major : [],  // Ensure it's an array
              minor: Array.isArray(data.minor) ? data.minor : [],  // Ensure it's an array
            });
            setSelectedSubInterests(data.selectedSubInterests || []);
            setOriginalUsername(data.username); // Store the original username
          }
        } else {
          navigate("/login");
        }

        // Fetch options for dropdowns and interests
        const [majorsSnapshot, minorsSnapshot, campusSnapshot, interestsSnapshot] = await Promise.all([
          getDocs(collection(db, "majors")),
          getDocs(collection(db, "minors")),
          getDocs(collection(db, "campus_location")),
          getDocs(collection(db, "interests")),
        ]);

        const interests = await Promise.all(
          interestsSnapshot.docs.map(async (doc) => {
            const subInterestsSnapshot = await getDocs(collection(db, "interests", doc.id, "interests"));
            return {
              name: doc.data().name,
              subInterests: subInterestsSnapshot.docs.map((subDoc) => subDoc.data().name),
            };
          })
        );

        setOptions({
          majors: majorsSnapshot.docs.map((doc) => doc.data().name),
          minors: minorsSnapshot.docs.map((doc) => doc.data().name),
          campusLocations: campusSnapshot.docs.map((doc) => doc.data().name),
          interests,
        });
      } catch (err) {
        setError("Error fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

// Regular expression to check if the username contains only allowed characters (letters, numbers, period, underscore)
const isValidUsername = (username) => {
  const allowedChars = /^[a-zA-Z0-9._]+$/; // Only letters, numbers, period (.), and underscore (_)
  return allowedChars.test(username);
};

  const checkUsernameAvailability = async (newUsername) => {
    // Check if the username already exists in the database
    const usersQuery = query(collection(db, "profiles"), where("username", "==", newUsername));
    const querySnapshot = await getDocs(usersQuery);
    return querySnapshot.empty;  // If empty, username is available
  };

  const handleSave = async () => {
    if (user) {
      try {

       // Check if the username contains only valid characters
       if (!isValidUsername(profileData.username)) {
          setError("Username can only contain letters, numbers, periods (.), and underscores (_).");
          return;
       }

        // Only check if the username has changed
        if (profileData.username !== originalUsername) {
          const isUsernameAvailable = await checkUsernameAvailability(profileData.username);
          if (!isUsernameAvailable) {
            setError(`Username "${profileData.username}" is already taken. Please choose another one.`);
            return;
          }
        }

        setError(""); // This will remove the error message set by two conditions above

        // Save the profile data to Firestore
        await setDoc(
          doc(db, "profiles", user.uid),
          {
            ...profileData,
            selectedSubInterests,
          },
          { merge: true }
        );

        alert("Profile updated!");


        // Redirect to the profile page after saving
        navigate("/profile");  // Adjust this path if your profile page route is different
      } catch (err) {
        setError("Error saving profile data.");
      }
    }
  };



  const handleAddMajor = () => {
    if (selectedMajor && !profileData.major.includes(selectedMajor)) {
      setProfileData((prevState) => ({
        ...prevState,
        major: [...prevState.major, selectedMajor],
      }));
      setSelectedMajor(""); // Reset selected major after adding
    }
  };

  const handleRemoveMajor = (majorToRemove) => {
    setProfileData((prevState) => ({
      ...prevState,
      major: prevState.major.filter((major) => major !== majorToRemove),
    }));
  };

  const handleAddMinor = () => {
    if (selectedMinor && !profileData.minor.includes(selectedMinor)) {
      setProfileData((prevState) => ({
        ...prevState,
        minor: [...prevState.minor, selectedMinor],
      }));
      setSelectedMinor(""); // Reset selected minor after adding
    }
  };

  const handleRemoveMinor = (minorToRemove) => {
    setProfileData((prevState) => ({
      ...prevState,
      minor: prevState.minor.filter((minor) => minor !== minorToRemove),
    }));
  };

  const handleChipClick = (subInterest) => {
    setSelectedSubInterests((prev) =>
      prev.includes(subInterest)
        ? prev.filter(item => item !== subInterest)  // Remove if already selected
        : [...prev, subInterest]  // Add if not selected
    );
  };

  const handleDeleteAccount = async () => {

      if (user) {
        try {
          // Delete the user's profile from Firestore
          await deleteDoc(doc(db, "profiles", user.uid));
          // Delete the user's authentication record
          await deleteUser(user);
          alert("Your account has been deleted.");
          // Redirect to the login page
          navigate("/login");
        } catch (err) {
          console.error("Error deleting account: ", err);
          alert("An error occurred while deleting your account.");
        }
      }
    };

const confirmDeleteAccount = async () => {
    setIsDeletePopupOpen(false); // Close the delete popup
    await handleDeleteAccount();
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <div>
        <label>First Name:</label>
        <input
          type="text"
          value={profileData.firstName}
          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
        />
      </div>
      <div>
        <label>Last Name:</label>
        <input
          type="text"
          value={profileData.lastName}
          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
        />
      </div>
      <div>
        <label>Username:</label>
        <input
          type="text"
          value={profileData.username}
          onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
        />
        {error && (
          <div className="error-message">{error}</div>
        )}
      </div>
      <div>
        <label>Bio:</label>
        <textarea
          value={profileData.bio}
          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
        />
      </div>

      <div>
        <label>School Year:</label>
        <select
          value={profileData.schoolYear}
          onChange={(e) => setProfileData({ ...profileData, schoolYear: e.target.value })}
        >
          <option value="">Select School Year</option>
          {["Freshman", "Sophomore", "Junior", "Senior", "Graduate"].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Major Selection */}
      <div>
        <label>Majors:</label>
        <div>
          <select
            value={selectedMajor}
            onChange={(e) => setSelectedMajor(e.target.value)}
          >
            <option value="">Select Major</option>
            {options.majors.map((major, index) => (
              <option key={index} value={major}>
                {major}
              </option>
            ))}
          </select>
          <button onClick={handleAddMajor}>Add Major</button>
          <ul>
            {Array.isArray(profileData.major) && profileData.major.map((major, index) => (
              <li key={index}>
                {major}{" "}
                <button onClick={() => handleRemoveMajor(major)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Minor Selection */}
      <div>
        <label>Minors:</label>
        <div>
          <select
            value={selectedMinor}
            onChange={(e) => setSelectedMinor(e.target.value)}
          >
            <option value="">Select Minor</option>
            {options.minors.map((minor, index) => (
              <option key={index} value={minor}>
                {minor}
              </option>
            ))}
          </select>
          <button onClick={handleAddMinor}>Add Minor</button>
          <ul>
            {Array.isArray(profileData.minor) && profileData.minor.map((minor, index) => (
              <li key={index}>
                {minor}{" "}
                <button onClick={() => handleRemoveMinor(minor)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <label>Campus Location:</label>
        <select
          value={profileData.campusLocation}
          onChange={(e) => setProfileData({ ...profileData, campusLocation: e.target.value })}
        >
          <option value="">Select Campus Location</option>
          {options.campusLocations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Interests:</label>
        <button onClick={() => setIsPopupOpen(true)}>Choose Interests</button>
        {selectedSubInterests.length > 0 ? (
          <ul>
            {selectedSubInterests.map((interest, index) => (
              <li key={index}>{interest}</li>
            ))}
          </ul>
        ) : (
          <p>No interests selected</p>
        )}
      </div>

      {isPopupOpen && (
        <>
          <div className="popup-overlay" onClick={() => setIsPopupOpen(false)}></div>
          <div className="popup">
            <h2>Choose Your Interests</h2>
            <div className="interests-container">
              {options.interests.map((interest, index) => (
                <div key={index} className="interest-group">
                  <h3>{interest.name}</h3>
                  {interest.subInterests.map((subInterest, subIndex) => (
                    <div
                      key={subIndex}
                      className={`interest-chip ${selectedSubInterests.includes(subInterest) ? 'selected' : ''}`}
                      onClick={() => handleChipClick(subInterest)}
                    >
                      {subInterest}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button onClick={() => setIsPopupOpen(false)} className="close-btn">Close</button>
          </div>
        </>
      )}


      <button onClick={handleSave}>Save Changes</button>

     {/* Delete Account Button */}
           <button className="delete-account-btn" onClick={() => setIsDeletePopupOpen(true)}>
             Delete Account
           </button>

           {/* Delete Account Confirmation Popup */}
           {isDeletePopupOpen && (
             <>
               <div className="popup-overlay" onClick={() => setIsDeletePopupOpen(false)}></div>
               <div className="popup">
                 <h2>Are you sure you want to delete your account?</h2>
                 <p>This action cannot be undone.</p>
                 <button onClick={confirmDeleteAccount}>Yes, Delete</button>
                 <button onClick={() => setIsDeletePopupOpen(false)} className="close-btn">Cancel</button>
               </div>
             </>
           )}
    </div>
  );
};

export default SettingsPage;
