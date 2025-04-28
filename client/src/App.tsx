import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Footer from './components/Footer/Footer'
import Navigation from './components/Navigation/Navigation'
import HouseholdLayout from './layouts/HouseholdLayout/HouseholdLayout'
import FlowerDetail from './pages/FlowerDetail/FlowerDetail'
import FlowerList from './pages/FlowerList/FlowerList'
import Home from './pages/Home/Home'
import HouseholdsMain from './pages/HouseHold/HouseholdsMain/HouseholdsMain'
import Login from './pages/Login/Login'
import Members from './pages/Members/Members'
import Notifications from './pages/Notifications/Notifications'
import Register from './pages/Register/Register'
import SmartPotDetail from './pages/SmartPotDetail/SmartPotDetail'
import SmartPotList from './pages/SmartPotList/SmartPotList'
import UserProfile from './pages/UserProfile/UserProfile'
import { checkAuthStatus } from './redux/slices/authSlice'
import { AppDispatch } from './redux/store/store'
const App = () => {
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        dispatch(checkAuthStatus())
    }, [dispatch])

    return (
        <Router>
            <Navigation />
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                <Route path="/notifications" element={<Notifications />} />
                <Route path="/userProfile" element={<UserProfile />} />

                <Route path="/households" element={<HouseholdsMain />} />

                <Route path="/households/:householdId" element={<HouseholdLayout />}>
                    <Route path="flowers" element={<FlowerList />} />
                    <Route path="flowers/:flowerId" element={<FlowerDetail />} />

                    <Route path="members" element={<Members />} />

                    <Route path="smartPots" element={<SmartPotList />} />
                    <Route path="smartPots/:smartPotId" element={<SmartPotDetail />} />
                </Route>
            </Routes>
            <Footer />
        </Router>
    )
}

export default App
