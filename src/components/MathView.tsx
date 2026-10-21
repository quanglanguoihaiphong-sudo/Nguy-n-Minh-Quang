import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math?: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math = '', block = false, className = '' }) => {
  const renderedHtml = useMemo(() => {
    if (!math) return '';
    try {
      // Clean up common math delimiters if passed
      const cleanMath = math.replace(/^\$\$|\$\$$/g, '').replace(/^\$|\$$/g, '').trim();
      return katex.renderToString(cleanMath, {
        displayMode: block,
        throwOnError: false,
      });
    } catch (e) {
      return math;
    }
  }, [math, block]);

  if (!math) return null;

  return (
    <span
      className={`font-serif tracking-normal text-slate-800 ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

// Component that renders mixed text with inline $...$ or block $$...$$ math
export const FormattedMathText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const parts = useMemo(() => {
    if (!text) return [];
    // Split by $$...$$ or $...$
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;
    const tokens = text.split(regex);
    return tokens;
  }, [text]);

  return (
    <div className={`leading-relaxed whitespace-pre-line ${className}`}>
      {parts.map((part, idx) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const content = part.slice(2, -2);
          return (
            <div key={idx} className="my-2.5 overflow-x-auto py-1 text-center">
              <MathView math={content} block={true} />
            </div>
          );
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const content = part.slice(1, -1);
          return <MathView key={idx} math={content} block={false} />;
        }
        return <span key={idx}>{part}</span>;
      })}
    </div>
  );
};
