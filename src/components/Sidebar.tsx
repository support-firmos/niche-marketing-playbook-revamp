import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import Image from 'next/image';
import Button from './Button';
import { 
  faHome, 
  faTag, 
  faUpload, 
  faBars, 
  faTimes,
  faBuilding,
  faSearchDollar,
  faClock,
  faBook,
  faDollarSign,
  faSearchLocation,
  faUniversity,
  faAnchor,
  fa5,
  faShuttleSpace,
  faShippingFast,
  faRoadBridge,
  faHourglass,
  faHourglass2
} from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faParachuteBox } from '@fortawesome/free-solid-svg-icons/faParachuteBox';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: IconDefinition;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const [currentPath, setCurrentPath] = useState('');
  
  useEffect(() => {
    // Set current path for active state
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const navItems: NavItem[] = [
    {
      path: '/',
      label: 'Home',
      icon: faHome
    },
    {
      path: '/find-your-segments',
      label: 'Find Your Segments',
      icon: faSearchLocation
    },
    {
      path: '/sales-navigator-strategy',
      label: 'Sales Nav Params',
      icon: faParachuteBox
    },
    {
      path: '/deep-research',
      label: 'Deep Research',
      icon: faHourglass2
    },
    {
      path: '/inbound-blueprint',
      label: 'Marketing Blueprint',
      icon: faBook
    },
    {
      path: '/calculator',
      label: 'Pricing Calculator',
      icon: faDollarSign
    },
    //{
      //path: '/marketing-playbook',
      //label: 'Marketing Playbook',
      //icon: faSearchDollar
   // },
    {
      path: '/one-time-offer',
      label: 'One-Time Offer',
      icon: faTag
    },
    {
      path: '/airtable',
      label: 'Upload to Airtable',
      icon: faUpload
    },
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar container - adapts between expanded and collapsed states */}
      <div 
        className={`fixed top-0 left-0 h-full bg-slate-900 transition-all duration-300 ease-in-out z-10 shadow-xl ${
          sidebarOpen 
            ? "md:w-64 w-72" 
            : "w-16"
        }`}
      >
        {/* Logo area */}
        <div className="flex items-center h-16 border-b border-slate-700 px-4">
          <div className={`flex items-center ${sidebarOpen ? 'justify-center w-full' : 'justify-center w-full'}`}>
            {sidebarOpen ? (
              <>
              <Image
                src="https://storage.googleapis.com/firmos-pics/FirmOS%20Logo%20-%20White.png"
                alt="FirmOS Logo"
                width={100}
                height={100}
                className="object-contain"
                unoptimized
              />
              </>
            ) : (
              <FontAwesomeIcon icon={faBuilding} className="w-7 h-7 text-white" />
            )}
          </div>
        </div>
        
        <Button
          variant = 'secondary'
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 right-0 transform translate-x-1/2 z-20 p-2 bg-slate-700 rounded-full shadow-lg text-white hover:bg-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 h-8 w-8 flex items-center justify-center"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} className="h-3 w-3" />
        </Button>
        
        {/* Navigation links */}
        <nav className={`mt-6 ${sidebarOpen ? 'px-4' : 'px-0'}`}>
          {sidebarOpen && (
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
              Marketing Playbook
            </span>
          )}
          
          <div className="mt-3 space-y-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <Link 
                  href={item.path} 
                  key={item.path}
                  className={`flex items-center ${sidebarOpen ? 'px-3 py-3' : 'px-0 py-3 justify-center'} rounded-lg transition-colors duration-200 group ${
                    isActive 
                      ? "bg-slate-700 text-white" 
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className={`${sidebarOpen ? 'mr-3' : 'mx-auto'} ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`}>
                    <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                  </span>
                  
                  {sidebarOpen && (
                    <>
                      <span className="font-medium whitespace-nowrap">{item.label}</span>
                      
                      {isActive && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-blue-400" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
        
      </div>

      {/* Mobile overlay - only shows when sidebar is open on mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 z-0 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />
    </div>
  );
};

export default Sidebar;