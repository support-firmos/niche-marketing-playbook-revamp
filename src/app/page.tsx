'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import PageCard from '@/components/PageCards';

import { 
  faSearchLocation,
  faParachuteBox,
  faHourglass2,
  faBook,
  faDollarSign,
  faTag
} from '@fortawesome/free-solid-svg-icons';

const cards = [
  {
    title: 'Find Your Segments',
    path: '/find-your-segments',
    icon: faSearchLocation
  },
  {
    title: 'Sales Nav Parameters',
    path: '/sales-navigator-strategy',
    icon: faParachuteBox
  },
  {
    title: 'Deep Research',
    path: '/deep-research',
    icon: faHourglass2
  },
  {
    title: 'Marketing Blueprint',
    path: '/inbound-blueprint',
    icon: faBook
  },
  {
    title: 'Pricing Calculator',
    path: '/calculator',
    icon: faDollarSign
  },
  {
    title: 'One-Time Offer',
    path: '/one-time-offer',
    icon: faTag
  }
];

export default function LandingPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative">
      <div className={`fixed top-0 left-0 h-full z-30 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>
      <div className="min-h-screen bg-black text-white">
        <main className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              With AI, transform <br/><span className="text-green-500">client research</span>
              <br />from hours to instants
            </h1>
            <p className="text-l mb-12 max-w-xl mx-auto">
              Uncover your <em>niche industry segments</em>, build targeted <em>Sales Navigator Strategies</em>, and create <em>Inbound Marketing Blueprint</em> in minutes!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center max-w-4xl mx-auto px-4">
             {cards.map((card, index) => (
              <PageCard
                key={card.path}
                title={card.title}
                icon={card.icon}
                onClick={() => router.push(card.path)}
                delay={index}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}