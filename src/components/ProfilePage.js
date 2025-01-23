import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firebase"; // Import Firestore and Auth
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore"; // Firestore functions
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    bio: "",
    schoolYear: "",
    major: "",
    minor: "",
    campusLocation: "",
    selectedInterest: "",
    selectedSubInterest: "",
  });

  const [isEditing, setIsEditing] = useState({
    firstName: false,
    lastName: false,
    username: false,
    bio: false,
    schoolYear: false,
    major: false,
    minor: false,
    campusLocation: false,
    interest: false,
  });

  const [options, setOptions] = useState({
    majors: [],
    minors: [],
    campusLocations: [],
    interests: [],
    subInterests: [],
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch majors, minors, campus locations, and interests
        const [majorsSnapshot, minorsSnapshot, campusSnapshot, interestsSnapshot] = await Promise.all([
          getDocs(collection(db, "majors")),
          getDocs(collection(db, "minors")),
          getDocs(collection(db, "campus_location")),
          getDocs(collection(db, "interests"))
        ]);


        setOptions({
          majors: majorsSnapshot.docs.map((doc) => doc.data().name),
          minors: minorsSnapshot.docs.map((doc) => doc.data().name),
          campusLocations: campusSnapshot.docs.map((doc) => doc.data().name),
          interests: interestsSnapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name })),
          subInterests: [],
        });

        // Fetch user profile
        if (user) {
          const userProfileDoc = await getDoc(doc(db, "profiles", user.uid));
          if (userProfileDoc.exists()) {
            setProfileData(userProfileDoc.data());
          }
        } else {
          navigate("/login");
        }
      } catch (err) {
        setError("Error fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  useEffect(() => {
    const fetchSubInterests = async () => {
      if (profileData.selectedInterest) {
        try {
          const subInterestsSnapshot = await getDocs(
            collection(db, "interests", profileData.selectedInterest, "interests")
          );
          setOptions((prev) => ({
            ...prev,
            subInterests: subInterestsSnapshot.docs.map((doc) => doc.data().name),
          }));
        } catch (err) {
          setError("Error fetching sub-interests.");
        }
      } else {
        setOptions((prev) => ({ ...prev, subInterests: [] }));
      }
    };

    fetchSubInterests();
  }, [profileData.selectedInterest]);

  const handleSave = async (field) => {
    if (user) {
      try {
        if (field === "interest") {
          await setDoc(
            doc(db, "profiles", user.uid),
            {
              selectedInterest: profileData.selectedInterest,
              selectedSubInterest: profileData.selectedSubInterest,
            },
            { merge: true }
          );
        } else {
          await setDoc(
            doc(db, "profiles", user.uid),
            { [field]: profileData[field] },
            { merge: true }
          );
        }
        setIsEditing((prev) => ({ ...prev, [field]: false }));
        alert("Profile updated!");
      } catch (err) {
        setError("Error saving profile data.");
      }
    }
  };


  const handleEdit = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
  };

  const renderField = (field, label, type = "text", optionsList = []) => {
    return (
      <div>
        <label>{label}:</label>
        {isEditing[field] ? (
          <>
            {type === "text" && (
              <input
                type="text"
                value={profileData[field]}
                onChange={(e) =>
                  setProfileData((prev) => ({ ...prev, [field]: e.target.value }))
                }
              />
            )}
            {type === "textarea" && (
              <textarea
                value={profileData[field]}
                onChange={(e) =>
                  setProfileData((prev) => ({ ...prev, [field]: e.target.value }))
                }
                rows="4"
              />
            )}
            {type === "select" && (
              <select
                value={profileData[field]}
                onChange={(e) =>
                  setProfileData((prev) => ({ ...prev, [field]: e.target.value }))
                }
              >
                <option value="">Select {label}</option>
                {optionsList.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
            <button onClick={() => handleSave(field)}>Save</button>
          </>
        ) : (
          <>
            <p>{profileData[field] || `No ${label.toLowerCase()} set`}</p>
            <button onClick={() => handleEdit(field)}>Edit</button>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {renderField("firstName", "First Name")}
      {renderField("lastName", "Last Name")}
      {renderField("username", "Username")}
      {renderField("bio", "Bio", "textarea")}
      {renderField("schoolYear", "School Year", "select", [
        "Freshman",
        "Sophomore",
        "Junior",
        "Senior",
        "Graduate",
      ])}
      {renderField("major", "Major", "select", options.majors)}
      {renderField("minor", "Minor", "select", options.minors)}
      {renderField("campusLocation", "Campus Location", "select", options.campusLocations)}

      <div>
        <label>Interest:</label>
        {isEditing.interest ? (
          <>
            <select
              value={profileData.selectedInterest}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, selectedInterest: e.target.value }))
              }
            >
              <option value="">Select Interest</option>
              {options.interests.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>

            {options.subInterests.length > 0 && (
              <>
                <label>Sub-Interest:</label>
                <select
                  value={profileData.selectedSubInterest}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, selectedSubInterest: e.target.value }))
                  }
                >
                  <option value="">Select Sub-Interest</option>
                  {options.subInterests.map((sub, index) => (
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
            <p>{profileData.selectedSubInterest || "No sub-interest set"}</p>
            <button onClick={() => handleEdit("interest")}>Edit</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
