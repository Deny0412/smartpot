import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Footer from './components/Footer/Footer'
import Navigation from './components/Navigation/Navigation'
import AddFlower from './pages/AddFlower/AddFlower'
import EditFlower from './pages/EditFlower/EditFlower'
import FlowerList from './pages/FlowerList/FlowerList'
import FlowerpotDetail from './pages/FlowerpotDetail/FlowerpotDetail'
import Home from './pages/Home/Home'
import HouseholdsMain from './pages/HouseHold/HouseholdsMain/HouseholdsMain'
import ManageHousehold from './pages/HouseHold/ManageHousehold/ManageHousehold'
import ManageMembers from './pages/HouseHold/ManageMembers/ManageMembers'
import Login from './pages/Login/Login'
import Notifications from './pages/Notifications/Notifications'
import Register from './pages/Register/Register'
import CreateHousehold from './pages/HouseHold/CreateHousehold/CreateHousehold'
import { checkAuthStatus } from './redux/slices/authSlice'
import { AppDispatch } from './redux/store/store'
import AddFlowerPot from './pages/AddFlowerPot/AddFlowerPot'
import TransplantFlower from './pages/TransplantFlower/TransplantFlower'

const App = () => {
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        dispatch(checkAuthStatus())
    }, [dispatch])

    return (
        <Router>
            <Navigation />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/households-list" element={<HouseholdsMain />} />
                <Route path="/household/:householdId/flowers" element={<FlowerList />} />
                <Route path="/household/:householdId/flowers/add" element={<AddFlower />} />
                <Route path="/household/:householdId/manage" element={<ManageHousehold />} />
                <Route path="/flowerpot-detail/:flowerId" element={<FlowerpotDetail />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/household/:householdId/members" element={<ManageMembers />} />
                <Route path="/edit-flower/:flowerId" element={<EditFlower />} />
                <Route path="/create-household" element={<CreateHousehold />} />
                <Route path="/household/:householdId/flowerpots/add" element={<AddFlowerPot />} />
                <Route path="/household/:householdId/flowers/transplant-flower" element={<TransplantFlower />} />
            </Routes>
            <Footer />
        </Router>
    )
}

export default App
