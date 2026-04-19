import { Router as WouterRouter, Switch, Route } from 'wouter'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import NotFound from '@/pages/not-found'
import Home from '@/pages/home'
import Editor from '@/pages/editor'
import CassiePage from '@/features/cassie/cassie'

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/editor" component={Editor} />
      <Route path="/cassie" component={CassiePage} />
      <Route component={NotFound} />
    </Switch>
  )
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
    </TooltipProvider>
  )
}

export default App
