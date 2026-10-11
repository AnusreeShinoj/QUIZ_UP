import React, { useState } from 'react';
import { 
  GraduationCap, 
  Compass, 
  PlusCircle, 
  BookOpen, 
  BarChart3, 
  LayoutDashboard, 
  KeyRound, 
  User, 
  LogOut, 
  LogIn,
  Menu, 
  X,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openCodeModal: () => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openCodeModal,
  openAuthModal
}) => {
  const { user, userProfile, logout, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: GraduationCap },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'my-quizzes', label: 'My Quizzes', icon: BookOpen },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-purple-100 text-slate-800 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-6 lg:gap-8">
            <button 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 group-hover:bg-purple-200 transition-colors">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Quiz<span className="text-purple-600">Up</span>
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      isActive 
                        ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Desktop Right Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Quick Code Join Button */}
            <button
              onClick={openCodeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50/60 border border-purple-200 hover:border-purple-400 hover:bg-purple-100/60 rounded-lg transition-colors shadow-2xs"
            >
              <KeyRound className="w-3.5 h-3.5 text-purple-600" />
              <span>Enter Code</span>
            </button>

            {/* Create Quiz CTA */}
            <button
              onClick={() => handleNavClick('create')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>

            {/* Direct Login Page Button */}
            <button
              onClick={() => handleNavClick('login')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                currentTab === 'login'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-white hover:bg-purple-50 text-purple-700 border-purple-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>

            {/* User Profile / Quick Switch Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-purple-50 text-slate-700 transition-colors border border-transparent hover:border-purple-200"
              >
                <div className="w-7 h-7 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 text-xs font-bold">
                  {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden lg:block text-xs font-semibold text-slate-800">
                  {userProfile?.displayName?.split(' ')[0] || 'User'}
                </div>
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white border border-purple-100 rounded-xl shadow-lg py-1 text-slate-800 z-50 divide-y divide-purple-50"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5">
                    <p className="text-xs font-bold text-slate-900">{userProfile?.displayName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{userProfile?.email}</p>
                    <span className="text-[10px] text-purple-700 font-semibold uppercase">
                      {userProfile?.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        demoLogin('student');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-purple-50 flex items-center justify-between"
                    >
                      <span>Switch: Student (Nisha)</span>
                      {userProfile?.role === 'student' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                    </button>
                    <button
                      onClick={() => {
                        demoLogin('educator');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-purple-50 flex items-center justify-between"
                    >
                      <span>Switch: Faculty (Aditi)</span>
                      {userProfile?.role === 'educator' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleNavClick('login');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-purple-700 hover:bg-purple-50 flex items-center gap-2 font-medium"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Open Login Page</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        handleNavClick('login');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={() => handleNavClick('login')}
              className="p-1.5 text-purple-700 hover:bg-purple-50 rounded-md"
              title="Login"
            >
              <LogIn className="w-4 h-4 text-purple-600" />
            </button>
            <button
              onClick={openCodeModal}
              className="p-1.5 text-slate-700 hover:bg-purple-50 rounded-md"
              title="Enter code"
            >
              <KeyRound className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-700 hover:bg-purple-50 rounded-md"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md ${
                  isActive ? 'bg-purple-50 text-purple-700' : 'text-slate-700 hover:bg-purple-50/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-purple-100 flex flex-col gap-2">
            <button
              onClick={() => handleNavClick('create')}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg bg-purple-600 text-white"
            >
              <PlusCircle className="w-4 h-4" />
              Create Quiz
            </button>
            <button
              onClick={() => handleNavClick('login')}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg border border-purple-200 text-purple-800 bg-purple-50"
            >
              <LogIn className="w-4 h-4 text-purple-600" />
              Sign In / Register
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
