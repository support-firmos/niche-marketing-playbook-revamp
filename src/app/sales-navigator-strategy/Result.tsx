'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import { faArrowRight, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Segment } from '../store/salesNavSegmentsStore';
import ReactMarkdown from 'react-markdown';
import { useSalesNavSegmentsStore } from '../store/salesNavSegmentsStore';
import { useServicesStore } from '../store/servicesStore';
import { formatSegmentsForDisplay } from '../utilities/formatSegments';
import { useSalesNavStore } from '../store/salesNavStore';

interface ResultProps {
  segments: Segment[] | null;
  onReset: () => void;
}

const formatSegmentsToText = (segments: Segment[]) => {
  if (!segments) return '';
  return segments.map(segment => {
      return `
---
Segment: ${segment.name}
Justification: ${segment.justification}
Challenges: ${segment.challenges}
Job Titles: ${segment.jobtitles}
Industries: ${segment.industries}
Headcount: ${segment.headcount}
Company Type: ${segment.companytype}
Keywords: ${segment.keywords}
Boolean Search: ${segment.boolean}
Intent Data: ${segment.intentdata}
      `.trim();
  }).join('\n\n');
};
  
export default function Result({ segments, onReset }: ResultProps) {
    const [openSegments, setOpenSegments] = useState<{ [key: string]: boolean }>({});
    const [copySuccess, setCopySuccess] = useState('');
    const [isRetrying, setIsRetrying] = useState<string | null>(null);
    const { nicheConsideration, step3Segments, setStep3Segments } = useSalesNavSegmentsStore();
    const { selectedServices } = useServicesStore();
    const { setStep3GeneratedSalesNav } = useSalesNavStore();

    const handleRetrySegment = async (segmentName: string) => {
        if (!nicheConsideration || !step3Segments) return;
        
        setIsRetrying(segmentName);
        try {
          const response = await fetch('/api/retry-segment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nicheConsideration,
              segmentToReplace: segmentName,
              existingSegments: step3Segments,
              selectedServices
            }),
          });
    
          if (!response.ok) throw new Error('Failed to retry segment');
          
          const data = await response.json();
          
          // Replace the old segment with the new one
          const updatedSegments = step3Segments.map(seg => 
            seg.name === segmentName ? data.result : seg
          );
          const formattedContent = formatSegmentsForDisplay(updatedSegments);
          setStep3Segments(updatedSegments);
          setStep3GeneratedSalesNav(formattedContent);

        } catch (error) {
          console.error('Error retrying segment:', error);
        } finally {
          setIsRetrying(null);
        }
      };

    const toggleSegment = (segmentName: string) => {
      setOpenSegments(prev => ({
          ...prev,
          [segmentName]: !prev[segmentName]
      }));
    };

    const handleCopy = async () => {
      if (!segments) return;
      try {
          const textContent = formatSegmentsToText(segments);
          await navigator.clipboard.writeText(textContent);
          setCopySuccess('Copied!');
          setTimeout(() => setCopySuccess(''), 2000);
      } catch {
          setCopySuccess('Failed to copy');
      }
  };

  const handleDownload = () => {
    if (!segments) return;
    const content = formatSegmentsToText(segments);
    
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'Sales-Nav-Params.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {segments?.map((segment, index) => (
          <div key={index} className="bg-gray-700 rounded-xl border border-[#8a8f98]/20">
            <div className="w-full p-4 flex justify-between items-center">
              <button
                onClick={() => toggleSegment(segment.name)}
                className="flex-1 text-left text-[#f7f8f8] hover:bg-gray-600 rounded-xl"
              >
                <span className="font-semibold">{segment.name}</span>
              </button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRetrySegment(segment.name)}
                  isLoading={isRetrying === segment.name}
                  className="text-[#f7f8f8] border border-[#8a8f98]/40 hover:bg-[#1A1A1A]"
                >
                  Retry
                </Button>
                <FontAwesomeIcon 
                  icon={openSegments[segment.name] ? faChevronUp : faChevronDown} 
                  className="w-4 h-4"
                />
              </div>
            </div>
                    
                    {openSegments[segment.name] && (
                        <div className="p-4 border-t border-[#8a8f98]/20 text-[#f7f8f8]">
                            <div className="space-y-3">
                                {Object.entries({
                                    'Justification': segment.justification,
                                    'Challenges': segment.challenges,
                                    'Job Titles': segment.jobtitles,
                                    'Industries': segment.industries,
                                    'Headcount': segment.headcount,
                                    'Company Type': segment.companytype,
                                    'Keywords': segment.keywords,
                                    'Boolean Search': segment.boolean,
                                    'Intent Data': segment.intentdata,
                                }).map(([title, content]) => (
                                    <div key={title}>
                                        <h3 className="font-semibold">{title}</h3>
                                        <div className="prose prose-invert max-w-none">
                                        <ReactMarkdown
                                            components={{
                                                p: ({...props}) => <p className="mb-4" {...props} />,
                                                ul: ({...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                                                ol: ({...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                                                li: ({...props}) => <li className="mb-1" {...props} />,
                                                strong: ({...props}) => <strong className="font-semibold text-green-400" {...props} />
                                            }}
                                        >
                                            {content.replace(/\n/g, '  \n')}
                                        </ReactMarkdown>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>

        <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
                <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={handleCopy}
                    className="text-[#f7f8f8] border border-[#8a8f98]/40 hover:bg-[#1A1A1A]"
                >
                    {copySuccess || 'Copy All'}
                </Button>
                <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={handleDownload}
                    className="text-[#f7f8f8] border border-[#8a8f98]/40 hover:bg-[#1A1A1A]"
                >
                    Download All
                </Button>
                <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={onReset}
                    className="bg-slate-800 text-[#f7f8f8] hover:bg-slate-500"
                >
                    Reset
                </Button>
            </div>
            <Link href="/deep-research">
                <Button 
                    variant="secondary" 
                    size="sm" 
                    className="text-white flex items-center space-x-2"
                >
                    <span>Go To Deep Segment Research</span>
                    <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                </Button>
            </Link>
        </div>
    </div>
);
    }