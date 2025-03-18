import React from 'react';
import './Home.sass';
import HomePageIntro from '../../components/homePageComponents/HomePageIntro/HomePageIntro';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <HomePageIntro />
    </div>
  );
};

export default Home;