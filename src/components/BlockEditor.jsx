import React, { useEffect, useRef, useCallback, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import Embed from '@editorjs/embed';
import Paragraph from '@editorjs/paragraph';
import DragDrop from 'editorjs-drag-drop';
import { adminAPI } from '../services/api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const BlockEditor = ({ initialData, onChange, placeholder = 'Start writing your story...' }) => {
    const editorRef = useRef(null);
    const holderRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    // Parse initial data if it's a string
    const getInitialData = useCallback(() => {
        if (!initialData) return { blocks: [] };
        if (typeof initialData === 'string') {
            try {
                const parsed = JSON.parse(initialData);
                return parsed.blocks ? parsed : { blocks: [] };
            } catch {
                // If it's plain text (legacy), convert to paragraph block
                if (initialData.trim()) {
                    return {
                        blocks: [
                            {
                                type: 'paragraph',
                                data: { text: initialData }
                            }
                        ]
                    };
                }
                return { blocks: [] };
            }
        }
        return initialData;
    }, [initialData]);

    useEffect(() => {
        // Cleanup previous instance
        if (editorRef.current && editorRef.current.destroy) {
            editorRef.current.destroy();
            editorRef.current = null;
        }

        if (!holderRef.current) return;

        // Clear the holder
        holderRef.current.innerHTML = '';

        const initEditor = async () => {
            try {
                const editor = new EditorJS({
                    holder: holderRef.current,
                    placeholder: placeholder,
                    data: getInitialData(),
                    autofocus: false,
                    minHeight: 300,
                    tools: {
                        header: {
                            class: Header,
                            inlineToolbar: true,
                            config: {
                                placeholder: 'Enter a heading',
                                levels: [1, 2, 3, 4],
                                defaultLevel: 2
                            }
                        },
                        paragraph: {
                            class: Paragraph,
                            inlineToolbar: true,
                        },
                        list: {
                            class: List,
                            inlineToolbar: true,
                            config: {
                                defaultStyle: 'unordered'
                            }
                        },
                        image: {
                            class: ImageTool,
                            config: {
                                uploader: {
                                    async uploadByFile(file) {
                                        try {
                                            const response = await adminAPI.uploadImage(file, 'posts');
                                            return {
                                                success: 1,
                                                file: {
                                                    url: response.url || `${BACKEND_URL}${response.path}`,
                                                }
                                            };
                                        } catch (error) {
                                            console.error('Upload failed:', error);
                                            return { success: 0 };
                                        }
                                    },
                                    async uploadByUrl(url) {
                                        return {
                                            success: 1,
                                            file: { url }
                                        };
                                    }
                                }
                            }
                        },
                        quote: {
                            class: Quote,
                            inlineToolbar: true,
                            config: {
                                quotePlaceholder: 'Enter a quote',
                                captionPlaceholder: 'Quote author'
                            }
                        },
                        code: {
                            class: Code,
                            config: {
                                placeholder: 'Enter code here...'
                            }
                        },
                        delimiter: Delimiter,
                        embed: {
                            class: Embed,
                            inlineToolbar: true,
                            config: {
                                services: {
                                    youtube: true,
                                    vimeo: true,
                                }
                            }
                        }
                    },
                    onChange: async (api, event) => {
                        if (editorRef.current) {
                            try {
                                const data = await editorRef.current.save();
                                onChange?.(data);
                            } catch (error) {
                                console.error('Editor save failed:', error);
                            }
                        }
                    },
                    onReady: () => {
                        console.log('Editor.js is ready');
                        setIsReady(true);
                        // Initialize drag and drop
                        new DragDrop(editor);
                    }
                });

                editorRef.current = editor;
            } catch (error) {
                console.error('Editor initialization failed:', error);
            }
        };

        initEditor();

        return () => {
            if (editorRef.current && editorRef.current.destroy) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, []);

    return (
        <div className="block-editor">
            <div
                id="editorjs"
                ref={holderRef}
                className="editor-holder"
            />
            <style>{`
                .editor-holder {
                    min-height: 400px;
                    padding: 20px;
                    background: #fafafa;
                    border-radius: 16px;
                    border: 2px dashed #e2e8f0;
                    transition: all 0.2s;
                }
                .editor-holder:focus-within {
                    border-color: #fb923c;
                    background: white;
                }
                
                /* Editor.js Core Styles */
                .codex-editor {
                    position: relative;
                }
                .codex-editor__redactor {
                    padding-bottom: 100px !important;
                }
                
                /* Block styles */
                .ce-block {
                    position: relative;
                }
                .ce-block__content {
                    max-width: 100%;
                    margin: 0 auto;
                    position: relative;
                }
                .ce-block--selected .ce-block__content {
                    background: #fff7ed;
                    border-radius: 8px;
                }
                
                /* Paragraph */
                .ce-paragraph {
                    font-size: 1.125rem;
                    line-height: 1.75;
                    color: #1e293b;
                    outline: none;
                    padding: 0.5rem 0;
                }
                .ce-paragraph[data-placeholder]:empty::before {
                    color: #94a3b8;
                    font-weight: 400;
                }
                
                /* Headers */
                .ce-header {
                    font-weight: 700;
                    color: #0f172a;
                    padding: 0.5rem 0;
                    outline: none;
                }
                h1.ce-header { font-size: 2.5rem; }
                h2.ce-header { font-size: 2rem; }
                h3.ce-header { font-size: 1.5rem; }
                h4.ce-header { font-size: 1.25rem; }
                
                /* Toolbar */
                .ce-toolbar {
                    position: absolute;
                    left: 0;
                    top: 0;
                }
                .ce-toolbar__content {
                    max-width: 100%;
                    margin: 0;
                    display: flex;
                    align-items: center;
                }
                .ce-toolbar__plus {
                    width: 34px;
                    height: 34px;
                    background: #1e293b;
                    color: white;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .ce-toolbar__plus:hover {
                    background: #f97316;
                    transform: scale(1.1);
                }
                .ce-toolbar__plus svg {
                    width: 16px;
                    height: 16px;
                }
                .ce-toolbar__actions {
                    position: absolute;
                    right: 0;
                    top: 0;
                }
                .ce-toolbar__settings-btn {
                    width: 34px;
                    height: 34px;
                    background: #1e293b;
                    color: white;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    margin-left: 4px;
                }
                .ce-toolbar__settings-btn:hover {
                    background: #f97316;
                }
                
                /* Popover / Block menu */
                .ce-popover {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 50px rgba(0,0,0,0.15);
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    min-width: 200px;
                }
                .ce-popover__items {
                    padding: 8px;
                }
                .ce-popover-item {
                    padding: 10px 14px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: background 0.15s;
                }
                .ce-popover-item:hover {
                    background: #fff7ed;
                }
                .ce-popover-item__icon {
                    width: 26px;
                    height: 26px;
                    border-radius: 6px;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .ce-popover-item:hover .ce-popover-item__icon {
                    background: #fed7aa;
                }
                .ce-popover-item__title {
                    font-weight: 600;
                    font-size: 14px;
                    color: #1e293b;
                }
                .ce-popover__search {
                    border-bottom: 1px solid #e2e8f0;
                    padding: 12px;
                }
                .cdx-search-field {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 8px 12px;
                    font-size: 14px;
                }
                .cdx-search-field__input {
                    border: none;
                    outline: none;
                    background: transparent;
                    font-size: 14px;
                }
                
                /* Inline toolbar */
                .ce-inline-toolbar {
                    background: #1e293b;
                    border: none;
                    border-radius: 8px;
                    padding: 4px;
                }
                .ce-inline-tool {
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                }
                .ce-inline-tool:hover {
                    background: #f97316;
                }
                .ce-inline-tool--active {
                    background: #f97316;
                }
                
                /* Conversion toolbar */
                .ce-conversion-toolbar {
                    background: #1e293b;
                    border: none;
                    border-radius: 10px;
                    padding: 4px;
                }
                .ce-conversion-tool {
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                }
                .ce-conversion-tool:hover {
                    background: #f97316;
                }
                
                /* Settings */
                .ce-settings {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 50px rgba(0,0,0,0.15);
                    border: 1px solid #e2e8f0;
                    padding: 8px;
                }
                .ce-settings__button {
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    cursor: pointer;
                }
                .ce-settings__button:hover {
                    background: #fff7ed;
                }
                .cdx-settings-button {
                    width: 100%;
                    padding: 10px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                }
                .cdx-settings-button:hover {
                    background: #fff7ed;
                }
                
                /* Image block */
                .image-tool {
                    padding: 20px 0;
                }
                .image-tool__image {
                    border-radius: 12px;
                    overflow: hidden;
                    background: #f8fafc;
                }
                .image-tool__image-picture {
                    max-width: 100%;
                    display: block;
                }
                .image-tool__caption {
                    margin-top: 10px;
                    font-size: 14px;
                    color: #64748b;
                    text-align: center;
                    outline: none;
                }
                .image-tool--empty .image-tool__image {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    border: 2px dashed #e2e8f0;
                    cursor: pointer;
                }
                .image-tool--empty .image-tool__image:hover {
                    border-color: #f97316;
                    background: #fff7ed;
                }
                
                /* Quote */
                .cdx-quote {
                    padding: 20px 0;
                }
                .cdx-quote__text {
                    border-left: 4px solid #f97316;
                    padding-left: 20px;
                    font-size: 1.25rem;
                    font-style: italic;
                    color: #475569;
                    min-height: 60px;
                }
                .cdx-quote__caption {
                    margin-top: 10px;
                    margin-left: 24px;
                    font-size: 14px;
                    color: #64748b;
                }
                
                /* Code */
                .ce-code__textarea {
                    background: #1e293b;
                    color: #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 14px;
                    line-height: 1.6;
                    resize: none;
                    border: none;
                    min-height: 120px;
                }
                
                /* List */
                .cdx-list {
                    padding-left: 24px;
                }
                .cdx-list__item {
                    padding: 6px 0;
                    font-size: 1.125rem;
                    line-height: 1.6;
                    color: #1e293b;
                }
                
                /* Delimiter */
                .ce-delimiter {
                    padding: 30px 0;
                    text-align: center;
                }
                .ce-delimiter::before {
                    content: '• • •';
                    color: #cbd5e1;
                    letter-spacing: 0.75em;
                    font-size: 1.25rem;
                }
                
                /* Drag and Drop Styles */
                .ce-block--drop-target .ce-block__content::before {
                    content: '';
                    position: absolute;
                    top: -3px;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: #f97316;
                    border-radius: 2px;
                }
                .ce-block--dragging {
                    opacity: 0.5;
                }
            `}</style>
        </div>
    );
};

export default BlockEditor;
