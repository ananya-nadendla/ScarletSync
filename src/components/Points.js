import React, { useState, useEffect } from "react";
import { db, auth } from "../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "../styles/Points.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faGift } from "@fortawesome/free-solid-svg-icons";

const merchItems = [
  {
    id: 1,
    name: "Rutgers Hoodie",
    image: "https://media.kohlsimg.com/is/image/kohls/5423985?wid=805&hei=805&op_sharpen=1",
    cost: 500,
  },
  {
    id: 2,
    name: "Rutgers Water Bottle",
    image: "https://images.footballfanatics.com/rutgers-scarlet-knights/scarlet-rutgers-scarlet-knights-24oz-stainless-sport-bottle_pi5033000_ff_5033622-ad7567b38df8688538a2_full.jpg?_hv=2&w=900",
    cost: 300,
  },
  {
    id: 3,
    name: "Rutgers Beanie",
    image: "https://images.footballfanatics.com/youth-logofit-red-rutgers-scarlet-knights-youth-north-pole-cuff-beanie_ss10_p-101375886+u-idmcjyrtvpbmcxsqnocn+v-7riftb8a1ryawt8g4mhm.jpg?_hv=2&w=900",
    cost: 200,
  },
  {
    id: 4,
    name: "Scarlet Knights T-Shirt",
    image: "https://images.footballfanatics.com/rutgers-university-champion-short-sleeve-tee-red_ss10_p-101249398+u-nztnrywpletzkb7pb9ng+v-5q8r3kyperyr4q4ws7wr.jpg?_hv=2&w=900",
    cost: 400,
  },
  {
    id: 5,
    name: "Rutgers Baseball Cap",
    image: "https://images.footballfanatics.com/rutgers-scarlet-knights/mens%C2%A0adidas-cream-rutgers-scarlet-knights-on-field-fitted-baseball-hat_ss5_p-201677159+pv-1+u-a8pbebeeltmlntywmlrr+v-vbq9obhvwrgxaufrsqtd.jpg?_hv=2&w=900",
    cost: 250,
  },
  {
    id: 6,
    name: "Rutgers Sweatpants",
    image: "https://images.footballfanatics.com/rutgers-scarlet-knights/rutgers-university-champion-sweatpant-red_ss10_p-101267373+u-jhsyygy0wawez6j0afqi+v-kita8eaqia60ds0p8byl.jpg?_hv=2&w=340",
    cost: 450,
  },
  {
    id: 7,
    name: "Rutgers Tote Bag",
    image: "https://images.footballfanatics.com/rutgers-scarlet-knights-julia-gash-tote-canvas_ss10_p-101259524+u-ghexwds8kdq4qbxmamyo+v-mkoyvqpvsfpye0yekzvd.jpg?_hv=2&w=900",
    cost: 400,
  },
  {
    id: 8,
    name: "Rutgers Gloves",
    image: "https://images.footballfanatics.com/mens-logofit-scarlet-university-district-utext-touch-screen-gloves_ss10_p-101290930+u-9mrna2nnqk4bbzj6j7zg+v-k0ltrp2rkc9hicpfku4e.jpg?_hv=2&w=900",
    cost: 150,
  },
];

const Points = () => {
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchPoints = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "profiles", user.uid));
        if (userDoc.exists()) {
          setUserPoints(userDoc.data().points || 50); //50 is placeholder
        }
      }
      setLoading(false);
    };

    fetchPoints();
  }, [user]);

  const handleRedeem = async (item) => {
    if (userPoints >= item.cost) {
      const newPoints = userPoints - item.cost;
      setUserPoints(newPoints);

      await updateDoc(doc(db, "profiles", user.uid), { points: newPoints });

      alert(`You redeemed a ${item.name}! 🎉`);
    } else {
      alert("Not enough points to redeem this item.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="points-container">
      {/* TOP SECTION */}
        <div className="top-section">
          <h1 className="page-title">
            <FontAwesomeIcon icon={faGift} className="gift-icon" /> Scarlet Sync Rewards
          </h1>
          <p className="page-description">
            Earn points by engaging with the app and redeem them for exclusive Rutgers merch!
          </p>
          <h2 className="points-header">
            <FontAwesomeIcon icon={faStar} className="star-icon" />
            Your Points: <span className="points-number">{userPoints} <FontAwesomeIcon icon={faStar} className="star-icon" /></span>
          </h2>
        </div>

       {/* MERCH SECTION */}
        <div className="merch-section">
          <h2>Rutgers Merch Store</h2>
          <div className="merch-grid">
            {merchItems.map((item) => (
              <div key={item.id} className="merch-card">
                <img src={item.image} alt={item.name} className="merch-image" />
                <h3>{item.name}</h3>
                <p className="merch-cost">
                  <FontAwesomeIcon icon={faStar} className="star-icon" /> {item.cost} Points
                </p>
                <button
                  className="redeem-button"
                  onClick={() => handleRedeem(item)}
                  disabled={userPoints < item.cost}
                >
                  {userPoints >= item.cost ? "Redeem" : "Not Enough Points"}
                </button>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default Points;
