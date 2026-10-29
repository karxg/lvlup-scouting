import { LazyMotion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { Redirect, Route, Router, Switch } from 'wouter'
import { LangProvider } from './i18n/LangContext'
import { Home } from './pages/Home'

const Funds = lazy(() => import('./pages/Funds').then((m) => ({ default: m.Funds })))

const loadMotion = () => import('./lib/motionFeatures').then((m) => m.default)

/** Router base without the trailing slash, e.g. "/lvlup". */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

export function App() {
  return (
    <LazyMotion features={loadMotion} strict>
    <LangProvider>
      <Router base={BASE}>
        <Suspense fallback={<div className="min-h-dvh" />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/funds" component={Funds} />
          <Route path="/funds/" component={Funds} />
          <Route>
            <Redirect to="/" replace />
          </Route>
        </Switch>
        </Suspense>
      </Router>
    </LangProvider>
    </LazyMotion>
  )
}
