import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import Home from './components/Home';
import AnimatedBackground from './components/ui/AnimatedBackground';
import LoadingSkeleton from './components/LoadingSkeleton';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load heavy components for better performance
const CreditCardCalculator = lazy(() => import('./components/CreditCardCalculator'));
const StudentLoanCalculator = lazy(() => import('./components/StudentLoanCalculator'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const OnboardingTutorial = lazy(() => import('./components/OnboardingTutorial'));
const NotFound = lazy(() => import('./components/NotFound'));
const About = lazy(() => import('./components/About'));
const Privacy = lazy(() => import('./components/Privacy'));

function App() {
  const location = useLocation();
  
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          {/* Toast notifications */}
          <Toaster 
            position="top-center" 
            richColors 
            closeButton
            toastOptions={{
              duration: 3000,
              className: 'font-medium',
            }}
          />
          <AnimatedBackground />
          <Layout>
            <AnimatePresence mode="wait">
              <Suspense fallback={<LoadingSkeleton variant="page" />}>
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Home />} />
                  <Route path="/credit-card" element={<CreditCardCalculator />} />
                  <Route path="/student-loan" element={<StudentLoanCalculator />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tutorial" element={<OnboardingTutorial />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AnimatePresence>
          </Layout>
        </LanguageProvider>
      </ThemeProvider>
      <Analytics />
    </ErrorBoundary>
  );
}

export default App;