import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'

import App from './App'
import './i18n'
import { store } from './redux/store/store'
import './styles/global.sass'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
    <Provider store={store}>
        <App />
    </Provider>,
)
