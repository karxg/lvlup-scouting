import { Redirect, Route, Router, Switch } from 'wouter'
import { LangProvider } from './i18n/LangContext'
import { Funds } from './pages/Funds'
import { Home } from './pages/Home'

/** Router base without the trailing slash, e.g. "/lvlup". */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

export function App() {
  return (
    <LangProvider>
      <Router base={BASE}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/funds" component={Funds} />
          <Route path="/funds/" component={Funds} />
          <Route>
            <Redirect to="/" replace />
          </Route>
        </Switch>
      </Router>
    </LangProvider>
  )
}
