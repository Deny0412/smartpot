import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation/Navigation'
import Home from './pages/Home/Home'

const App = () => {
    return (
        <Router>
            <Navigation />
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
        </Router>
    )
}

export default App


/* export default App
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadFlowerpots } from './redux/slices/flowerpotsSlice'
import { AppDispatch, RootState } from './redux/store/store'
import Navigation from './components/Navigation/Navigation'
import Home from './pages/Home/Home'

const App = () => {
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        dispatch(loadFlowerpots())
    }, [dispatch])

    const flowerpots = useSelector((state: RootState) => state.flowerpots.flowerpots)
    const loading = useSelector((state: RootState) => state.flowerpots.loading)
    const error = useSelector((state: RootState) => state.flowerpots.error)

    return (<>
    <Navigation/>
    <div className="app">
            {loading ? <p>Načítavam dáta...</p> : null}
            {error ? <p>Chyba: {error}</p> : null}
            {flowerpots?.length > 0 ? (
                flowerpots.map(flowerpot => <p key={flowerpot.id}>{flowerpot.name}</p>)
            ) : (
                <p>Žiadne dáta</p>
            )}
        </div>
    </>
        
    )
}

export default App */
