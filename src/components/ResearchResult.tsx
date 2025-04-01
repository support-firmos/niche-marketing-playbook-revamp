// components/ResearchResult.tsx
import { useState } from 'react';
import Button from './Button';
import ReactMarkdown from 'react-markdown';
import {Segment} from '../app/store/salesNavSegmentsStore'


interface ResearchResultProps {
  content: string;
  industry?: string;
  onReset: () => void;
  onRetry?: () => Promise<void>; 
  onNextSteps?: (content: string, selectedSegment?: Segment) => Promise<void>;
  currentStepDone?: boolean;
  isGeneratingNextStep?: boolean;
  nextStepButtonText?: string;
  resultType?: 'segments' | 'enhanced' | 'salesNav' | 'deepSegment' | 'playbook';
  segments?: Segment[];
}

export default function ResearchResult({ 
  content, 
  onReset, 
  onRetry,
  onNextSteps,
  isGeneratingNextStep = false,
  nextStepButtonText,
  resultType
}: ResearchResultProps) {
  const [copySuccess, setCopySuccess] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch {
      setCopySuccess('Failed to copy');
    }
  };

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'Customer-Niche-Marketing-Playbook.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleNextStep = async () => {
    if (onNextSteps) {
      await onNextSteps(content);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-[#f7f8f8]">
        {resultType === 'salesNav' 
          ? 'Sales Navigator Strategy' 
          : resultType === 'enhanced' 
            ? 'Enhanced Industry Research' 
            : resultType === 'segments' ? 'Industry Research' :
            resultType === 'deepSegment' ? 'Deep Industry Research' : 
            resultType === 'playbook' ? 'Inbound Marketing Blueprint' : undefined}
                {onRetry && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRetry}
            disabled={isRetrying}
            className="text-[#f7f8f8] border border-[#8a8f98]/40 hover:bg-[#1A1A1A]"
          >
            <i className={`fas ${isRetrying ? 'fa-spinner fa-spin' : 'fa-redo'}`} />
          </Button>
          )}
      </h2>
      
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopy}
            className="text-[#f7f8f8] border border-[#8a8f98]/40 hover:bg-[#1A1A1A]"
          >
            {copySuccess || 'Copy'}
          </Button>
          <Button 
            variant="outline" 
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
            New Research
          </Button>
        </div>
      </div>
      
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

      {!isGeneratingNextStep && !isRetrying && onNextSteps && (
        <div className="flex justify-center mt-4">
          <Button
            variant="primary"
            size="md"
            onClick={handleNextStep}
            className="shadow-md shadow-titleColor/20 hover:shadow-titleColor/30 !py-3 !px-5"
          >
            {nextStepButtonText || "Continue"}
          </Button>
        </div>
      )}

      {(isGeneratingNextStep || isRetrying) && (
        <div className="flex items-center justify-center space-x-2 mt-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8a8f98]"></div>
        <p className="text-[#8a8f98]">
          {isRetrying ? 'Regenerating content...' : 
            resultType === 'salesNav'  ?  'Deep Industry Research in progress...' 
            : resultType === 'segments' ? 'Creating Sales Navigator Strategy...' 
            : resultType === 'deepSegment' ? 'Creating Inbound Marketing Blueprint...' : 'Processing' }
        </p>
      </div>
      )}
    </div>
  );
}