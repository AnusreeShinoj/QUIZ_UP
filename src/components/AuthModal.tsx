import React, { useState } from 'react';
import { 
  X, 
  User, 
  GraduationCap, 
  LogIn, 
  Loader2, 
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, signInWithGoogle, demoLogin, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (role: 'student' | 'educator') => {
    demoLogin(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-purple-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Sign In to QuizUp</h3>
              <p className="text-[11px] text-purple-200">Select an account or test persona</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-200 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status banner if signed in */}
        {userProfile && (
          <div className="px-5 py-2.5 bg-purple-50 border-b border-purple-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-purple-900 truncate">
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
              <span className="truncate">Active: <strong>{userProfile.displayName}</strong></span>
            </div>
            <button
              onClick={logout}
              className="text-slate-500 hover:text-red-600 text-[11px] font-medium underline shrink-0 ml-2"
            >
              Sign out
            </button>
          </div>
        )}

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Google Sign-in */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-purple-200 hover:border-purple-300 bg-white hover:bg-purple-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Quick Demo Personas */}
          <div className="space-y-2 pt-2 border-t border-purple-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block text-center">
              Quick Demo Personas
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoSelect('student')}
                className="p-2.5 rounded-xl border border-purple-100 hover:border-purple-300 hover:bg-purple-50 text-left transition-colors"
              >
                <div className="text-xs font-bold text-slate-900">Student</div>
                <div className="text-[11px] text-purple-700 font-medium truncate">Nisha Gopal</div>
              </button>

              <button
                onClick={() => handleDemoSelect('educator')}
                className="p-2.5 rounded-xl border border-purple-100 hover:border-purple-300 hover:bg-purple-50 text-left transition-colors"
              >
                <div className="text-xs font-bold text-slate-900">Faculty</div>
                <div className="text-[11px] text-purple-700 font-medium truncate">Dr. Aditi Sharma</div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
