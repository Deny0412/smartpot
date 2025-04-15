import React from 'react'
import './Home.sass'
import HomePageFeatures from './components/HomePageFeatures/HomePageFeatures'
import HomePageIntro from './components/HomePageIntro/HomePageIntro'
import TryContainer from './components/TryContainer/TryContainer'

const Home: React.FC = () => {
    return (
        <div className="home-container">
            <HomePageIntro />
            <HomePageFeatures />
            <TryContainer />
        </div>
    )
}

export default Home
