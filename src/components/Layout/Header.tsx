import React from 'react';
import { Infinity, User, LogOut, FileDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { User as UserType } from '../../types';

interface HeaderProps {
  user: UserType | null;
  onAuthClick: () => void;
  onProfileClick?: () => void;
  onLogout: () => void;
  onDownloadReport?: () => void;
  showDownload?: boolean;
  onDashboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  onAuthClick, 
  onProfileClick,
  onLogout, 
  onDownloadReport,
  showDownload = false,
  onDashboard
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-primary-600 to-secondary-500 p-2 rounded-xl">
              <Infinity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Career Compass
              </h1>
              <p className="text-xs text-gray-400 font-medium tracking-wide">POWERED BY SKITRE</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {onDashboard && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDashboard}
                className="text-gray-300 hover:text-white"
              >
                Dashboard
              </Button>
            )}
            
            {showDownload && onDownloadReport && (
              <Button
                variant="outline"
                size="sm"
                icon={FileDown}
                onClick={onDownloadReport}
              >
                Download Report
              </Button>
            )}
            
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onProfileClick}
                    className="w-9 h-9 bg-gradient-to-r from-primary-900 to-primary-800 border border-primary-500/30 rounded-full flex items-center justify-center hover:border-primary-400 transition-colors"
                    title="View Profile"
                  >
                    <User className="w-4 h-4 text-primary-200" />
                  </button>
                  <span className="font-medium text-gray-200 hidden md:block">{user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={LogOut}
                  onClick={onLogout}
                  className="text-gray-400 hover:text-white"
                >
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Button onClick={onAuthClick}>
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
