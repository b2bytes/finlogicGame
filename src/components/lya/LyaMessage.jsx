import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Scale } from 'lucide-react';

export default function LyaMessage({ role, content, sources, confidence }) {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] sm:max-w-[80%] bg-foreground text-background rounded-3xl rounded-tr-md px-4 sm:px-5 py-3 shadow-soft">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 sm:gap-3">
      <div className="w-8 h-8 rounded-full bg-mint-500 flex items-center justify-center flex-shrink-0 shadow-mint">
        <Sparkles className="w-4 h-4 text-white" strokeWidth={2.4} />
      </div>
      <div className="flex-1 min-w-0 max-w-[88%] sm:max-w-[85%] bg-card border border-border rounded-3xl rounded-tl-md px-4 sm:px-5 py-3 shadow-soft">
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

        {sources && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/60">
            <p className="text-[10px] font-bold uppercase tracking-wider text-mint-700 mb-1.5 flex items-center gap-1">
              <Scale className="w-3 h-3" /> Fundamento normativo
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sources.map((s, i) => (
                <span
                  key={i}
                  className="text-[11px] font-medium text-mint-700 bg-mint-50 border border-mint-200 px-2 py-0.5 rounded-full"
                >
                  {s}
                </span>
              ))}
              {typeof confidence === 'number' && (
                <span className="text-[11px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  Score: {Math.round(confidence * 100)}/100
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}