'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import ReactMarkdown from 'react-markdown';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface ResultProps {
    content: string;
    onReset: () => void;
}
  

export default function Result({ content, onReset }: ResultProps) {
    const [copySuccess, setCopySuccess] = useState('');

    const handleCopy = async () => {
        try {
        await navigator.clipboard.writeText(content);
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
        } catch {
        setCopySuccess('Failed to copy');
        }
    };

    const handleDownload = () => {
        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = 'Marketing-Inbound-Blueprint.txt';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };
    return (
        <div className="space-y-6">          
          <div className="bg-gray-700 p-5 rounded-xl border border-[#8a8f98]/20 max-h-80 overflow-auto">
            <div className="text-[#f7f8f8] font-inter text-sm markdown-content">
              <ReactMarkdown 
                components={{
                  p: ({...props}) => <p className="mb-4" {...props} />,
                  br: () => <br />,
                  h1: ({...props}) => <h1 className="text-xl font-bold mb-4" {...props} />,
                  h2: ({...props}) => <h2 className="text-lg font-bold mb-3" {...props} />,
                  h3: ({...props}) => <h3 className="text-md font-bold mb-2" {...props} />,
                  ul: ({...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                  ol: ({...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                  li: ({...props}) => <li className="mb-1" {...props} />
                }}
              >
                {content.replace(/\n(?!\n)/g, '  \n')}
              </ReactMarkdown>
          </div>
          </div>
            <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleCopy}
                className="text-[#f7f8f8] border border-[#8a8f98]/40 hover:bg-[#1A1A1A]"
              >
                {copySuccess || 'Copy'}
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleDownload}
                className="text-[#f7f8f8] border border-[#8a8f98]/40 hover:bg-[#1A1A1A]"
              >
                Download
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
            <Link href="/calculator">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="text-white flex items-center space-x-2"
                >
                  <span>Go To Calculator</span>
                  <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                </Button>
            </Link>
          </div>
        </div>
      );
    }