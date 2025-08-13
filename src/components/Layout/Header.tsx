import React from 'react';
import { Brain, User, LogOut, FileDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { User as UserType } from '../../types';

interface HeaderProps {
  user: UserType | null;
  onAuthClick: () => void;
  onLogout: () => void;
  onDownloadReport?: () => void;
  showDownload?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  onAuthClick, 
  onLogout, 
  onDownloadReport,
  showDownload = false 
}) => {
  return (
    <header className="bg-white shadow-lg border-b-2 border-blue-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Career Compass
              </h1>
              <p className="text-sm text-gray-600">Navigate Your Career Journey</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
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
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-700">{user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={LogOut}
                  onClick={onLogout}
                  className="text-gray-600"
                >
                  Logout
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