"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MessageContentProps {
  content: string
  type: 'user' | 'assistant'
  isStreaming?: boolean
}

export function MessageContent({ content, type, isStreaming = false }: MessageContentProps) {
  if (type === 'user') {
    // Simple text rendering for user messages
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
        {content}
      </p>
    )
  }

  // Rich markdown rendering for assistant messages
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert overflow-x-hidden break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props: any) {
            const { className, children } = props
            const inline = !className?.includes('language-')
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                className="rounded-md text-xs overflow-x-auto max-w-full"
                wrapLongLines={true}
                customStyle={{
                  maxWidth: '100%',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
                {...(props as any)}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-muted px-1 py-0.5 rounded text-xs break-words overflow-wrap-anywhere" {...props}>
                {children}
              </code>
            )
          },
          p: ({ children }) => (
            <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="text-sm space-y-1 mb-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="text-sm space-y-1 mb-2">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm">{children}</li>
          ),
          h1: ({ children }) => (
            <h1 className="text-lg font-bold mb-3 text-foreground">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-bold mb-2 text-foreground">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-bold mb-2 text-foreground">{children}</h3>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary pl-3 text-sm italic text-muted-foreground mb-2">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-primary hover:text-primary/80 underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-border">
              <table className="min-w-full divide-y divide-border">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-background divide-y divide-border/50">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left font-bold text-sm text-foreground border-b border-border">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-foreground">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Streaming cursor for typing animation - only show if there's content */}
      {isStreaming && content.trim().length > 0 && (
        <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 align-bottom"></span>
      )}
    </div>
  )
}