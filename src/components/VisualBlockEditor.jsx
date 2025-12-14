import React, { useState, useCallback, useRef } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
    useDraggable,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Type, Heading1, List, Image as ImageIcon, Quote, Code, Minus,
    Trash2, GripVertical, Plus, ChevronLeft, ChevronRight, Video,
    Settings, AlignLeft, AlignCenter, AlignRight, Maximize2
} from 'lucide-react';
import { adminAPI } from '../services/api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Block type definitions
const BLOCK_TYPES = [
    { type: 'heading', label: 'Heading', icon: Heading1, description: 'Large section heading' },
    { type: 'paragraph', label: 'Paragraph', icon: Type, description: 'Plain text paragraph' },
    { type: 'image', label: 'Image', icon: ImageIcon, description: 'Upload or embed image' },
    { type: 'list', label: 'List', icon: List, description: 'Bulleted or numbered list' },
    { type: 'quote', label: 'Quote', icon: Quote, description: 'Highlighted quote block' },
    { type: 'code', label: 'Code', icon: Code, description: 'Code snippet block' },
    { type: 'divider', label: 'Divider', icon: Minus, description: 'Visual separator' },
    { type: 'video', label: 'Video', icon: Video, description: 'Embed YouTube video' },
    { type: 'spacer', label: 'Spacer', icon: Maximize2, description: 'Add vertical space' },
];

const generateId = () => `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Block Settings Panel
const BlockSettingsPanel = ({ block, onUpdate, onClose }) => {
    const styles = block.data.styles || {};

    const updateStyle = (key, value) => {
        onUpdate(block.id, {
            ...block.data,
            styles: { ...styles, [key]: value }
        });
    };

    return (
        <div className="absolute right-0 top-0 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800">Block Settings</h4>
                <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-600">
                    <ChevronRight size={16} />
                </button>
            </div>
            <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                {/* Width */}
                <div>
                    <label className="text-xs font-semibold text-slate-500 mb-2 block">Width</label>
                    <select
                        value={styles.width || 'full'}
                        onChange={(e) => updateStyle('width', e.target.value)}
                        className="w-full text-sm border border-slate-200 bg-white text-slate-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500/20"
                    >
                        <option value="full">Full Width</option>
                        <option value="wide">Wide (80%)</option>
                        <option value="medium">Medium (60%)</option>
                        <option value="narrow">Narrow (40%)</option>
                        <option value="custom">Custom</option>
                    </select>
                    {styles.width === 'custom' && (
                        <input
                            type="text"
                            value={styles.customWidth || ''}
                            onChange={(e) => updateStyle('customWidth', e.target.value)}
                            placeholder="e.g., 500px or 50%"
                            className="mt-2 w-full text-sm border border-slate-200 bg-white text-slate-800 rounded-lg px-3 py-2"
                        />
                    )}
                </div>

                {/* Height (for spacer, image, video) */}
                {['spacer', 'image', 'video'].includes(block.type) && (
                    <div>
                        <label className="text-xs font-semibold text-slate-500 mb-2 block">Height</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={styles.height || (block.type === 'spacer' ? 50 : '')}
                                onChange={(e) => updateStyle('height', e.target.value)}
                                placeholder="Auto"
                                className="flex-1 text-sm border border-slate-200 bg-white text-slate-800 rounded-lg px-3 py-2"
                            />
                            <select
                                value={styles.heightUnit || 'px'}
                                onChange={(e) => updateStyle('heightUnit', e.target.value)}
                                className="w-16 text-sm border border-slate-200 rounded-lg px-2 py-2"
                            >
                                <option value="px">px</option>
                                <option value="vh">vh</option>
                                <option value="rem">rem</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Alignment */}
                <div>
                    <label className="text-xs font-semibold text-slate-500 mb-2 block">Alignment</label>
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                        {[
                            { value: 'left', icon: AlignLeft },
                            { value: 'center', icon: AlignCenter },
                            { value: 'right', icon: AlignRight },
                        ].map(({ value, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => updateStyle('align', value)}
                                className={`flex-1 p-2 rounded-lg transition-colors ${styles.align === value ? 'bg-white shadow text-orange-600' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <Icon size={16} className="mx-auto" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Padding */}
                <div>
                    <label className="text-xs font-semibold text-slate-500 mb-2 block">Padding</label>
                    <div className="grid grid-cols-4 gap-2">
                        {['Top', 'Right', 'Bottom', 'Left'].map((dir) => (
                            <div key={dir}>
                                <label className="text-[10px] text-slate-400 block mb-1">{dir}</label>
                                <input
                                    type="number"
                                    value={styles[`padding${dir}`] || 0}
                                    onChange={(e) => updateStyle(`padding${dir}`, e.target.value)}
                                    className="w-full text-sm border border-slate-200 rounded px-2 py-1 text-center"
                                    min="0"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Margin */}
                <div>
                    <label className="text-xs font-semibold text-slate-500 mb-2 block">Margin</label>
                    <div className="grid grid-cols-4 gap-2">
                        {['Top', 'Right', 'Bottom', 'Left'].map((dir) => (
                            <div key={dir}>
                                <label className="text-[10px] text-slate-400 block mb-1">{dir}</label>
                                <input
                                    type="number"
                                    value={styles[`margin${dir}`] || 0}
                                    onChange={(e) => updateStyle(`margin${dir}`, e.target.value)}
                                    className="w-full text-sm border border-slate-200 rounded px-2 py-1 text-center"
                                    min="0"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Background Color */}
                <div>
                    <label className="text-xs font-semibold text-slate-500 mb-2 block">Background</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="color"
                            value={styles.backgroundColor || '#ffffff'}
                            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                            className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={styles.backgroundColor || ''}
                            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                            placeholder="transparent"
                            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2"
                        />
                    </div>
                </div>

                {/* Border Radius */}
                <div>
                    <label className="text-xs font-semibold text-slate-500 mb-2 block">Border Radius</label>
                    <input
                        type="range"
                        min="0"
                        max="32"
                        value={styles.borderRadius || 0}
                        onChange={(e) => updateStyle('borderRadius', e.target.value)}
                        className="w-full"
                    />
                    <div className="text-xs text-slate-400 text-right">{styles.borderRadius || 0}px</div>
                </div>

                {/* Heading Level (for heading blocks) */}
                {block.type === 'heading' && (
                    <div>
                        <label className="text-xs font-semibold text-slate-500 mb-2 block">Heading Level</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => onUpdate(block.id, { ...block.data, level })}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${block.data.level === level ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    H{level}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Font Size */}
                <div>
                    <label className="text-xs font-semibold text-slate-500 mb-2 block">Font Size</label>
                    <select
                        value={styles.fontSize || 'default'}
                        onChange={(e) => updateStyle('fontSize', e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
                    >
                        <option value="default">Default</option>
                        <option value="sm">Small</option>
                        <option value="base">Normal</option>
                        <option value="lg">Large</option>
                        <option value="xl">Extra Large</option>
                        <option value="2xl">2X Large</option>
                        <option value="3xl">3X Large</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

// Get styles object for block
const getBlockStyles = (block) => {
    const styles = block.data.styles || {};
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
    if (styles.align === 'center') css.marginLeft = css.marginRight = 'auto';
    if (styles.align === 'right') css.marginLeft = 'auto';

    // Padding
    if (styles.paddingTop) css.paddingTop = `${styles.paddingTop}px`;
    if (styles.paddingRight) css.paddingRight = `${styles.paddingRight}px`;
    if (styles.paddingBottom) css.paddingBottom = `${styles.paddingBottom}px`;
    if (styles.paddingLeft) css.paddingLeft = `${styles.paddingLeft}px`;

    // Margin (override for alignment)
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

// Draggable block from sidebar
const DraggableBlockType = ({ type, label, icon: Icon, description }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `new-${type}`,
        data: { type, isNew: true }
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all ${isDragging ? 'opacity-50 scale-95' : 'hover:bg-slate-100'
                }`}
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Icon size={20} className="text-slate-600" />
                </div>
                <div>
                    <p className="font-semibold text-slate-800 text-sm">{label}</p>
                    <p className="text-xs text-slate-500">{description}</p>
                </div>
            </div>
        </div>
    );
};

// Sortable block in canvas
const SortableBlock = ({ block, onUpdate, onDelete, isSelected, onSelect }) => {
    const [showSettings, setShowSettings] = useState(false);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative group ${isDragging ? 'opacity-50 z-50' : ''}`}
            onClick={() => onSelect(block.id)}
        >
            <div className={`relative rounded-xl transition-all ${isSelected ? 'ring-2 ring-orange-500 ring-offset-2' : 'hover:ring-2 hover:ring-slate-200'
                }`}>
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-2 hover:bg-slate-100 rounded-lg"
                >
                    <GripVertical size={16} className="text-slate-400" />
                </div>

                {/* Action Buttons */}
                <div className="absolute -right-24 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                        className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-orange-100 text-orange-600' : 'hover:bg-slate-100 text-slate-400'}`}
                    >
                        <Settings size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
                        className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-400"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <BlockSettingsPanel
                        block={block}
                        onUpdate={onUpdate}
                        onClose={() => setShowSettings(false)}
                    />
                )}

                {/* Block Content */}
                <BlockContent block={block} onUpdate={onUpdate} isSelected={isSelected} />
            </div>
        </div>
    );
};

// Block content renderer
const BlockContent = ({ block, onUpdate, isSelected }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const blockStyles = getBlockStyles(block);
    const fontSizeClass = getFontSizeClass(block.data.styles?.fontSize);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const response = await adminAPI.uploadImage(file, 'posts');
            const url = response.url || `${BACKEND_URL}${response.path}`;
            onUpdate(block.id, { ...block.data, url, caption: block.data.caption || '' });
        } catch (error) {
            alert('Failed to upload: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const wrapperStyle = { ...blockStyles };

    switch (block.type) {
        case 'heading':
            const headingLevels = {
                1: 'text-4xl',
                2: 'text-3xl',
                3: 'text-2xl',
                4: 'text-xl',
            };
            return (
                <div style={wrapperStyle}>
                    <input
                        type="text"
                        value={block.data.text || ''}
                        onChange={(e) => onUpdate(block.id, { ...block.data, text: e.target.value })}
                        placeholder="Heading text..."
                        className={`w-full ${fontSizeClass || headingLevels[block.data.level || 2]} font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 p-4`}
                    />
                </div>
            );

        case 'paragraph':
            return (
                <div style={wrapperStyle}>
                    <textarea
                        value={block.data.text || ''}
                        onChange={(e) => onUpdate(block.id, { ...block.data, text: e.target.value })}
                        placeholder="Write your paragraph..."
                        rows={3}
                        className={`w-full ${fontSizeClass || 'text-lg'} text-slate-700 bg-slate-50 border-none focus:outline-none focus:ring-0 p-4 rounded-xl resize-none leading-relaxed`}
                    />
                </div>
            );

        case 'image':
            return (
                <div className="p-4" style={wrapperStyle}>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    {block.data.url ? (
                        <div className="space-y-3">
                            <img
                                src={block.data.url}
                                alt={block.data.caption || ''}
                                className="w-full rounded-xl"
                                style={{
                                    height: blockStyles.height || 'auto',
                                    objectFit: 'cover'
                                }}
                            />
                            <input
                                type="text"
                                value={block.data.caption || ''}
                                onChange={(e) => onUpdate(block.id, { ...block.data, caption: e.target.value })}
                                placeholder="Add caption..."
                                className="w-full text-sm text-slate-500 text-center bg-transparent border-none focus:outline-none"
                            />
                        </div>
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-video rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all"
                            style={{ height: blockStyles.height || undefined }}
                        >
                            {uploading ? (
                                <p className="text-orange-500 font-medium animate-pulse">Uploading...</p>
                            ) : (
                                <>
                                    <ImageIcon size={32} className="text-slate-400 mb-2" />
                                    <p className="text-slate-500 font-medium">Click to upload image</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            );

        case 'spacer':
            return (
                <div
                    style={{
                        ...wrapperStyle,
                        height: blockStyles.height || '50px',
                        background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #f1f5f9 10px, #f1f5f9 20px)',
                        borderRadius: '8px',
                        border: isSelected ? '2px dashed #f97316' : '2px dashed #e2e8f0'
                    }}
                    className="flex items-center justify-center text-slate-400 text-xs font-medium"
                >
                    Spacer {blockStyles.height || '50px'}
                </div>
            );

        case 'list':
            const items = block.data.items || [''];
            return (
                <div className="p-4 space-y-2" style={wrapperStyle}>
                    {items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <span className="text-slate-400">•</span>
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[idx] = e.target.value;
                                    onUpdate(block.id, { ...block.data, items: newItems });
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const newItems = [...items];
                                        newItems.splice(idx + 1, 0, '');
                                        onUpdate(block.id, { ...block.data, items: newItems });
                                    } else if (e.key === 'Backspace' && item === '' && items.length > 1) {
                                        const newItems = items.filter((_, i) => i !== idx);
                                        onUpdate(block.id, { ...block.data, items: newItems });
                                    }
                                }}
                                placeholder="List item..."
                                className={`flex-1 text-slate-700 bg-transparent border-none focus:outline-none ${fontSizeClass}`}
                            />
                        </div>
                    ))}
                </div>
            );

        case 'quote':
            return (
                <div className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded-r-xl" style={wrapperStyle}>
                    <textarea
                        value={block.data.text || ''}
                        onChange={(e) => onUpdate(block.id, { ...block.data, text: e.target.value })}
                        placeholder="Enter quote..."
                        rows={2}
                        className={`w-full ${fontSizeClass || 'text-xl'} italic text-slate-700 bg-transparent border-none focus:outline-none resize-none`}
                    />
                    <input
                        type="text"
                        value={block.data.author || ''}
                        onChange={(e) => onUpdate(block.id, { ...block.data, author: e.target.value })}
                        placeholder="— Author"
                        className="w-full text-sm text-slate-500 bg-transparent border-none focus:outline-none mt-2"
                    />
                </div>
            );

        case 'code':
            return (
                <div style={wrapperStyle}>
                    <textarea
                        value={block.data.code || ''}
                        onChange={(e) => onUpdate(block.id, { ...block.data, code: e.target.value })}
                        placeholder="// Enter code here..."
                        rows={6}
                        className="w-full font-mono text-sm text-slate-100 bg-slate-900 p-4 rounded-xl resize-none focus:outline-none"
                    />
                </div>
            );

        case 'divider':
            return (
                <div className="py-6 flex justify-center" style={wrapperStyle}>
                    <div className="text-slate-300 tracking-[0.5em]">• • •</div>
                </div>
            );

        case 'video':
            return (
                <div className="p-4" style={wrapperStyle}>
                    <input
                        type="text"
                        value={block.data.url || ''}
                        onChange={(e) => onUpdate(block.id, { ...block.data, url: e.target.value })}
                        placeholder="Paste YouTube URL..."
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 mb-3"
                    />
                    {block.data.url && block.data.url.includes('youtube') && (
                        <div
                            className="rounded-xl overflow-hidden bg-slate-900"
                            style={{ height: blockStyles.height || 'auto', aspectRatio: blockStyles.height ? undefined : '16/9' }}
                        >
                            <iframe
                                src={block.data.url.replace('watch?v=', 'embed/')}
                                className="w-full h-full"
                                allowFullScreen
                            />
                        </div>
                    )}
                </div>
            );

        default:
            return <div className="p-4 text-slate-400">Unknown block type</div>;
    }
};

// Drop zone
const DropZone = ({ children, isEmpty }) => {
    const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

    return (
        <div
            ref={setNodeRef}
            className={`min-h-[400px] transition-all rounded-2xl ${isOver ? 'bg-orange-50 ring-2 ring-orange-300 ring-dashed' : ''
                } ${isEmpty ? 'flex items-center justify-center' : ''}`}
        >
            {isEmpty ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Plus size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Start Building</h3>
                    <p className="text-slate-500">Drag blocks from the sidebar or click to add</p>
                </div>
            ) : (
                children
            )}
        </div>
    );
};

// Main Visual Block Editor
const VisualBlockEditor = ({ initialData, onChange }) => {
    const [blocks, setBlocks] = useState(() => {
        if (!initialData) return [];
        if (typeof initialData === 'string') {
            try {
                const parsed = JSON.parse(initialData);
                return parsed.blocks || [];
            } catch {
                return initialData ? [{ id: generateId(), type: 'paragraph', data: { text: initialData } }] : [];
            }
        }
        return initialData.blocks || [];
    });
    const [selectedBlock, setSelectedBlock] = useState(null);
    const [activeId, setActiveId] = useState(null);
    const [showSidebar, setShowSidebar] = useState(true);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const notifyChange = useCallback((newBlocks) => {
        const data = {
            blocks: newBlocks.map(b => ({
                id: b.id,
                type: b.type,
                data: b.data
            }))
        };
        onChange?.(data);
    }, [onChange]);

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeData = active.data.current;

        if (activeData?.isNew) {
            const newBlock = {
                id: generateId(),
                type: activeData.type,
                data: getDefaultData(activeData.type)
            };

            let newBlocks;
            if (over.id === 'canvas') {
                newBlocks = [...blocks, newBlock];
            } else {
                const overIndex = blocks.findIndex(b => b.id === over.id);
                newBlocks = [...blocks.slice(0, overIndex + 1), newBlock, ...blocks.slice(overIndex + 1)];
            }
            setBlocks(newBlocks);
            notifyChange(newBlocks);
            setSelectedBlock(newBlock.id);
            return;
        }

        if (active.id !== over.id && over.id !== 'canvas') {
            const oldIndex = blocks.findIndex(b => b.id === active.id);
            const newIndex = blocks.findIndex(b => b.id === over.id);
            const newBlocks = arrayMove(blocks, oldIndex, newIndex);
            setBlocks(newBlocks);
            notifyChange(newBlocks);
        }
    };

    const getDefaultData = (type) => {
        switch (type) {
            case 'heading': return { text: '', level: 2, styles: {} };
            case 'paragraph': return { text: '', styles: {} };
            case 'image': return { url: '', caption: '', styles: {} };
            case 'list': return { items: [''], style: 'unordered', styles: {} };
            case 'quote': return { text: '', author: '', styles: {} };
            case 'code': return { code: '', styles: {} };
            case 'divider': return { styles: {} };
            case 'video': return { url: '', styles: {} };
            case 'spacer': return { styles: { height: 50, heightUnit: 'px' } };
            default: return { styles: {} };
        }
    };

    const handleUpdateBlock = (id, newData) => {
        const newBlocks = blocks.map(b => b.id === id ? { ...b, data: newData } : b);
        setBlocks(newBlocks);
        notifyChange(newBlocks);
    };

    const handleDeleteBlock = (id) => {
        const newBlocks = blocks.filter(b => b.id !== id);
        setBlocks(newBlocks);
        notifyChange(newBlocks);
        if (selectedBlock === id) setSelectedBlock(null);
    };

    const handleAddBlock = (type) => {
        const newBlock = {
            id: generateId(),
            type,
            data: getDefaultData(type)
        };
        const newBlocks = [...blocks, newBlock];
        setBlocks(newBlocks);
        notifyChange(newBlocks);
        setSelectedBlock(newBlock.id);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full">
                {/* Sidebar - Block Types */}
                <div className={`${showSidebar ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-slate-200 bg-white flex-shrink-0`}>
                    <div className="p-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900">Blocks</h3>
                        <p className="text-xs text-slate-500 mt-1">Drag blocks to canvas</p>
                    </div>
                    <div className="p-2 space-y-1 max-h-[calc(100%-80px)] overflow-y-auto">
                        {BLOCK_TYPES.map((blockType) => (
                            <DraggableBlockType key={blockType.type} {...blockType} />
                        ))}
                    </div>
                </div>

                {/* Toggle Sidebar Button */}
                <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 p-1 bg-white border border-slate-200 rounded-r-lg shadow-sm hover:bg-slate-50 z-10"
                    style={{ left: showSidebar ? '288px' : '0' }}
                >
                    {showSidebar ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>

                {/* Canvas */}
                <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
                    <div className="max-w-3xl mx-auto px-12">
                        <DropZone isEmpty={blocks.length === 0}>
                            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-4 py-4">
                                    {blocks.map((block) => (
                                        <SortableBlock
                                            key={block.id}
                                            block={block}
                                            onUpdate={handleUpdateBlock}
                                            onDelete={handleDeleteBlock}
                                            isSelected={selectedBlock === block.id}
                                            onSelect={setSelectedBlock}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DropZone>

                        {/* Quick Add Buttons */}
                        <div className="flex flex-wrap gap-2 mt-6 justify-center">
                            {BLOCK_TYPES.slice(0, 4).map((bt) => (
                                <button
                                    key={bt.type}
                                    onClick={() => handleAddBlock(bt.type)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-orange-300 hover:text-orange-600 transition-colors flex items-center gap-2"
                                >
                                    <bt.icon size={16} />
                                    {bt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
                {activeId && activeId.startsWith('new-') && (
                    <div className="p-3 bg-white rounded-xl shadow-2xl border-2 border-orange-400">
                        <div className="flex items-center gap-3">
                            {(() => {
                                const type = activeId.replace('new-', '');
                                const bt = BLOCK_TYPES.find(b => b.type === type);
                                if (!bt) return null;
                                const Icon = bt.icon;
                                return (
                                    <>
                                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                            <Icon size={20} className="text-orange-600" />
                                        </div>
                                        <p className="font-semibold text-slate-800">{bt.label}</p>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
};

export default VisualBlockEditor;
