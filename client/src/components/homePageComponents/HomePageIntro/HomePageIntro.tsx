import React, { useState, useEffect } from "react";
import "./HomePageIntro.sass";


import flower1 from "../../../assets/flower_profiles_avatatars/flower1.png";
import flower2 from "../../../assets/flower_profiles_avatatars/flower2.png";
import flower3 from "../../../assets/flower_profiles_avatatars/flower3.png";
import flower4 from "../../../assets/flower_profiles_avatatars/flower4.png";
import flower5 from "../../../assets/flower_profiles_avatatars/flower5.png";
import flower6 from "../../../assets/flower_profiles_avatatars/flower6.png";

const HomePageIntro: React.FC = () => {
  const [currentFlower, setCurrentFlower] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const flowers = [flower1, flower2, flower3, flower4, flower5, flower6];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentFlower((prev) => (prev + 1) % flowers.length);
        setIsVisible(true);
      }, 500);
    }, 15000);

    return () => clearInterval(intervalId);
  }, [flowers.length]);

  return (
    <div className="smart-planter">
      <div className="content-container">
        <div className={`flower-container ${isVisible ? "visible" : "hidden"}`}>
          <div className="flower-wrapper">
            <img
              src={flowers[currentFlower]}
              alt="Smart Planter Flower"
              className="flower-image"
            />
          </div>
        </div>

        <div className="text-container">
          <h1 className="title">Smart planter</h1>
          <p className="description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <button className="create-button">Create Household</button>
        </div>
      </div>
    </div>
  );
};

export default HomePageIntro;
