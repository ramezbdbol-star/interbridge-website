import { useState, type ReactNode } from 'react';
import { useContent } from '@/lib/contentContext';
import { Button } from '@/components/ui/button';
import {
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Settings,
  Link as LinkIcon,
  Type,
  Palette,
  GripVertical,
  X,
  Check,
  Edit3,
  Move
} from 'lucide-react';

interface EditableTextProps {
  id: string;
  defaultText: string;
  className?: string;
  element?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  multiline?: boolean;
}

export function EditableText({ id, defaultText, className = '', element = 'span', multiline = false }: EditableTextProps) {
  const { isEditMode, getContent, updateContent, isElementVisible, toggleElementVisibility, getPosition, updatePosition } = useContent();
  const text = getContent(id, defaultText);
  const visible = isElementVisible(id);
  const position = getPosition(id);
  const [showPositioning, setShowPositioning] = useState(false);

  if (!visible && !isEditMode) {
    return null;
  }

  const renderContent = () => {
    const htmlContent = text.replace(/\n/g, '<br/>');
    const props = { 
      className: visible ? className : `${className} opacity-30`, 
      dangerouslySetInnerHTML: { __html: htmlContent } 
    };
    
    switch (element) {
      case 'h1': return <h1 {...props} />;
      case 'h2': return <h2 {...props} />;
      case 'h3': return <h3 {...props} />;
      case 'h4': return <h4 {...props} />;
      case 'p': return <p {...props} />;
      default: return <span {...props} />;
    }
  };

  if (!isEditMode) {
    return renderContent();
  }

  const Element = element;

  return (
    <span className="relative inline-block group/editable" style={{ transform: `translateX(${position.x}px) translateY(${position.y}px)` }}>
      <Element
        contentEditable
        suppressContentEditableWarning
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          const newText = e.currentTarget.innerText || '';
          if (newText !== text) {
            updateContent(id, newText);
          }
        }}
        className={`${className} ${!visible ? 'opacity-30' : ''} outline-none ring-2 ring-blue-400 ring-offset-2 bg-blue-50/50 dark:bg-blue-900/20 rounded cursor-text min-w-[20px]`}
        data-testid={`editable-${id}`}
      >
        {text}
      </Element>
      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover/editable:opacity-100 transition-opacity z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowPositioning(!showPositioning);
          }}
          className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-blue-600"
          title="Adjust position"
          data-testid={`position-button-${id}`}
        >
          <Move className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleElementVisibility(id);
          }}
          className="w-5 h-5 bg-white dark:bg-slate-800 border border-slate-300 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-100"
          title={visible ? 'Hide this text' : 'Show this text'}
          data-testid={`toggle-visibility-${id}`}
        >
          {visible ? <Eye className="w-3 h-3 text-slate-600" /> : <EyeOff className="w-3 h-3 text-red-500" />}
        </button>
      </div>
      
      {showPositioning && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-blue-400 p-3 min-w-[200px] z-20">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Position Adjustment</div>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 flex justify-between mb-1">
                <span>Horizontal: {position.x}px</span>
              </label>
              <input
                type="range"
                min="-100"
                max="100"
                value={position.x}
                onChange={(e) => updatePosition(id, { x: parseInt(e.target.value), y: position.y })}
                className="w-full"
                data-testid={`slider-x-${id}`}
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 flex justify-between mb-1">
                <span>Vertical: {position.y}px</span>
              </label>
              <input
                type="range"
                min="-100"
                max="100"
                value={position.y}
                onChange={(e) => updatePosition(id, { x: position.x, y: parseInt(e.target.value) })}
                className="w-full"
                data-testid={`slider-y-${id}`}
              />
            </div>
            <Button size="sm" variant="ghost" onClick={() => setShowPositioning(false)} className="w-full text-xs">
              Done
            </Button>
          </div>
        </div>
      )}
    </span>
  );
}

interface EditableSectionProps {
  id: string;
  name: string;
  children: ReactNode;
  className?: string;
}

export function EditableSection({ id, name, children, className = '' }: EditableSectionProps) {
  const { 
    isEditMode, 
    isSectionVisible, 
    toggleSectionVisibility,
    moveSectionUp,
    moveSectionDown,
    getSectionOrder
  } = useContent();
  
  const visible = isSectionVisible(id);
  const order = getSectionOrder();
  const currentIndex = order.indexOf(id);
  const canMoveUp = currentIndex > 0;
  const canMoveDown = currentIndex < order.length - 1;

  if (!visible && !isEditMode) {
    return null;
  }

  return (
    <div className={`relative ${!visible && isEditMode ? 'opacity-40' : ''}`}>
      {isEditMode && (
        <div 
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-1"
          data-testid={`section-controls-${id}`}
        >
          <div className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-center">
            {name}
          </div>
          <button
            onClick={() => moveSectionUp(id)}
            disabled={!canMoveUp}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move section up"
            data-testid={`section-up-${id}`}
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => moveSectionDown(id)}
            disabled={!canMoveDown}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move section down"
            data-testid={`section-down-${id}`}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-slate-200 dark:bg-slate-700" />
          <button
            onClick={() => toggleSectionVisibility(id)}
            className={`p-1.5 rounded ${visible ? 'hover:bg-slate-100 dark:hover:bg-slate-700' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}
            title={visible ? 'Hide section' : 'Show section'}
            data-testid={`section-visibility-${id}`}
          >
            {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      )}
      
      {isEditMode && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
          {name} Section
        </div>
      )}
      
      <div className={className}>
        {children}
      </div>
    </div>
  );
}

interface EditableButtonProps {
  id: string;
  defaultText: string;
  defaultLink?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export function EditableButton({ 
  id, 
  defaultText, 
  defaultLink,
  onClick,
  className = '', 
  variant = 'primary',
  icon,
  iconPosition = 'right'
}: EditableButtonProps) {
  const { 
    isEditMode, 
    getButtonConfig, 
    updateButtonConfig,
    isElementVisible,
    toggleElementVisibility
  } = useContent();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [editLink, setEditLink] = useState('');
  
  const config = getButtonConfig(id, { 
    text: defaultText, 
    link: defaultLink,
    visible: true,
    style: variant
  });
  
  const visible = isElementVisible(`button-${id}`);
  const buttonText = config.text || defaultText;
  const buttonLink = config.link || defaultLink;

  if (!visible && !isEditMode) {
    return null;
  }

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditText(buttonText);
    setEditLink(buttonLink || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updateButtonConfig(id, { 
      text: editText,
      link: editLink || undefined
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleClick = () => {
    if (isEditMode) return;
    if (buttonLink) {
      if (buttonLink.startsWith('#')) {
        const element = document.getElementById(buttonLink.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (buttonLink.startsWith('http')) {
        window.open(buttonLink, '_blank');
      } else {
        window.location.href = buttonLink;
      }
    } else if (onClick) {
      onClick();
    }
  };

  if (isEditing) {
    return (
      <div className="inline-flex flex-col gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-blue-400 min-w-[250px]">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Edit Button</div>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-1">
              <Type className="w-3 h-3" /> Button Text
            </label>
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              placeholder="Button text..."
              autoFocus
              data-testid={`input-button-text-${id}`}
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-1">
              <LinkIcon className="w-3 h-3" /> Link (optional)
            </label>
            <input
              type="text"
              value={editLink}
              onChange={(e) => setEditLink(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              placeholder="#section or https://..."
              data-testid={`input-button-link-${id}`}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={handleCancelEdit} data-testid={`button-cancel-${id}`}>
            <X className="w-3 h-3 mr-1" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSaveEdit} data-testid={`button-save-${id}`}>
            <Check className="w-3 h-3 mr-1" /> Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <span className={`relative inline-block ${isEditMode ? 'group/button' : ''}`}>
      <button
        onClick={handleClick}
        className={`${className} ${!visible ? 'opacity-30' : ''} ${isEditMode ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}
        data-testid={`button-${id}`}
      >
        {icon && iconPosition === 'left' && icon}
        {buttonText}
        {icon && iconPosition === 'right' && icon}
      </button>
      
      {isEditMode && (
        <div className="absolute -top-2 -right-2 flex gap-0.5 opacity-0 group-hover/button:opacity-100 transition-opacity z-10">
          <button
            onClick={handleStartEdit}
            className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-green-600"
            title="Edit button"
            data-testid={`edit-button-${id}`}
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleElementVisibility(`button-${id}`);
            }}
            className={`w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${visible ? 'bg-white border border-slate-300' : 'bg-red-500 text-white'}`}
            title={visible ? 'Hide button' : 'Show button'}
            data-testid={`toggle-button-${id}`}
          >
            {visible ? <Eye className="w-3 h-3 text-slate-600" /> : <EyeOff className="w-3 h-3" />}
          </button>
        </div>
      )}
    </span>
  );
}

interface EditableImageProps {
  id: string;
  defaultSrc?: string;
  alt: string;
  className?: string;
}

export function EditableImage({ id, defaultSrc, alt, className = '' }: EditableImageProps) {
  const { isEditMode, getContent, updateContent, isElementVisible, toggleElementVisibility } = useContent();
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState('');
  
  const src = getContent(`image-${id}`, defaultSrc || '');
  const visible = isElementVisible(`image-${id}`);

  if (!visible && !isEditMode) {
    return null;
  }

  const handleStartEdit = () => {
    setEditUrl(src);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updateContent(`image-${id}`, editUrl);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="inline-flex flex-col gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-purple-400 min-w-[250px]">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Edit Image URL</div>
        <input
          type="text"
          value={editUrl}
          onChange={(e) => setEditUrl(e.target.value)}
          className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
          placeholder="https://example.com/image.jpg"
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
            <X className="w-3 h-3 mr-1" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSaveEdit}>
            <Check className="w-3 h-3 mr-1" /> Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <span className={`relative inline-block ${isEditMode ? 'group/image' : ''}`}>
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className={`${className} ${!visible ? 'opacity-30' : ''} ${isEditMode ? 'ring-2 ring-purple-400 ring-offset-2' : ''}`}
        />
      ) : (
        <div className={`${className} bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 ${isEditMode ? 'ring-2 ring-purple-400 ring-offset-2' : ''}`}>
          No image
        </div>
      )}
      
      {isEditMode && (
        <div className="absolute -top-2 -right-2 flex gap-0.5 opacity-0 group-hover/image:opacity-100 transition-opacity z-10">
          <button
            onClick={handleStartEdit}
            className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-purple-600"
            title="Edit image"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleElementVisibility(`image-${id}`);
            }}
            className={`w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${visible ? 'bg-white border border-slate-300' : 'bg-red-500 text-white'}`}
            title={visible ? 'Hide image' : 'Show image'}
          >
            {visible ? <Eye className="w-3 h-3 text-slate-600" /> : <EyeOff className="w-3 h-3" />}
          </button>
        </div>
      )}
    </span>
  );
}

interface EditableIconProps {
  id: string;
  icon: ReactNode;
  className?: string;
}

export function EditableIcon({ id, icon, className = '' }: EditableIconProps) {
  const { isEditMode, isElementVisible, toggleElementVisibility } = useContent();
  const visible = isElementVisible(`icon-${id}`);

  if (!visible && !isEditMode) {
    return null;
  }

  return (
    <span className={`relative inline-block ${isEditMode ? 'group/icon' : ''}`}>
      <span className={`${className} ${!visible ? 'opacity-30' : ''} ${isEditMode ? 'ring-2 ring-amber-400 ring-offset-2 rounded' : ''}`}>
        {icon}
      </span>
      
      {isEditMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleElementVisibility(`icon-${id}`);
          }}
          className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover/icon:opacity-100 transition-opacity z-10 ${visible ? 'bg-white border border-slate-300' : 'bg-red-500 text-white'}`}
          title={visible ? 'Hide icon' : 'Show icon'}
        >
          {visible ? <Eye className="w-3 h-3 text-slate-600" /> : <EyeOff className="w-3 h-3" />}
        </button>
      )}
    </span>
  );
}

interface EditableContainerProps {
  id: string;
  children: ReactNode;
  className?: string;
  label?: string;
}

export function EditableContainer({ id, children, className = '', label }: EditableContainerProps) {
  const { isEditMode, isElementVisible, toggleElementVisibility } = useContent();
  const visible = isElementVisible(id);

  if (!visible && !isEditMode) {
    return null;
  }

  return (
    <div className={`relative ${isEditMode ? 'group/container' : ''}`}>
      <div className={`${className} ${!visible ? 'opacity-30' : ''} ${isEditMode ? 'ring-2 ring-orange-400 ring-offset-2 rounded-lg' : ''}`}>
        {children}
      </div>
      
      {isEditMode && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover/container:opacity-100 transition-opacity z-10">
          {label && (
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              {label}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleElementVisibility(id);
            }}
            className={`w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${visible ? 'bg-white border border-slate-300' : 'bg-red-500 text-white'}`}
            title={visible ? 'Hide this block' : 'Show this block'}
            data-testid={`toggle-container-${id}`}
          >
            {visible ? <Eye className="w-3 h-3 text-slate-600" /> : <EyeOff className="w-3 h-3" />}
          </button>
        </div>
      )}
    </div>
  );
}
