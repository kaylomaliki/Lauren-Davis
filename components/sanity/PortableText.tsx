import { PortableText as PortableTextComponent } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import Image from "next/image";
import { urlForImage } from "@/lib/image";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

interface PortableTextProps {
  content: PortableTextBlock[] | null | undefined;
}

/**
 * Portable Text Renderer
 * 
 * Renders Sanity's portable text content (rich text blocks).
 * Handles text formatting, links, and embedded images.
 */
export default function PortableText({ content }: PortableTextProps) {
  if (!content || !Array.isArray(content) || content.length === 0) {
    return null;
  }

  try {
    return (
      <PortableTextComponent
        value={content}
        components={{
        // Customize block styles
        block: {
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold mt-8 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-bold mt-6 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-semibold mt-4 mb-2">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xl font-semibold mt-3 mb-2">{children}</h4>
          ),
          normal: ({ children }) => (
            <p className="mb-4 leading-relaxed">{children}</p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
              {children}
            </blockquote>
          ),
        },
        // Customize inline marks - handles all Sanity mark types
        marks: {
          // Bold text
          strong: ({ children }) => (
            <strong className="font-bold" style={{ fontWeight: 700 }}>{children}</strong>
          ),
          // Italic text
          em: ({ children }) => (
            <em className="italic" style={{ fontStyle: 'italic' }}>{children}</em>
          ),
          // Inline code
          code: ({ children }) => (
            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          ),
          // Underline
          underline: ({ children }) => (
            <span className="underline" style={{ textDecoration: 'underline' }}>{children}</span>
          ),
          // Strikethrough
          strike: ({ children }) => (
            <span className="line-through" style={{ textDecoration: 'line-through' }}>{children}</span>
          ),
          // Links
          link: ({ value, children }) => {
            if (!value?.href) {
              return <span>{children}</span>;
            }
            const target = value?.blank ? "_blank" : undefined;
            const rel = value?.blank ? "noopener noreferrer" : undefined;
            return (
              <a
                href={value.href}
                target={target}
                rel={rel}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {children}
              </a>
            );
          },
        },
        // Customize image rendering
        types: {
          image: ({ value }: { value: any }) => {
            // Type guard to ensure value is an object with asset property
            if (!value || typeof value !== "object" || !value.asset) return null;

            try {
              const imageUrl = urlForImage(value)
                .width(1200)
                .height(800)
                .fit("max")
                .url();

              return (
                <figure className="my-8">
                  <Image
                    src={imageUrl}
                    alt={value.alt || "Image"}
                    width={1200}
                    height={800}
                    className="rounded-lg"
                    style={{ width: "100%", height: "auto" }}
                  />
                  {value.alt && (
                    <figcaption className="text-sm text-gray-600 mt-2 text-center">
                      {value.alt}
                    </figcaption>
                  )}
                </figure>
              );
            } catch (error) {
              console.error("Error rendering image in PortableText:", error);
              return null;
            }
          },
        },
        // Customize list rendering
        list: {
          bullet: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
          ),
          number: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
          ),
        },
        listItem: {
          bullet: ({ children }) => <li className="ml-4">{children}</li>,
          number: ({ children }) => <li className="ml-4">{children}</li>,
        },
      }}
      />
    );
  } catch (error) {
    console.error("Error rendering PortableText:", error);
    return null;
  }
}


