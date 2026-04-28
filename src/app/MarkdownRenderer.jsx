"use client";
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';

const CodeBlock = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative rounded-lg overflow-hidden my-4 border border-[#2a2a3e]">
        <div className="flex justify-between items-center bg-[#1a1a2e] text-gray-400 px-4 py-2 text-xs font-mono">
          <span>{lang}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 hover:text-white transition-colors bg-[#252540] hover:bg-[#303050] px-2.5 py-1 rounded"
            title="Copy code"
          >
            {copied ? <Check size={14} className="text-green-400"/> : <Copy size={14} />}
            {copied ? <span className="text-green-400">Copied!</span> : 'Copy'}
          </button>
        </div>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={lang}
          PreTag="div"
          customStyle={{ margin: 0, borderRadius: 0, background: '#111118', fontSize: '13px' }}
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  }
  
  return (
    <code className={`${className} bg-[#1e1e2e] px-1.5 py-0.5 rounded text-emerald-400 font-mono text-sm`} {...props}>
      {children}
    </code>
  );
};

export const MarkdownRenderer = ({ content }) => {
  return (
    <div className="text-gray-200 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-3 text-white" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-2.5 text-white" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2 text-white" {...props} />,
          h4: ({node, ...props}) => <h4 className="text-base font-semibold mt-3 mb-1.5 text-white" {...props} />,
          p: ({node, ...props}) => <p className="my-2 leading-[1.75] text-gray-300" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-6 my-2 space-y-1.5" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-2 space-y-1.5" {...props} />,
          li: ({node, ...props}) => <li className="pl-1 text-gray-300 leading-relaxed" {...props} />,
          a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 hover:underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-3 border-[#4a4a6e] pl-4 py-1 my-3 bg-[#141420] rounded-r text-gray-400 italic" {...props} />,
          table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="w-full text-left border-collapse border border-[#2a2a3e]" {...props} /></div>,
          th: ({node, ...props}) => <th className="bg-[#1a1a2e] p-2.5 border border-[#2a2a3e] font-semibold text-gray-200" {...props} />,
          td: ({node, ...props}) => <td className="p-2.5 border border-[#2a2a3e] text-gray-300" {...props} />,
          strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />,
          hr: ({node, ...props}) => <hr className="border-[#2a2a3e] my-4" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
