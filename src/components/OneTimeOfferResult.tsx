'use client';

import { useState, useEffect, useRef } from 'react';
import Button from './Button';
import React from 'react';

interface OneTimeOfferResultProps {
  content: string;
  onReset: () => void;
}

interface ParsedContent {
  title: string;
  introduction: string;
  offers: Offer[];
  footer: string;
}

interface Offer {
  title: string;
  fullTitle: string;
  sections: Record<string, string>;
}

const OneTimeOfferResult: React.FC<OneTimeOfferResultProps> = ({
  content,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'formatted' | 'raw'>('formatted');
  const [copySuccess, setCopySuccess] = useState('');
  const [expandedOffers, setExpandedOffers] = useState<Record<number, boolean>>({});
  const printRef = useRef<HTMLDivElement>(null);
  
  // Toggle offer expansion
  const toggleOffer = (index: number) => {
    setExpandedOffers(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Use effect to parse content on load or when it changes
  useEffect(() => {
    if (content) {
      // Clear copy status on new content
      setCopySuccess('');
      
      // Expand first offer by default
      if (content) {
        setExpandedOffers({ 0: true });
      }
    }
  }, [content]);
  
  // Parse the content into structured data
  const parseContent = (content: string) => {
    // Clean up the content first
    const cleanedContent = preprocessMarkdown(content);
    
    // Extract the introduction (everything from the start until the first H3 header)
    const introRegex = /^#\s+Introduction[\s\S]*?(?=\n###|\n?$)/m;
    const introMatch = cleanedContent.match(introRegex);
    const introduction = introMatch ? introMatch[0].trim() : '';
    
    // Extract the footer (content after "All offers are priced...")
    const footerRegex = /All offers are priced[\s\S]*?$/m;
    const footerMatch = cleanedContent.match(footerRegex);
    const footer = footerMatch ? footerMatch[0].trim() : '';
    
    // Extract offers - each starts with ### and a number, continues until the next ### or the end
    const offerRegex = /###\s+(\d+\.)\s+([^\n]+)[\s\S]*?(?=(?:\n###|\n?$))/gm;
    const offers: Array<{
      number: string;
      title: string;
      fullTitle: string;
      content: string;
      sections: Record<string, string>;
    }> = [];
    
    let offerMatch;
    while ((offerMatch = offerRegex.exec(cleanedContent)) !== null) {
      const [fullOffer, number, title] = offerMatch;
      const offerContent = fullOffer.replace(/^###\s+\d+\.\s+[^\n]+/m, '').trim();
      
      // Extract sections within this offer - looking for bold section titles like "**What It Is:**"
      const sectionRegex = /\*\*([^*]+?):\*\*\s*([\s\S]*?)(?=\n\*\*[^*]+?:\*\*|\n?$)/g;
      const sections: Record<string, string> = {};
      
      let sectionMatch;
      let foundSections = false;
      
      while ((sectionMatch = sectionRegex.exec(offerContent)) !== null) {
        const [, sectionTitle, sectionContent] = sectionMatch;
        sections[sectionTitle.trim()] = sectionContent.trim();
        foundSections = true;
      }
      
      // If no sections were found with the standard format, try an alternative approach
      if (!foundSections) {
        // Try to identify different section formats
        const altSectionRegex = /-\s*\*([^*]+?):\*\s*([\s\S]*?)(?=\n-\s*\*|\n?$)/g;
        
        while ((sectionMatch = altSectionRegex.exec(offerContent)) !== null) {
          const [, sectionTitle, sectionContent] = sectionMatch;
          sections[sectionTitle.trim()] = sectionContent.trim();
          foundSections = true;
        }
        
        // One more attempt with plain section headings
        if (!foundSections) {
          const plainSectionRegex = /([A-Za-z\s]+?):\s*([\s\S]*?)(?=\n[A-Za-z\s]+?:|\n?$)/g;
          while ((sectionMatch = plainSectionRegex.exec(offerContent)) !== null) {
            const [, sectionTitle, sectionContent] = sectionMatch;
            sections[sectionTitle.trim()] = sectionContent.trim();
            foundSections = true;
          }
        }
        
        // If still no sections, use the entire content as a "Description" section
        if (!foundSections && offerContent.trim()) {
          sections["Description"] = offerContent.trim();
        }
      }
      
      offers.push({
        number,
        title,
        fullTitle: `${number} ${title}`.trim(),
        content: offerContent,
        sections
      });
    }
    
    // If offers array is empty, try an alternative approach
    if (offers.length === 0) {
      // Look for numbered offers without ### markdown
      const altOfferRegex = /(\d+\.)\s+([^\n]+)[\s\S]*?(?=\n\d+\.|\n?$)/gm;
      while ((offerMatch = altOfferRegex.exec(cleanedContent)) !== null) {
        const [fullOffer, number, title] = offerMatch;
        const offerContent = fullOffer.replace(/^\d+\.\s+[^\n]+/m, '').trim();
        
        // Extract sections using the same approach as above
        const sections: Record<string, string> = {};
        const sectionRegex = /\*\*([^*]+?):\*\*\s*([\s\S]*?)(?=\n\*\*[^*]+?:\*\*|\n?$)/g;
        let sectionMatch;
        let foundSections = false;
        
        while ((sectionMatch = sectionRegex.exec(offerContent)) !== null) {
          const [, sectionTitle, sectionContent] = sectionMatch;
          sections[sectionTitle.trim()] = sectionContent.trim();
          foundSections = true;
        }
        
        if (!foundSections && offerContent.trim()) {
          sections["Description"] = offerContent.trim();
        }
        
        offers.push({
          number,
          title,
          fullTitle: `${number} ${title}`.trim(),
          content: offerContent,
          sections
        });
      }
    }
    
    // Add debug info to the console for troubleshooting
    console.log("Parsed Data:", {
      introLength: introduction.length,
      offerCount: offers.length,
      offers: offers.map(o => ({
        title: o.fullTitle,
        sectionCount: Object.keys(o.sections).length,
        sectionNames: Object.keys(o.sections)
      })),
      footerLength: footer.length
    });
    
    return {
      introduction,
      offers,
      footer
    };
  };
  
  // Helper function to preprocess markdown before parsing
  const preprocessMarkdown = (markdown: string) => {
    // Ensure we have a clean string to work with
    let processed = markdown.trim();
    
    // Normalize line endings
    processed = processed.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Ensure section dividers are properly formatted
    processed = processed.replace(/\n\s*---\s*\n/g, '\n---\n');
    
    // Ensure headers have proper spacing
    processed = processed.replace(/\n(#{1,6})\s*([^\n]+)/g, '\n$1 $2');
    
    // Normalize multiple consecutive empty lines to a single empty line
    processed = processed.replace(/\n{3,}/g, '\n\n');
    
    // Fix any potential issues with section formatting
    processed = processed.replace(/\*\*([^:*]+):\s*\*\*/g, '**$1:**');
    
    return processed;
  };
  
  // Format text with bullet points for display
  const formatTextWithBullets = (text: string) => {
    if (!text || typeof text !== 'string') return null;
    
    // Process inline formatting first
    const formatInlineText = (text: string) => {
      let formatted = text;
      
      // Handle bold text (must come before italic)
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-white">$1</span>');
      
      // Handle italic text
      formatted = formatted.replace(/\*(.*?)\*/g, '<span class="italic text-white/90">$1</span>');
      
      // Handle links
      formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-titleColor underline hover:text-titleColor/80 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>');
      
      return formatted;
    };
    
    // Start with the text
    let processedText = text;
    
    // Remove any H3 headers (### Header) as they should be handled separately
    processedText = processedText.replace(/^###\s+.*$/gm, '');
    
    // Process headers (h2, h3, h4)
    processedText = processedText
      .replace(/^##\s+(.*?)$/gm, '<div class="text-2xl font-bold text-titleColor mt-6 mb-3">$1</div>')
      .replace(/^###\s+(.*?)$/gm, '<div class="text-xl font-bold text-titleColor mt-4 mb-2">$1</div>')
      .replace(/^####\s+(.*?)$/gm, '<div class="text-lg font-bold text-titleColor mt-4 mb-2">$1</div>');
    
    // Check if the text has bullet points or special bullet formats
    const hasBullets = /^[-•●*]|\n[-•●*]|\n-\s*\*|-\s+|\n\s*-\s+/m.test(processedText);
    
    if (hasBullets) {
      // Split by lines to process bullet points
      const lines = processedText.split('\n');
      let inList = false;
      let inNestedList = false; 
      let listItems: string[] = [];
      let nestedItems: string[] = [];
      let result: string[] = [];
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // Check for various bullet point patterns
        const bulletMatch = trimmedLine.match(/^([-•●*])\s+(.*)/);
        const indentedBulletMatch = trimmedLine.match(/^\s+([-•●*])\s+(.*)/);
        const specialBulletMatch = trimmedLine.match(/^-\s*\*([^:*]+):\*\s*(.*)/);
        
        if (specialBulletMatch) {
          // This is a special format with a section title
          if (inList) {
            // End previous list if we were in one
            result.push(`<ul class="list-disc pl-5 space-y-1">${listItems.join('')}</ul>`);
            listItems = [];
            inList = false;
          }
          
          const [, sectionTitle, content] = specialBulletMatch;
          result.push(`
            <div class="mt-4">
              <div class="font-semibold text-titleColor">${sectionTitle.trim()}:</div>
              <div class="pl-4">${formatInlineText(content.trim())}</div>
            </div>
          `);
        } else if (indentedBulletMatch) {
          // Indented/nested bullet point
          const [, bullet, content] = indentedBulletMatch;
          
          if (!inNestedList) {
            inNestedList = true;
            // If we're starting a nested list within a list item, add it to the last list item
            if (listItems.length > 0) {
              const lastItem = listItems.pop() || '';
              listItems.push(`${lastItem}<ul class="list-circle pl-4 mt-1 space-y-1">`);
            } else {
              // If there's no parent list item, just start a new list
              result.push(`<ul class="list-circle pl-8 space-y-1">`);
            }
          }
          
          // Add the nested item
          if (listItems.length > 0) {
            nestedItems.push(`<li class="my-1">${formatInlineText(content.trim())}</li>`);
          } else {
            result.push(`<li class="my-1">${formatInlineText(content.trim())}</li>`);
          }
        } else if (bulletMatch) {
          // Standard bullet point
          if (inNestedList) {
            // End previous nested list
            if (listItems.length > 0) {
              listItems.push(`${nestedItems.join('')}</ul>`);
              nestedItems = [];
            } else {
              result.push(`${nestedItems.join('')}</ul>`);
              nestedItems = [];
            }
            inNestedList = false;
          }
          
          if (!inList) {
            inList = true;
          }
          
          const [, bullet, content] = bulletMatch;
          listItems.push(`<li class="my-1">${formatInlineText(content.trim())}</li>`);
        } else if (trimmedLine === '') {
          // Empty line
          if (inNestedList) {
            // End nested list
            if (listItems.length > 0) {
              listItems.push(`${nestedItems.join('')}</ul>`);
              nestedItems = [];
            } else {
              result.push(`${nestedItems.join('')}</ul>`);
              nestedItems = [];
            }
            inNestedList = false;
          }
          
          if (inList) {
            // End the list
            result.push(`<ul class="list-disc pl-5 space-y-1">${listItems.join('')}</ul>`);
            listItems = [];
            inList = false;
          }
          
          result.push('<div class="my-2"></div>');
        } else {
          // Regular paragraph
          if (inNestedList) {
            // End nested list
            if (listItems.length > 0) {
              listItems.push(`${nestedItems.join('')}</ul>`);
              nestedItems = [];
            } else {
              result.push(`${nestedItems.join('')}</ul>`);
              nestedItems = [];
            }
            inNestedList = false;
          }
          
          if (inList) {
            // End the list
            result.push(`<ul class="list-disc pl-5 space-y-1">${listItems.join('')}</ul>`);
            listItems = [];
            inList = false;
          }
          
          // Check if this is a section divider
          if (trimmedLine === '---') {
            result.push('<hr class="my-4 border-subtitleColor/20" />');
          } else {
            result.push(`<div class="mb-3 text-subtitleColor">${formatInlineText(trimmedLine)}</div>`);
          }
        }
      });
      
      // Handle any remaining nested items
      if (inNestedList && nestedItems.length > 0) {
        if (listItems.length > 0) {
          listItems.push(`${nestedItems.join('')}</ul>`);
        } else {
          result.push(`${nestedItems.join('')}</ul>`);
        }
      }
      
      // Handle any remaining list items
      if (inList && listItems.length > 0) {
        result.push(`<ul class="list-disc pl-5 space-y-1">${listItems.join('')}</ul>`);
      }
      
      return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: result.join('') }} />;
    } else {
      // No bullet points, just format the text with paragraphs
      const paragraphs = processedText.split('\n\n');
      
      return (
        <div className="prose prose-invert max-w-none">
          {paragraphs.map((paragraph, index) => {
            // Skip empty paragraphs
            if (!paragraph.trim()) return null;
            
            // Check if this is a section divider
            if (paragraph.trim() === '---') {
              return <hr key={index} className="my-4 border-subtitleColor/20" />;
            }
            
            // Split by newlines and process each line
            const lines = paragraph.split('\n');
            return (
              <div key={index} className="mb-4">
                {lines.map((line, lineIndex) => {
                  // Skip empty lines
                  if (!line.trim()) return null;
                  
                  return (
                    <div 
                      key={lineIndex} 
                      className={`${lineIndex > 0 ? 'mt-2' : ''} text-subtitleColor`}
                      dangerouslySetInnerHTML={{ __html: formatInlineText(line) }} 
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    }
  };
  
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
    const formattedContent = convertToDownloadFormat();
    const element = document.createElement('a');
    const file = new Blob([formattedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'One-Time-Offer.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Function to convert the offer content to a downloadable format
  const convertToDownloadFormat = () => {
    try {
      const parsedData = parseContent(content);
      
      let result = '';
      
      // Add introduction
      if (parsedData.introduction) {
        result += parsedData.introduction + '\n\n';
      }
      
      // Add offers
      if (parsedData.offers?.length > 0) {
        result += '-----\n\n';
        
        parsedData.offers.forEach((offer, index) => {
          result += `${offer.fullTitle}\n\n`;
          
          // Add offer sections
          Object.entries(offer.sections).forEach(([sectionTitle, sectionContent]) => {
            result += `${sectionTitle}:\n${sectionContent}\n\n`;
          });
          
          if (index < parsedData.offers.length - 1) {
            result += '-----\n\n';
          }
        });
      }
      
      // Add footer
      if (parsedData.footer) {
        result += '-----\n\n' + parsedData.footer;
      }
      
      return result;
    } catch (error) {
      console.error('Error converting to download format:', error);
      return 'Error converting content. Please try again.';
    }
  };

  // Print functionality - also used for PDF export
  const handlePrint = (isPdf = false) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = formatContentForPrint(content, isPdf);
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      if (isPdf) {
        // Add instructions for PDF saving
        alert('Select "Save as PDF" in your browser print dialog to download the PDF');
      }
      
      printWindow.print();
      // Don't close the window for PDF so user can save it
      if (!isPdf) {
        printWindow.close();
      }
    }
  };
  
  // Handle PDF export
  const handlePdfExport = () => {
    handlePrint(true); // Call print with PDF flag set to true
  };
  
  // Format content for printing/PDF
  const formatContentForPrint = (content: string, isPdf: boolean) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>One-Time Offers</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 2rem;
              line-height: 1.6;
              color: #333;
              background-color: #fff;
            }
            h1 { 
              font-size: 24px; 
              color: #1a1a1a;
              border-bottom: 2px solid #555;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            h2 { 
              font-size: 20px; 
              color: #1a1a1a;
              margin-top: 30px;
              margin-bottom: 15px;
            }
            h3 { 
              font-size: 18px; 
              color: #333;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            .offer { 
              margin-bottom: 30px; 
              padding-bottom: 20px; 
              border-bottom: 1px solid #ddd; 
              page-break-inside: avoid;
            }
            .offer-title {
              font-weight: bold;
              font-size: 18px;
              background-color: #f5f5f5;
              padding: 10px;
              border-left: 4px solid #555;
              margin-bottom: 15px;
            }
            .section-title {
              font-weight: bold;
              margin-top: 15px;
              margin-bottom: 5px;
            }
            ul, ol { 
              margin: 10px 0; 
              padding-left: 25px; 
            }
            li { 
              margin-bottom: 5px; 
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-style: italic;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
            .bullet-list {
              margin-left: 0;
              list-style-type: disc;
            }
            .sub-bullet {
              margin-left: 20px;
              list-style-type: circle;
            }
            .pdf-note {
              display: ${isPdf ? 'block' : 'none'};
              background-color: #f8f9fa;
              border: 1px solid #ddd;
              padding: 10px;
              margin: 20px 0;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <h1>One-Time Offers</h1>
          <div class="pdf-note">
            This document was generated from the One-Time Offer Generator.
          </div>
          ${formatPrintContent(content, isPdf)}
        </body>
      </html>
    `;
  };
  
  // Helper for formatting print content
  const formatPrintContent = (content: string, isPdf: boolean): string => {
    const parsedContent = parseContent(content);
    
    let printContent = '';
    
    // Add introduction
    if (parsedContent.introduction) {
      printContent += `<div class="intro">
        <h2>Introduction to One-Time Offers</h2>
        ${preprocessTextForPrint(parsedContent.introduction)}
      </div>`;
    }
    
    // Add offers
    if (parsedContent.offers?.length > 0) {
      printContent += `<div class="offers">`;
      
      parsedContent.offers.forEach(offer => {
        printContent += `<div class="offer">
          <div class="offer-title">${offer.fullTitle}</div>`;
        
        Object.entries(offer.sections).forEach(([sectionTitle, sectionContent]) => {
          printContent += `<div class="section-title">${sectionTitle}</div>
          <div>${
            preprocessTextForPrint(sectionContent)
          }</div>`;
        });
        
        printContent += `</div>`;
      });
      
      printContent += `</div>`;
    }
    
    // Add footer
    if (parsedContent.footer) {
      printContent += `<div class="footer">${preprocessTextForPrint(parsedContent.footer)}</div>`;
    }
    
    return printContent;
  };
  
  // Helper function to preprocess text for printing
  const preprocessTextForPrint = (text: string): string => {
    // Handle null or undefined
    if (!text) return '';
    
    // Process markdown formatting for HTML display
    let processedText = text;
    
    // Remove markdown header prefixes (# Introduction) as we handle those separately
    processedText = processedText.replace(/^#+\s+(.*?)$/gm, '$1');
    
    // Handle markdown bold
    processedText = processedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Handle markdown italic
    processedText = processedText.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    
    // Handle markdown bullet points
    let bulletProcessed = '';
    let inList = false;
    
    const lines = processedText.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.match(/^[-•●*]\s+/)) {
        // Start a list if we're not already in one
        if (!inList) {
          bulletProcessed += '<ul class="bullet-list">\n';
          inList = true;
        }
        
        // Add list item
        const content = line.replace(/^[-•●*]\s+/, '');
        bulletProcessed += `<li>${content}</li>\n`;
      } else if (line.match(/^\s+[-•●*]\s+/)) {
        // Nested bullet point - assume we're already in a list
        const content = line.replace(/^\s+[-•●*]\s+/, '');
        bulletProcessed += `<li class="sub-bullet">${content}</li>\n`;
      } else {
        // Close list if we were in one
        if (inList) {
          bulletProcessed += '</ul>\n';
          inList = false;
        }
        
        // Regular paragraph
        if (line) {
          bulletProcessed += `<p>${line}</p>\n`;
        } else if (i > 0 && i < lines.length - 1 && !lines[i-1].match(/^[-•●*]\s+/) && !lines[i+1].match(/^[-•●*]\s+/)) {
          // Empty line between paragraphs (not before/after lists)
          bulletProcessed += '<br />\n';
        }
      }
    }
    
    // Close any open list
    if (inList) {
      bulletProcessed += '</ul>\n';
    }
    
    return bulletProcessed;
  };
  
  // Format the content for display with expandable offers
  const formatContentForDisplay = () => {
    if (!content || content.trim() === '') {
      return (
        <div className="text-center p-8 bg-black/30 rounded-lg border border-subtitleColor/10">
          <p className="text-subtitleColor text-lg">No content to display.</p>
          <p className="text-subtitleColor/70 mt-2">Generate a new offer to see results here.</p>
        </div>
      );
    }
    
    if (activeTab === 'raw') {
      return (
        <div className="whitespace-pre-wrap text-subtitleColor p-6 bg-black/30 rounded-lg overflow-auto max-h-screen border border-subtitleColor/10">
          {content}
        </div>
      );
    }
    
    const parsedData = parseContent(content);
    
    // Check if parsing was successful
    const hasValidData = (parsedData.offers && parsedData.offers.length > 0) || 
                         parsedData.introduction || 
                         parsedData.footer;
    
    if (!hasValidData) {
      return (
        <div className="text-center p-8 bg-black/30 rounded-lg border border-subtitleColor/10">
          <p className="text-subtitleColor text-lg">Unable to parse the content properly.</p>
          <p className="text-subtitleColor/70 mt-2">You can view the raw content by clicking the "Raw Text" button above.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-8">
        {/* Introduction section */}
        {parsedData.introduction ? (
          <div className="bg-black/50 rounded-lg p-6 border border-subtitleColor/20 shadow-md">
            <div className="text-subtitleColor prose prose-invert max-w-none">
              {formatTextWithBullets(parsedData.introduction)}
            </div>
          </div>
        ) : null}
        
        {/* Offers section */}
        {parsedData.offers && parsedData.offers.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-titleColor mb-6">Recommended One-Time Offers</h3>
            <div className="grid grid-cols-1 gap-4">
              {parsedData.offers.map((offer, index) => (
                <div key={index} className="bg-black/60 rounded-lg border border-subtitleColor/30 shadow-xl overflow-hidden transition-all duration-150 hover:shadow-titleColor/10">
                  <button 
                    onClick={() => toggleOffer(index)}
                    className="w-full text-left bg-gradient-to-r from-titleColor/20 to-black/80 p-5 flex justify-between items-center group transition-all duration-300 hover:from-titleColor/30 hover:to-black/90"
                  >
                    <h4 className="font-bold text-titleColor text-xl group-hover:text-white transition-colors">
                      {offer.fullTitle}
                    </h4>
                    <span className="text-subtitleColor bg-black/40 p-2 rounded-full transform transition-transform duration-300 group-hover:bg-titleColor/10">
                      {expandedOffers[index] ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </span>
                  </button>
                  
                  {expandedOffers[index] && (
                    <div className="p-5 space-y-6 bg-black/50 animate-fadeIn">
                      {Object.entries(offer.sections).map(([sectionTitle, sectionContent], sectionIndex) => {
                        // Make sure section title is displayed properly (without asterisks)
                        const cleanSectionTitle = sectionTitle.replace(/\*/g, '').trim();
                        
                        return (
                          <div key={sectionIndex} className="space-y-4">
                            <div className="flex items-center">
                              <h5 className="text-subtitleColor font-semibold bg-gradient-to-r from-titleColor/10 to-black/60 px-4 py-2.5 rounded-md border-l-4 border-titleColor w-full shadow-sm">
                                {cleanSectionTitle}
                              </h5>
                            </div>
                            <div className="ml-2 pl-4 border-l border-subtitleColor/30 space-y-2">
                              {formatTextWithBullets(sectionContent)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Footer section */}
        {parsedData.footer && (
          <div className="bg-black/50 rounded-lg p-6 border border-subtitleColor/20 shadow-md">
            <h3 className="text-xl font-bold text-titleColor mb-4">
              Pricing Information
            </h3>
            <div className="text-subtitleColor">
              {formatTextWithBullets(parsedData.footer)}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div ref={printRef} className="flex flex-col space-y-6 print:space-y-6 py-3 print:py-0">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-titleColor">
          One-Time Offer Generator
        </h2>
        
        {/* Action buttons - organized in a card for better visibility */}
        <div className="bg-black/70 p-4 rounded-lg border border-subtitleColor/30 flex flex-wrap gap-3 shadow-md">
          {/* View toggle buttons */}
          <div className="bg-black/60 rounded-lg overflow-hidden flex mr-1 border border-subtitleColor/20">
            <button
              onClick={() => setActiveTab('formatted')}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                activeTab === 'formatted' 
                  ? 'bg-gradient-to-r from-titleColor/20 to-titleColor/5 text-titleColor' 
                  : 'text-subtitleColor hover:bg-titleColor/5'
              }`}
            >
              Formatted
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                activeTab === 'raw' 
                  ? 'bg-gradient-to-r from-titleColor/20 to-titleColor/5 text-titleColor' 
                  : 'text-subtitleColor hover:bg-titleColor/5'
              }`}
            >
              Raw Text
            </button>
          </div>
          
          {/* Main action buttons with consistent styling */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleCopy}
            className="gap-2 min-w-[105px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copySuccess || 'Copy All'}
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            TXT File
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            onClick={handlePdfExport}
            className="gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF File
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            onClick={onReset}
            className="gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            New Offer
          </Button>
        </div>
      </div>
      
      {/* Content display */}
      <div className="mt-2">
        {formatContentForDisplay()}
      </div>
    </div>
  );
}

export default OneTimeOfferResult;