// components/generate/SubTabNavbar.tsx - Neutral Theme Compatible
import React from 'react';
import { TabType } from '@/types/generate';
import { Film, Users, Heart, History } from 'lucide-react';

interface SubTabNavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const SubTabNavbar: React.FC<SubTabNavbarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { 
      id: 'scene' as TabType, 
      label: 'Scene Creator',
      icon: Film
    },
    { 
      id: 'character' as TabType, 
      label: 'Character Creator',
      icon: Users
    },
    { 
      id: 'my-characters' as TabType, 
      label: 'My Characters',
      icon: Heart
    },
    { 
      id: 'history' as TabType, 
      label: 'History',
      icon: History
    }
  ];

  return (
    <div className="mt-6 mb-4">
      <div className="container mx-auto px-4">
        {/* ✅ Neutral background that works with both themes */}
        <div className="bg-card border border-border rounded-lg shadow-sm">
          
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-center py-1">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <React.Fragment key={tab.id}>
                  <button
                    onClick={() => onTabChange(tab.id)}
                    className={`relative px-5 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-2 rounded-md ${
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    
                    {/* ✅ Bottom border for active using primary color */}
                    {isActive && (
                      <div className="absolute bottom-1 left-3 right-3 h-0.5 bg-primary rounded-full"></div>
                    )}
                  </button>
                  
                  {/* ✅ Subtle divider */}
                  {index < tabs.length - 1 && (
                    <div className="w-px h-4 bg-border mx-1"></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <React.Fragment key={tab.id}>
                    <button
                      onClick={() => onTabChange(tab.id)}
                      className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap flex-shrink-0 flex items-center gap-2 transition-colors duration-200 rounded-md ${
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">
                        {tab.id === 'scene' ? 'Scene' : 
                         tab.id === 'character' ? 'Character' : 
                         tab.id === 'my-characters' ? 'Favorites' : 
                         'History'}
                      </span>
                      
                      {/* ✅ Bottom border for active */}
                      {isActive && (
                        <div className="absolute bottom-1 left-2 right-2 h-0.5 bg-primary rounded-full"></div>
                      )}
                    </button>
                    
                    {/* ✅ Mobile divider */}
                    {index < tabs.length - 1 && (
                      <div className="w-px bg-border self-stretch my-1 mx-1"></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Simple scrollbar hide */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default SubTabNavbar;