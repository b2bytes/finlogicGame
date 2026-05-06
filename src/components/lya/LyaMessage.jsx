import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles } from 'lucide-react';

export default function LyaMessage({ role, content }) {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-foreground text-background rounded-3xl rounded-tr-md px-5 py-3 shadow-soft">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-mint-500 flex items-center justify-center flex-shrink-0 shadow-mint">
        <Sparkles className="w-4 h-4 text-white" strokeWidth={2.4} />
      </div>
      <div className="max-w-[85%] bg-card border border-border rounded-3xl rounded-tl-md px-5 py-3 shadow-soft">
        <ReactMarkdown
          className="text-sm prose prose-sm max-w-none text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
          components={{
            p: ({ children }) => <p className="my-1.5 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="my-1.5 ml-4 list-disc space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="my-1.5 ml-4 list-decimal space-y-1">{children}</ol>,
            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
            a: ({ children, ...props }) => (
              <a {...props} target="_blank" rel="noreferrer" className="text-mint-700 underline">
                {children}
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}