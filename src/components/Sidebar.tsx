import Link from 'next/link';
import Button from '@/components/Button';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
  }

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <>
      {/* Sidebar toggle button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-0 left-0 z-10 p-2 bg-surface-1/60 rounded-lg shadow-md text-titleColor hover:bg-surface-1/80 transition-all duration-200"
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      
      {/* Collapsible Sidebar */}
      <div className={`md:w-64 bg-surface-1/40 border border-subtitleColor/10 rounded-xl p-6 shadow-lg h-fit transition-all duration-300 ease-in-out ${
        sidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full md:opacity-0 md:-translate-x-full absolute"
      }`}>
        <div className="flex flex-col gap-4 pt-8">
          <Link href="/one-time-offer">
            <Button 
              className="!bg-gradient-to-r from-titleColor/90 to-titleColor/70 text-black font-medium shadow-md shadow-titleColor/20 hover:shadow-titleColor/30 hover:from-titleColor hover:to-titleColor/80 border border-titleColor/50 !py-3 !px-5 w-full"
            >
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                One-Time Offer Generator
              </span>
            </Button>
          </Link>
          {/*}
          <Link href="/calculator">
            <Button 
              className="!bg-gradient-to-r from-titleColor/90 to-titleColor/70 text-black font-medium shadow-md shadow-titleColor/20 hover:shadow-titleColor/30 hover:from-titleColor hover:to-titleColor/80 border border-titleColor/50 !py-3 !px-5 w-full"
            >
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                Calculator
              </span>
            </Button>
          </Link>
          */}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
