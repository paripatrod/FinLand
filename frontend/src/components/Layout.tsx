import { Link, useLocation } from 'react-router-dom';
import { Calculator, LayoutDashboard, CreditCard, GraduationCap, Menu, X, Palette, Languages, Sparkles, Zap, Leaf, Monitor } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { useLanguage, Language } from '../contexts/LanguageContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  
  const isActive = (path: string) => location.pathname === path;
  
  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
  ];

  const themes: { code: Theme; name: string; icon: ReactNode; color: string }[] = [
    { code: 'default', name: 'Default', icon: <Monitor className="w-4 h-4" />, color: 'bg-emerald-500' },
    { code: 'cyberpunk', name: 'Cyberpunk', icon: <Zap className="w-4 h-4" />, color: 'bg-pink-500' },
    { code: 'luxury', name: 'Luxury', icon: <Sparkles className="w-4 h-4" />, color: 'bg-amber-500' },
    { code: 'zen', name: 'Zen', icon: <Leaf className="w-4 h-4" />, color: 'bg-stone-500' },
  ];
  
  return (
    <div className="min-h-screen transition-colors duration-500">
      {/* Skip to main content - Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>
      
      {/* Navigation */}
      <nav 
        className="glass-card sticky top-0 z-50 border-b-0" 
        style={{ borderBottom: '1px solid var(--card-border)' }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100 hidden sm:block transition-colors">
                FinLand
              </span>
              <span className="text-base font-bold text-gray-900 dark:text-gray-100 sm:hidden transition-colors">
                คำนวณการเงิน
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink 
                to="/" 
                active={isActive('/')}
                icon={<LayoutDashboard className="w-4 h-4" />}
              >
                {t('nav.home')}
              </NavLink>
              
              <NavLink 
                to="/credit-card" 
                active={isActive('/credit-card')}
                icon={<CreditCard className="w-4 h-4" />}
              >
                {t('nav.creditCard')}
              </NavLink>
              
              <NavLink 
                to="/student-loan" 
                active={isActive('/student-loan')}
                icon={<GraduationCap className="w-4 h-4" />}
              >
                {t('nav.studentLoan')}
              </NavLink>
              
              <NavLink 
                to="/dashboard" 
                active={isActive('/dashboard')}
                icon={<LayoutDashboard className="w-4 h-4" />}
              >
                {t('nav.dashboard')}
              </NavLink>
              
              {/* Theme Selector */}
              <div className="relative ml-2">
                <button
                  onClick={() => {
                    setThemeMenuOpen(!themeMenuOpen);
                    setLangMenuOpen(false);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100/80 hover:dark:bg-gray-700/50 transition-colors"
                  aria-label="Change theme"
                >
                  <Palette className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                </button>

                {themeMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setThemeMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 max-h-96 overflow-y-auto rounded-xl shadow-2xl border-2 z-50 animate-fade-in" style={{ 
                      background: 'var(--card-bg)',
                      borderColor: 'var(--card-border)',
                      backdropFilter: 'blur(20px)'
                    }}>
                      {themes.map((themeItem) => (
                        <button
                          key={themeItem.code}
                          onClick={() => {
                            setTheme(themeItem.code);
                            setThemeMenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm transition-all hover:bg-black/5 dark:hover:bg-white/5"
                          style={{
                            backgroundColor: theme === themeItem.code ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            color: theme === themeItem.code ? 'var(--color-primary)' : 'var(--text-primary)'
                          }}
                        >
                          <div className={`w-3 h-3 rounded-full ${themeItem.color} shadow-md`} />
                          <span className="font-medium">{themeItem.name}</span>
                          {theme === themeItem.code && <span className="ml-auto text-lg">✓</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => {
                    setLangMenuOpen(!langMenuOpen);
                    setThemeMenuOpen(false);
                  }}
                  className="flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-100/80 hover:dark:bg-gray-700/50 transition-colors"
                  aria-label="Change language"
                >
                  <Languages className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {languages.find(l => l.code === language)?.flag}
                  </span>
                </button>
                
                {langMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setLangMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 max-h-96 overflow-y-auto rounded-xl shadow-2xl border-2 z-50 animate-fade-in" style={{ 
                      background: 'var(--card-bg)',
                      borderColor: 'var(--card-border)',
                      backdropFilter: 'blur(20px)'
                    }}>
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setLangMenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm transition-all hover:bg-black/5 dark:hover:bg-white/5"
                          style={{
                            backgroundColor: language === lang.code ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            color: language === lang.code ? 'var(--color-primary)' : 'var(--text-primary)'
                          }}
                        >
                          <span className="text-2xl">{lang.flag}</span>
                          <span className="font-medium flex-1 text-left">{lang.name}</span>
                          {language === lang.code && <span className="text-lg">✓</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-2 md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in glass-card mt-2 rounded-xl">
              <div className="flex flex-col space-y-2 p-2">
                <MobileNavLink 
                  to="/" 
                  active={isActive('/')}
                  icon={<LayoutDashboard className="w-5 h-5" />}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.home')}
                </MobileNavLink>
                
                <MobileNavLink 
                  to="/credit-card" 
                  active={isActive('/credit-card')}
                  icon={<CreditCard className="w-5 h-5" />}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.creditCard')}
                </MobileNavLink>
                
                <MobileNavLink 
                  to="/student-loan" 
                  active={isActive('/student-loan')}
                  icon={<GraduationCap className="w-5 h-5" />}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.studentLoan')}
                </MobileNavLink>
                
                <MobileNavLink 
                  to="/dashboard" 
                  active={isActive('/dashboard')}
                  icon={<LayoutDashboard className="w-5 h-5" />}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.dashboard')}
                </MobileNavLink>
                
                {/* Mobile Theme Selector */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Theme
                  </div>
                  <div className="grid grid-cols-2 gap-2 px-2">
                    {themes.map((t) => (
                      <button
                        key={t.code}
                        onClick={() => {
                          setTheme(t.code);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          theme === t.code
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${t.color}`} />
                        <span>{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Language Selector */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    {t('nav.home') === 'Home' ? 'Language' : 'ภาษา'}
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        language === lang.code
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      {/* Main Content */}
      <main 
        id="main-content" 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 min-h-[calc(100vh-200px)]"
        role="main"
      >
        {children}
      </main>
      
      {/* Footer */}
      <footer className="glass-card mt-12 sm:mt-16 transition-colors duration-300 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('footer.about')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('footer.aboutText')}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('footer.tools')}</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li><Link to="/credit-card" className="hover:text-emerald-600 dark:hover:text-emerald-400">{t('nav.creditCard')}</Link></li>
                <li><Link to="/student-loan" className="hover:text-emerald-600 dark:hover:text-emerald-400">{t('nav.studentLoan')}</Link></li>
                <li><Link to="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400">{t('nav.dashboard')}</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('footer.contact')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('footer.contactText')}<br />
                {t('footer.email')}: info@example.com
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>{t('footer.copyright')}</p>
            <p className="mt-1 text-xs">{t('footer.disclaimer')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface NavLinkProps {
  to: string;
  active: boolean;
  icon: ReactNode;
  children: ReactNode;
}

function NavLink({ to, active, icon, children }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-1 px-3 lg:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-700 dark:hover:text-emerald-400'
      }`}
    >
      {icon}
      <span className="text-sm lg:text-base">{children}</span>
    </Link>
  );
}

interface MobileNavLinkProps {
  to: string;
  active: boolean;
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
}

function MobileNavLink({ to, active, icon, children, onClick }: MobileNavLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
          : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-700 dark:hover:text-emerald-400'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}