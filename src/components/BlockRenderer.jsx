import React from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BACKEND_URL}${url}`;
};

// Get styles object for block rendering
const getBlockStyles = (block) => {
    const styles = block.data?.styles || {};
    const css = {};

    // Width
    switch (styles.width) {
        case 'wide': css.maxWidth = '80%'; break;
        case 'medium': css.maxWidth = '60%'; break;
        case 'narrow': css.maxWidth = '40%'; break;
        case 'custom': css.maxWidth = styles.customWidth; break;
        default: css.maxWidth = '100%';
    }

    // Height
    if (styles.height) {
        css.height = `${styles.height}${styles.heightUnit || 'px'}`;
    }

    // Alignment
    if (styles.align === 'center') {
        css.marginLeft = 'auto';
        css.marginRight = 'auto';
    }
    if (styles.align === 'right') {
        css.marginLeft = 'auto';
    }

    // Padding
    if (styles.paddingTop) css.paddingTop = `${styles.paddingTop}px`;
    if (styles.paddingRight) css.paddingRight = `${styles.paddingRight}px`;
    if (styles.paddingBottom) css.paddingBottom = `${styles.paddingBottom}px`;
    if (styles.paddingLeft) css.paddingLeft = `${styles.paddingLeft}px`;

    // Margin
    if (styles.marginTop) css.marginTop = `${styles.marginTop}px`;
    if (styles.marginBottom) css.marginBottom = `${styles.marginBottom}px`;

    // Background
    if (styles.backgroundColor && styles.backgroundColor !== '#ffffff') {
        css.backgroundColor = styles.backgroundColor;
    }

    // Border Radius
    if (styles.borderRadius) {
        css.borderRadius = `${styles.borderRadius}px`;
    }

    return css;
};

// Font size class mapping
const getFontSizeClass = (fontSize) => {
    switch (fontSize) {
        case 'sm': return 'text-sm';
        case 'base': return 'text-base';
        case 'lg': return 'text-lg';
        case 'xl': return 'text-xl';
        case '2xl': return 'text-2xl';
        case '3xl': return 'text-3xl';
        default: return '';
    }
};

const BlockRenderer = ({ content }) => {
    const parseContent = () => {
        if (!content) return null;
        if (typeof content === 'string') {
            try {
                return JSON.parse(content);
            } catch {
                return {
                    blocks: [{ type: 'paragraph', data: { text: content } }]
                };
            }
        }
        return content;
    };

    const data = parseContent();
    if (!data || !data.blocks) return null;

    const renderBlock = (block, index) => {
        const key = block.id || `block-${index}`;
        const blockStyles = getBlockStyles(block);
        const fontSizeClass = getFontSizeClass(block.data?.styles?.fontSize);

        switch (block.type) {
            case 'heading':
            case 'header':
                const level = block.data.level || 2;
                const HeadingTag = `h${level}`;
                const headingBaseClasses = {
                    1: 'text-4xl font-black mb-6 mt-10',
                    2: 'text-3xl font-bold mb-5 mt-8',
                    3: 'text-2xl font-bold mb-4 mt-6',
                    4: 'text-xl font-semibold mb-3 mt-5',
                };
                return (
                    <HeadingTag
                        key={key}
                        className={`text-slate-900 ${fontSizeClass || headingBaseClasses[level] || headingBaseClasses[2]}`}
                        style={blockStyles}
                    >
                        {block.data.text}
                    </HeadingTag>
                );

            case 'paragraph':
                if (!block.data.text) return null;
                return (
                    <p
                        key={key}
                        className={`text-slate-600 leading-relaxed mb-6 ${fontSizeClass || 'text-lg'}`}
                        style={blockStyles}
                    >
                        {block.data.text}
                    </p>
                );

            case 'spacer':
                return (
                    <div
                        key={key}
                        style={{
                            ...blockStyles,
                            height: blockStyles.height || '50px'
                        }}
                    />
                );

            case 'list':
                const items = block.data.items || [];
                if (items.length === 0) return null;
                const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                const listClass = block.data.style === 'ordered' ? 'list-decimal' : 'list-disc';
                return (
                    <ListTag
                        key={key}
                        className={`${listClass} ml-6 mb-6 space-y-2 text-slate-600 ${fontSizeClass || 'text-lg'}`}
                        style={blockStyles}
                    >
                        {items.filter(item => item).map((item, i) => (
                            <li key={i} className="leading-relaxed">
                                {item}
                            </li>
                        ))}
                    </ListTag>
                );

            case 'image':
                const imageUrl = block.data.url || block.data.file?.url;
                if (!imageUrl) return null;
                return (
                    <figure key={key} className="my-8" style={blockStyles}>
                        <img
                            src={getImageUrl(imageUrl)}
                            alt={block.data.caption || ''}
                            className="w-full rounded-2xl shadow-lg"
                            style={{
                                height: blockStyles.height || 'auto',
                                objectFit: 'cover',
                                borderRadius: blockStyles.borderRadius || undefined
                            }}
                        />
                        {block.data.caption && (
                            <figcaption className="text-center text-sm text-slate-500 mt-3 italic">
                                {block.data.caption}
                            </figcaption>
                        )}
                    </figure>
                );

            case 'quote':
                if (!block.data.text) return null;
                return (
                    <blockquote
                        key={key}
                        className="border-l-4 border-orange-500 pl-6 my-8 italic"
                        style={blockStyles}
                    >
                        <p className={`text-slate-700 mb-2 ${fontSizeClass || 'text-xl'}`}>
                            {block.data.text}
                        </p>
                        {block.data.author && (
                            <cite className="text-sm text-slate-500 not-italic">
                                — {block.data.author}
                            </cite>
                        )}
                        {block.data.caption && (
                            <cite className="text-sm text-slate-500 not-italic">
                                — {block.data.caption}
                            </cite>
                        )}
                    </blockquote>
                );

            case 'code':
                if (!block.data.code) return null;
                return (
                    <pre
                        key={key}
                        className="bg-slate-900 text-slate-100 rounded-xl p-6 my-6 overflow-x-auto"
                        style={blockStyles}
                    >
                        <code className="text-sm font-mono">{block.data.code}</code>
                    </pre>
                );

            case 'divider':
            case 'delimiter':
                return (
                    <div key={key} className="flex items-center justify-center my-10" style={blockStyles}>
                        <span className="text-slate-300 tracking-[0.5em] text-lg">• • •</span>
                    </div>
                );

            case 'video':
            case 'embed':
                const videoUrl = block.data.url || block.data.embed;
                if (!videoUrl) return null;

                let embedUrl = videoUrl;
                if (videoUrl.includes('youtube.com/watch')) {
                    embedUrl = videoUrl.replace('watch?v=', 'embed/');
                } else if (videoUrl.includes('youtu.be/')) {
                    embedUrl = videoUrl.replace('youtu.be/', 'youtube.com/embed/');
                }

                return (
                    <div
                        key={key}
                        className="relative my-8 rounded-2xl overflow-hidden shadow-lg"
                        style={{
                            ...blockStyles,
                            aspectRatio: blockStyles.height ? undefined : '16/9'
                        }}
                    >
                        <iframe
                            src={embedUrl}
                            className="absolute inset-0 w-full h-full"
                            frameBorder="0"
                            allowFullScreen
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="block-content">
            {data.blocks.map(renderBlock)}
        </div>
    );
};

export default BlockRenderer;
