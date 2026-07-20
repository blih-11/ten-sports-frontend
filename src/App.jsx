import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import Analytics from './components/Analytics'
import CookieConsent from './components/CookieConsent'
import { ActiveSportProvider } from './context/ActiveSportContext'
import { MonetizationProvider } from './context/MonetizationContext'
import Home from './pages/Home'
import ArticlePage from './pages/ArticlePage'
import CategoryPage from './pages/CategoryPage'
import SearchPage from './pages/SearchPage'
import About from './pages/About'
import Contact from './pages/Contact'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfUse from './pages/TermsOfUse'
import NotFound from './pages/NotFound'
import Results from './pages/Results'
import MatchPage from './pages/MatchPage'
import TeamPage from './pages/TeamPage'
import Transfers from './pages/Transfers'

export default function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <CookieConsent />
      <ActiveSportProvider>
        <MonetizationProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:slug" element={<ArticlePage />} />
            <Route path="/results" element={<Results />} />
            <Route path="/match/:id" element={<MatchPage />} />
            <Route path="/team/:slug" element={<TeamPage />} />
            <Route path="/transfer-news" element={<Transfers />} />
            <Route path="/transfers" element={<Navigate to="/transfer-news" replace />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/:categorySlug" element={<CategoryPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
        </MonetizationProvider>
      </ActiveSportProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#111111', color: '#fff', border: '1px solid #FFD600' },
          success: { iconTheme: { primary: '#FFD600', secondary: '#000' } },
        }}
      />
    </BrowserRouter>
  )
}