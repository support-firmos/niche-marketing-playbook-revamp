'use client';

import { useState, useEffect, useRef } from 'react';
import Button from './Button';
import React from 'react';

interface OneTimeOfferResultProps {
  content: string;
  onReset: () => void;
}

// Used for documentation purposes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    console.log("Cleaned content for parsing:", cleanedContent.slice(0, 500) + "...");
    
    // Use a pattern-based approach that recognizes the standard structure
    
    // Normalize separators: convert various separator formats to consistent "-----"
    let normalizedContent = cleanedContent.replace(/\n\s*[-]{3,}\s*\n/g, '\n-----\n');
    normalizedContent = normalizedContent.replace(/\n\s*[•●*]\s*[-]{3,}\s*\n/g, '\n-----\n');
    normalizedContent = normalizedContent.replace(/\n\s*[-]\s+[-]{3,}\s*\n/g, '\n-----\n');
    
    // Split the content by "-----" separators
    const sections = normalizedContent
      .split("-----")
      .map(section => section.trim())
      .filter(section => section.length > 0);
    
    console.log(`Found ${sections.length} sections separated by dashes`);
    
    // Known patterns in One-Time Offers
    const INTRODUCTION_PATTERN = /introduction to one-time offers|one-time offers provide/i;
    const PRICING_PATTERN = /(?:priced between|money-back guarantee)/i;
    const OFFER_NUMBER_PATTERN = /^(?:#{1,3}\s*)?(\d+\.)\s+(?:"([^"]+)"|([^\n]+))/m;
    
    // Standard section patterns within offers
    const SECTION_PATTERNS = {
      "What It Is": /What It Is:?/i,
      "Why It Works": /Why It Works:?/i,
      "What's Required": /What'?s Required:?/i,
      "Deliverables": /Deliverables:?/i,
      "Standardization Approach": /Standardization Approach:?/i
    };
    
    // Expected sections in a complete offer
    const EXPECTED_SECTIONS = [
      "What It Is",
      "Why It Works", 
      "What's Required",
      "Deliverables",
      "Standardization Approach"
    ];
    
    // Prepare variables to hold the parsed data
    let introduction = "";
    let footer = "";
    const offers: Array<{
      number: string;
      title: string;
      fullTitle: string;
      content: string;
      sections: Record<string, string>;
    }> = [];
    
    // First, look for a pricing footer in any section
    for (let i = 0; i < sections.length; i++) {
      if (PRICING_PATTERN.test(sections[i].toLowerCase()) && 
          sections[i].length < 200 && // Pricing info is typically short
          !sections[i].match(OFFER_NUMBER_PATTERN)) { // And doesn't have an offer number
        footer = sections[i];
        console.log("Found pricing footer section");
        sections.splice(i, 1); // Remove the footer from sections
        break;
      }
    }
    
    // Then identify the introduction (typically the first section)
    if (sections.length > 0 && 
        (INTRODUCTION_PATTERN.test(sections[0].toLowerCase()) || 
         sections[0].toLowerCase().includes("introduction to one-time offers"))) {
      introduction = sections[0];
      console.log("Found introduction section");
      sections.shift(); // Remove the introduction from sections
    }
    
    // The remaining sections should be offers
    sections.forEach((section) => {
      // Check for offer title pattern - can be with or without markdown headers
      const titleMatch = section.match(OFFER_NUMBER_PATTERN);
      
      if (titleMatch) {
        const [fullMatch, number, quotedTitle, plainTitle] = titleMatch;
        const title = quotedTitle || plainTitle;
        console.log(`Found offer: ${number} ${title}`);
        
        // Extract the content after the title - clean up any markdown headers
        let offerContent = section.replace(fullMatch, '').trim();
        // Also remove any markdown headers (###) that might be in the title line
        offerContent = offerContent.replace(/^#{1,3}\s+.*$/m, '').trim();
        
        // Use a structured approach to find sections within this offer
        const sections: Record<string, string> = {};
        
        // Check if this offer has standard sections (What It Is, Why It Works, etc.)
        const hasStandardSections = EXPECTED_SECTIONS.some(sectionName => 
          offerContent.includes(`${sectionName}:`) || 
          offerContent.includes(`**${sectionName}:**`)
        );
        
        if (!hasStandardSections) {
          // Minimal format - provide basic pricing info
          sections["Price Range"] = footer || "All offers are priced between $299-$899 and include a money-back guarantee.";
        } else {
          // Complete format - try different approaches to extract sections
          
          // First try looking for bold section markers: **Section Title:**
          let foundSections = false;
          const boldSectionPattern = /\*\*([^*:]+?):\*\*\s*([\s\S]*?)(?=\n\*\*[^*:]+?:\*\*|\n?$)/g;
          let sectionMatch;
          
          while ((sectionMatch = boldSectionPattern.exec(offerContent)) !== null) {
            const [, sectionTitle, sectionContent] = sectionMatch;
            const cleanSectionTitle = sectionTitle.trim();
            sections[cleanSectionTitle] = sectionContent.trim();
            foundSections = true;
          }
          
          // If no bold sections found, try plain text sections
          if (!foundSections) {
            // Look for sections like "What It Is: content"
            for (const [sectionName, pattern] of Object.entries(SECTION_PATTERNS)) {
              const sectionRegex = new RegExp(`${pattern.source}\\s*([\\s\\S]*?)(?=(?:\\n(?:${Object.values(SECTION_PATTERNS).map(p => p.source).join('|')}))|\\n?$)`, 'i');
              const match = offerContent.match(sectionRegex);
              
              if (match && match[1]) {
                sections[sectionName] = match[1].trim();
                foundSections = true;
              }
            }
          }
          
          // If still no sections found, but we have content, use it as a description
          if (!foundSections && offerContent.trim()) {
            sections["Description"] = offerContent.trim();
          }
        }
        
        offers.push({
          number,
          title: title.trim(),
          fullTitle: `${number} ${title.trim()}`,
          content: offerContent,
          sections
        });
      } else if (section.trim() && !footer && PRICING_PATTERN.test(section)) {
        // If we couldn't identify a section as an offer but it contains pricing info, it's likely the footer
        footer = section;
        console.log("Found pricing footer section (fallback)");
      }
    });
    
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
    
    // Log sample of the incoming content for debugging
    console.log("Raw content sample:", processed.slice(0, 300) + "...");
    
    // Normalize line endings
    processed = processed.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Ensure section dividers are properly formatted
    // Handle any kind of horizontal divider variation (dashes of any length)
    processed = processed.replace(/\n\s*[-]{3,}\s*\n/g, '\n-----\n');
    processed = processed.replace(/\n\s*[•●*]\s+[-]{3,}\s*\n/g, '\n-----\n');
    processed = processed.replace(/\n\s*[-]\s+[-]{3,}\s*\n/g, '\n-----\n');
    
    // Handle single-line separators
    processed = processed.replace(/^[-]{3,}$/gm, '-----');
    
    // Ensure headers have proper spacing
    processed = processed.replace(/\n(#{1,6})\s*([^\n]+)/g, '\n$1 $2');
    
    // Normalize multiple consecutive empty lines to a single empty line
    processed = processed.replace(/\n{3,}/g, '\n\n');
    
    // Fix any potential issues with section formatting
    processed = processed.replace(/\*\*([^:*]+):\s*\*\*/g, '**$1:**');
    
    // Ensure consistent list formatting (- items should have a space after the dash)
    processed = processed.replace(/\n-([^\s-])/g, '\n- $1');
    
    // Ensure proper spacing between section titles and content
    processed = processed.replace(/\*\*([^*:]+?):\*\*([^\n])/g, '**$1:** $2');
    
    // Ensure section titles without markdown have proper spacing
    processed = processed.replace(/\n([A-Za-z]['A-Za-z\s]+):\s*/g, '\n$1: ');
    
    return processed;
  };
  
  // Improved markdown formatting function with better handling of all elements
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
      
      // Handle backtick code blocks
      formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-black/60 px-1.5 py-0.5 rounded text-sm font-mono text-titleColor">$1</code>');
      
      return formatted;
    };
    
    // Start with the text
    let processedText = text;
    
    // Normalize line breaks to make processing more consistent
    processedText = processedText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Handle horizontal rules/separators before anything else (match lines with any number of dashes)
    processedText = processedText.replace(/^-{3,}$/gm, '<hr class="border-t border-gray-700 my-4" />');
    
    // Handle markdown headers
    processedText = processedText.replace(/^#\s+(.*?)$/gm, '<h1 class="text-2xl font-bold text-titleColor mb-4">$1</h1>');
    processedText = processedText.replace(/^##\s+(.*?)$/gm, '<h2 class="text-xl font-bold text-titleColor mb-3">$1</h2>');
    processedText = processedText.replace(/^###\s+(.*?)$/gm, '<h3 class="text-lg font-bold text-titleColor mb-2">$1</h3>');
    
    // Check if the text has bullet points - specifically look for dash/bullet followed by space
    // We're using a more specific regex to avoid matching separator lines (multiple dashes)
    const hasBullets = /^[-•●*]\s+|\n[-•●*]\s+/.test(processedText);
    
    if (hasBullets) {
      // Process bullet point lists
      const processedLines: string[] = [];
      const lines = processedText.split('\n');
      let inList = false;
      let currentList: string[] = [];
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // Check if this line is just a horizontal separator (3+ dashes)
        if (/^-{3,}$/.test(trimmedLine)) {
          // If we were in a list, end it
          if (inList) {
            processedLines.push(`<ul class="list-disc pl-5 space-y-1">${currentList.join('')}</ul>`);
            inList = false;
            currentList = [];
          }
          
          // Add horizontal separator
          processedLines.push('<hr class="border-t border-gray-700 my-4" />');
          return;
        }
        
        // Check if this line is a bullet point (dash/bullet followed by space)
        if (trimmedLine.match(/^[-•●*]\s+/)) {
          if (!inList) {
            inList = true;
            currentList = [];
          }
          
          // Format the bullet point content
          const content = trimmedLine.replace(/^[-•●*]\s+/, '');
          currentList.push(`<li class="py-1">${formatInlineText(content)}</li>`);
        } else {
          // If not a bullet point and we were in a list, end the list
          if (inList) {
            processedLines.push(`<ul class="list-disc pl-5 space-y-1">${currentList.join('')}</ul>`);
            inList = false;
            currentList = [];
          }
          
          // Regular text
          if (trimmedLine) {
            processedLines.push(`<p class="pb-2">${formatInlineText(trimmedLine)}</p>`);
          } else {
            // Empty line - add spacing
            processedLines.push('<div class="h-2"></div>');
          }
        }
      });
      
      // If we ended with an open list, close it
      if (inList) {
        processedLines.push(`<ul class="list-disc pl-5 space-y-1">${currentList.join('')}</ul>`);
      }
      
      return <div dangerouslySetInnerHTML={{ __html: processedLines.join('') }} className="text-subtitleColor/90" />;
    } else {
      // No bullet points, format as regular paragraphs
      const paragraphs = processedText.split('\n\n').filter(p => p.trim().length > 0);
      
      if (paragraphs.length === 0) {
        // If no paragraphs, try splitting by single newlines
        const lines = processedText.split('\n').filter(line => line.trim().length > 0);
        return (
          <div className="text-subtitleColor/90 space-y-2">
            {lines.map((line, index) => (
              <div key={index} dangerouslySetInnerHTML={{ __html: formatInlineText(line) }} />
            ))}
          </div>
        );
      }
      
      return (
        <div className="text-subtitleColor/90 space-y-3">
          {paragraphs.map((paragraph, index) => (
            <div key={index} dangerouslySetInnerHTML={{ __html: formatInlineText(paragraph) }} />
          ))}
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          <p className="text-subtitleColor/70 mt-2">You can view the raw content by clicking the &quot;Raw Text&quot; button above.</p>
        </div>
      );
    }
    
    // Check if we're dealing with minimal format
    const isMinimalFormat = parsedData.offers.length > 0 && 
                          parsedData.offers.every(offer => 
                            !offer.content || // No content beyond title
                            Object.keys(offer.sections).length <= 1 || // Only price info
                            offer.sections["Price Range"]?.includes("$299-$899")); // Has generic price info
    
    // Get the cleaned introduction content (remove markdown headers)
    const cleanIntroduction = parsedData.introduction ? 
                             parsedData.introduction.replace(/^#\s+Introduction.*?(\n|$)/i, '') : '';
    
    return (
      <div className="space-y-8">
        {/* Introduction section */}
        {parsedData.introduction ? (
          <div className="bg-black/50 rounded-lg p-6 border border-subtitleColor/20 shadow-md">
            <h2 className="text-2xl font-bold text-titleColor mb-4">Introduction to One-Time Offers</h2>
            <div className="text-subtitleColor prose prose-invert max-w-none">
              {formatTextWithBullets(cleanIntroduction)}
            </div>
          </div>
        ) : null}
        
        {/* Minimal format notice */}
        {isMinimalFormat && (
          <div className="bg-black/70 rounded-lg p-4 border border-yellow-600/30 shadow-md">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-subtitleColor/90">
                This is a minimal format offer list with titles only. Detailed sections for each offer are not available.
              </p>
            </div>
          </div>
        )}
        
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
                      {isMinimalFormat ? (
                        <div className="text-subtitleColor/80 italic border-l-4 border-subtitleColor/20 pl-4 py-2">
                          This is a minimal offer listing. Detailed information about this offer is not available in this format.
                        </div>
                      ) : null}
                      
                      {/* Display sections in the expected order if this is a complete format */}
                      {!isMinimalFormat && Object.keys(offer.sections).length > 1 ? (
                        // Complete format - display all sections in standard order
                        ["What It Is", "Why It Works", "What's Required", "Deliverables", "Standardization Approach"]
                          .filter(sectionName => offer.sections[sectionName])
                          .map((sectionName, sectionIndex) => (
                            <div key={sectionIndex} className="space-y-4">
                              <div className="flex items-center">
                                <h5 className="text-subtitleColor font-semibold bg-gradient-to-r from-titleColor/10 to-black/60 px-4 py-2.5 rounded-md border-l-4 border-titleColor w-full shadow-sm">
                                  {sectionName}
                                </h5>
                              </div>
                              <div className="ml-2 pl-4 border-l border-subtitleColor/30 space-y-2">
                                {formatTextWithBullets(offer.sections[sectionName])}
                              </div>
                            </div>
                          ))
                      ) : (
                        // Minimal format - just show price range
                        <div className="mt-4">
                          <h5 className="text-subtitleColor font-semibold bg-gradient-to-r from-titleColor/10 to-black/60 px-4 py-2.5 rounded-md border-l-4 border-titleColor w-full shadow-sm">
                            Price Range
                          </h5>
                          <div className="ml-2 pl-4 border-l border-subtitleColor/30 mt-3">
                            <p className="text-subtitleColor/90">$299-$899</p>
                            <p className="text-subtitleColor/80 text-sm mt-1">
                              All offers include a money-back guarantee if you don&apos;t save or earn more than what you paid.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Footer section */}
        {parsedData.footer && !isMinimalFormat && (
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