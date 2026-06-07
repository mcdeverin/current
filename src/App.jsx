import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import OfflineBanner from '@/components/current/OfflineBanner';
import Spots from './pages/Spots';
import Settings from './pages/Settings';
import Reflection from './pages/Reflection';
import Mocktails from './pages/Mocktails';
import Letters from './pages/Letters';
import Pause from './pages/Pause';
import Anchor from './pages/Anchor';
import Room from './pages/Room';
import Presence from './pages/Presence';
import Progress from './pages/Progress';
import Budget from './pages/Budget';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App error boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', backgroundColor: 'var(--t-bg)', color: 'var(--t-text)' }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '0.5rem' }}>Something went wrong.</p>
          <p style={{ color: 'var(--t-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Please try refreshing the page.</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            style={{ padding: '0.75rem 2rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 500, backgroundColor: 'var(--t-accent)', color: 'var(--t-bg)', border: 'none', cursor: 'pointer' }}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
    <Route path="/" element={
      <LayoutWrapper currentPageName={mainPageKey}>
        <MainPage />
      </LayoutWrapper>
    } />
    {Object.entries(Pages).map(([path, Page]) => (
      <Route
        key={path}
        path={`/${path}`}
        element={
          <LayoutWrapper currentPageName={path}>
            <Page />
          </LayoutWrapper>
        }
      />
    ))}
    {/* New design refinement routes */}
    <Route path="/Spots" element={<LayoutWrapper currentPageName="Spots"><Spots /></LayoutWrapper>} />
    {/* Stub routes for entry points referenced in Home */}
    <Route path="/Settings" element={<LayoutWrapper currentPageName="Settings"><Settings /></LayoutWrapper>} />
    <Route path="/Anchor" element={<Anchor />} />
    <Route path="/Reflection" element={<LayoutWrapper currentPageName="Reflection"><Reflection /></LayoutWrapper>} />
    <Route path="/Mocktails" element={<LayoutWrapper currentPageName="Mocktails"><Mocktails /></LayoutWrapper>} />
    <Route path="/Letters" element={<LayoutWrapper currentPageName="Letters"><Letters /></LayoutWrapper>} />
    <Route path="/Pause" element={<LayoutWrapper currentPageName="Pause"><Pause /></LayoutWrapper>} />
    <Route path="/Room" element={<LayoutWrapper currentPageName="Room"><Room /></LayoutWrapper>} />
    <Route path="/Presence" element={<LayoutWrapper currentPageName="Presence"><Presence /></LayoutWrapper>} />
    <Route path="/Progress" element={<LayoutWrapper currentPageName="Progress"><Progress /></LayoutWrapper>} />
    <Route path="/Budget" element={<LayoutWrapper currentPageName="Budget"><Budget /></LayoutWrapper>} />
    <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <OfflineBanner />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App