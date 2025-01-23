import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firebase"; // Import Firestore and Auth
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore"; // Firestore functions
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [nickname, setNickname] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [major, setMajor] = useState("");
  const [minor, setMinor] = useState("");
  const [campusLocation, setCampusLocation] = useState("");
  const [interests, setInterests] = useState([]); // State for top-level interests
  const [subInterests, setSubInterests] = useState([]); // State for sub-interests based on selected interest
  const [selectedInterest, setSelectedInterest] = useState("");
  const [selectedSubInterest, setSelectedSubInterest] = useState("");
  const [majors, setMajors] = useState([]);
  const [minors, setMinors] = useState([]);
  const [campusLocations, setCampusLocations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState({
    nickname: false,
    username: false,
    bio: false,
    schoolYear: false,
    major: false,
    minor: false,
    campusLocation: false,
    interest: false,
  });
  const navigate = useNavigate();

  const user = auth.currentUser;

  // Fetch majors, minors, campus locations, and interests from Firestore
  useEffect(() => {
    const fetchMajorsMinorsCampusLocations = async () => {
      try {
        // Fetch majors
        const majorsSnapshot = await getDocs(collection(db, "majors"));
        const majorsList = majorsSnapshot.docs.map((doc) => doc.data().name);
        setMajors(majorsList);

        // Fetch minors
        const minorsSnapshot = await getDocs(collection(db, "minors"));
        const minorsList = minorsSnapshot.docs.map((doc) => doc.data().name);
        setMinors(minorsList);

        // Fetch campus locations
        const campusSnapshot = await getDocs(collection(db, "campus_location"));
        const campusList = campusSnapshot.docs.map((doc) => doc.data().name);
        setCampusLocations(campusList);

        // Fetch top-level interests
        const interestsSnapshot = await getDocs(collection(db, "interests"));
        const interestsList = interestsSnapshot.docs.map((doc) => ({
                  id: doc.id,
                  name: doc.data().name,
        }));
        setInterests(interestsList);
      } catch (err) {
        setError("Error fetching data.");
      }
    };

    const fetchProfile = async () => {
      if (user) {
        try {
          const userProfileDoc = await getDoc(doc(db, "profiles", user.uid));
          if (userProfileDoc.exists()) {
            const data = userProfileDoc.data();
            setNickname(data.nickname || "");
            setUsername(data.username || "");
            setBio(data.bio || "");
            setSchoolYear(data.schoolYear || "");
            setMajor(data.major || "");
            setMinor(data.minor || "");
            setCampusLocation(data.campusLocation || "");
            setSelectedInterest(data.interest || "");
            setSelectedSubInterest(data.subInterest || "");
          }
        } catch (err) {
          setError("Error fetching profile data.");
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login");
      }
    };

    fetchMajorsMinorsCampusLocations();
    fetchProfile();
  }, [user, navigate]);

  // Fetch sub-interests based on selected interest
  useEffect(() => {
    const fetchSubInterests = async () => {
      if (selectedInterest) {
        try {
          const subInterestsSnapshot = await getDocs(
            collection(db, "interests", selectedInterest, "interests")
          );
          const subInterestsList = subInterestsSnapshot.docs.map((doc) =>
            doc.data().name
          );
          setSubInterests(subInterestsList);
        } catch (err) {
          setError("Error fetching sub-interests.");
        }
      } else {
        setSubInterests([]);
      }
    };

    fetchSubInterests();
  }, [selectedInterest]);

  const handleSave = async (field) => {
    if (user) {
      try {
        await setDoc(
          doc(db, "profiles", user.uid),
          {
            nickname,
            username,
            bio,
            schoolYear,
            major,
            minor,
            campusLocation,
            interest: selectedInterest,
            subInterest: selectedSubInterest,
          },
          { merge: true }
        );
        setIsEditing((prevState) => ({ ...prevState, [field]: false }));
        alert("Profile updated!");
      } catch (err) {
        setError("Error saving profile data.");
      }
    }
  };

  const handleEdit = (field) => {
    setIsEditing((prevState) => ({ ...prevState, [field]: true }));
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Nickname */}
      <div>
        <label>Nickname:</label>
        {isEditing.nickname ? (
          <>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
            <button onClick={() => handleSave("nickname")}>Save</button>
          </>
        ) : (
          <>
            <p>{nickname || "No nickname set"}</p>
            <button onClick={() => handleEdit("nickname")}>Edit</button>
          </>
        )}
      </div>

      {/* Username */}
      <div>
        <label>Username:</label>
        {isEditing.username ? (
          <>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <button onClick={() => handleSave("username")}>Save</button>
          </>
        ) : (
          <>
            <p>{username || "No username set"}</p>
            <button onClick={() => handleEdit("username")}>Edit</button>
          </>
        )}
      </div>

      {/* Bio */}
      <div>
        <label>Bio:</label>
        {isEditing.bio ? (
          <>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="4"
            />
            <button onClick={() => handleSave("bio")}>Save</button>
          </>
        ) : (
          <>
            <p>{bio || "No bio set"}</p>
            <button onClick={() => handleEdit("bio")}>Edit</button>
          </>
        )}
      </div>

      {/* School Year Dropdown */}
      <div>
        <label>School Year:</label>
        {isEditing.schoolYear ? (
          <>
            <select
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              required
            >
              <option value="">Select School Year</option>
              <option value="Freshman">Freshman</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
              <option value="Graduate">Graduate</option>
            </select>
            <button onClick={() => handleSave("schoolYear")}>Save</button>
          </>
        ) : (
          <>
            <p>{schoolYear || "No school year set"}</p>
            <button onClick={() => handleEdit("schoolYear")}>Edit</button>
          </>
        )}
      </div>

      {/* Major Dropdown */}
      <div>
        <label>Major:</label>
        {isEditing.major ? (
          <>
            <select
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              required
            >
              <option value="">Select Major</option>
              {majors.map((majorOption, index) => (
                <option key={index} value={majorOption}>
                  {majorOption}
                </option>
              ))}
            </select>
            <button onClick={() => handleSave("major")}>Save</button>
          </>
        ) : (
          <>
            <p>{major || "No major set"}</p>
            <button onClick={() => handleEdit("major")}>Edit</button>
          </>
        )}
      </div>

      {/* Minor Dropdown */}
      <div>
        <label>Minor:</label>
        {isEditing.minor ? (
          <>
            <select
              value={minor}
              onChange={(e) => setMinor(e.target.value)}
              required
            >
              <option value="">Select Minor</option>
              {minors.map((minorOption, index) => (
                <option key={index} value={minorOption}>
                  {minorOption}
                </option>
              ))}
            </select>
            <button onClick={() => handleSave("minor")}>Save</button>
          </>
        ) : (
          <>
            <p>{minor || "No minor set"}</p>
            <button onClick={() => handleEdit("minor")}>Edit</button>
          </>
        )}
      </div>

      {/* Campus Location Dropdown */}
      <div>
        <label>Campus Location:</label>
        {isEditing.campusLocation ? (
          <>
            <select
              value={campusLocation}
              onChange={(e) => setCampusLocation(e.target.value)}
              required
            >
              <option value="">Select Campus Location</option>
              {campusLocations.map((location, index) => (
                <option key={index} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <button onClick={() => handleSave("campusLocation")}>Save</button>
          </>
        ) : (
          <>
            <p>{campusLocation || "No campus location set"}</p>
            <button onClick={() => handleEdit("campusLocation")}>Edit</button>
          </>
        )}
      </div>

      {/* Interest Dropdown */}
      <div>
        <label>Interest:</label>
        {isEditing.interest ? (
          <>
            <select
              value={selectedInterest}
              onChange={(e) => setSelectedInterest(e.target.value)}
              required
            >
              <option value="">Select Interest</option>
              {interests.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>

            {subInterests.length > 0 && (
              <>
                <label>Sub-Interest:</label>
                <select
                  value={selectedSubInterest}
                  onChange={(e) => setSelectedSubInterest(e.target.value)}
                  required
                >
                  <option value="">Select Sub-Interest</option>
                  {subInterests.map((sub, index) => (
                    <option key={index} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </>
            )}

            <button onClick={() => handleSave("interest")}>Save</button>
          </>
        ) : (
          <>
            <p>{selectedSubInterest || "No sub-interest set"}</p>
            <button onClick={() => handleEdit("interest")}>Edit</button> {/* Make sure this updates isEditing */}
          </>
        )}
      </div>

    </div>
  );
};

export default ProfilePage;
