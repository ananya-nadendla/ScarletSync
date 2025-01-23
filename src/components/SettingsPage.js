import React, { useState, useEffect } from "react";
import { db, auth } from "../config/firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import '../styles/SettingsPage.css'; // Add your custom CSS file for styling

const SettingsPage = () => {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    bio: "",
    schoolYear: "",
    major: "",
    minor: "",
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
  const [selectedSubInterests, setSelectedSubInterests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        if (user) {
          const userProfileDoc = await getDoc(doc(db, "profiles", user.uid));
          if (userProfileDoc.exists()) {
            const data = userProfileDoc.data();
            setProfileData(data);
            setSelectedSubInterests(data.selectedSubInterests || []);
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

  const handleSave = async () => {
    if (user) {
      try {
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

  const handleCheckboxChange = (subInterest) => {
    setSelectedSubInterests((prev) =>
      prev.includes(subInterest)
        ? prev.filter((item) => item !== subInterest)
        : [...prev, subInterest]
    );
  };

  const togglePopup = () => setIsPopupOpen((prev) => !prev);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="settings-container">
      <h1>Settings</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        <label>Email:</label>
        <p>{user.email}</p> {/* Display email, not editable */}
      </div>

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
      <div>
        <label>Major:</label>
        <select
          value={profileData.major}
          onChange={(e) => setProfileData({ ...profileData, major: e.target.value })}
        >
          <option value="">Select Major</option>
          {options.majors.map((major) => (
            <option key={major} value={major}>
              {major}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Minor:</label>
        <select
          value={profileData.minor}
          onChange={(e) => setProfileData({ ...profileData, minor: e.target.value })}
        >
          <option value="">Select Minor</option>
          {options.minors.map((minor) => (
            <option key={minor} value={minor}>
              {minor}
            </option>
          ))}
        </select>
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
        <button onClick={togglePopup}>Choose Interests</button>
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
        <div className="popup">
          <h2>Choose Your Interests</h2>
          {options.interests.map((interest, index) => (
            <div key={index}>
              <h3>{interest.name}</h3>
              {interest.subInterests.map((subInterest, subIndex) => (
                <div key={subIndex}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedSubInterests.includes(subInterest)}
                      onChange={() => handleCheckboxChange(subInterest)}
                    />
                    {subInterest}
                  </label>
                </div>
              ))}
            </div>
          ))}
          <button onClick={togglePopup}>Close</button>
        </div>
      )}

      <button onClick={handleSave}>Save Changes</button>
    </div>
  );
};

export default SettingsPage;
