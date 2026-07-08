import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";

/** Renderer overrides: external links open safely; inline code gets its own chip style. */
const components: Components = {
  a({ node: _node, ...props }) {
    return <a target="_blank" rel="noopener noreferrer" {...props} />;
  },
  code({ node: _node, className, children, ...props }) {
    const isBlock = /\blanguage-/.test(className || "");
    return (
      <code className={isBlock ? className : "sf-md-inline"} {...props}>
        {children}
      </code>
    );
  },
};

/** GitHub-flavored markdown, syntax-highlighted, themed to the amber instrument palette. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="sf-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
