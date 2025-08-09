import React from 'react';
import { Globe, Lock, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';
import type { BrowserChromeProps } from '../types/clientFlow';

/**
 * BrowserChrome - Renders browser UI chrome (URL bar, tabs, navigation)
 * Provides realistic browser context for popup previews
 */
export const BrowserChrome: React.FC<BrowserChromeProps> = ({
  url,
  viewport,
  className = '',
}) => {
  const isMobile = viewport === 'mobile';

  if (isMobile) {
    // Mobile browser chrome (simplified)
    return (
      <div className={`bg-gray-100 border-b border-gray-300 ${className}`}>
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="flex-1 mx-3">
            <div className="bg-white rounded-full px-3 py-1 border border-gray-300 flex items-center space-x-2">
              <Lock className="w-3 h-3 text-green-600" />
              <span className="text-xs text-gray-700 truncate">{url}</span>
            </div>
          </div>
          
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </div>
      </div>
    );
  }

  // Desktop browser chrome
  return (
    <div className={`bg-gray-100 border-b border-gray-300 ${className}`}>
      {/* Window controls and tabs */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-200 border-b border-gray-300">
        <div className="flex items-center space-x-2">
          {/* Window controls (Mac style) */}
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
        
        {/* Tab */}
        <div className="flex-1 mx-4">
          <div className="bg-white rounded-t-lg px-4 py-1 border-l border-r border-t border-gray-300 max-w-xs">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700 truncate">
                {new URL(url).hostname}
              </span>
            </div>
          </div>
        </div>
        
        <div className="w-16"></div> {/* Spacer for symmetry */}
      </div>
      
      {/* Address bar */}
      <div className="flex items-center px-4 py-2 space-x-3">
        <div className="flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-800" />
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <RefreshCw className="w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-800" />
        </div>
        
        <div className="flex-1">
          <div className="bg-white rounded-full px-4 py-2 border border-gray-300 flex items-center space-x-3 shadow-sm">
            <Lock className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-700 flex-1">{url}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">U</span>
          </div>
        </div>
      </div>
    </div>
  );
};
