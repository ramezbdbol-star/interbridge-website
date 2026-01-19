import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAdmin } from './adminContext';

interface SectionConfig {
  id: string;
  visible: boolean;
  order: number;
  name: string;
}

interface ButtonConfig {
  text: string;
  link?: string;
  visible: boolean;
  style?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

interface Position {
  x: number;
  y: number;
}

export interface CustomSection {
  id: string;
  type: 'text' | 'features' | 'cta' | 'testimonial' | 'gallery';
  name: string;
  visible: boolean;
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
    items?: Array<{
      id: string;
      title: string;
      description: string;
      icon?: string;
    }>;
    buttonText?: string;
    buttonLink?: string;
    backgroundColor?: 'white' | 'slate' | 'dark';
  };
}

interface ContentContextType {
  content: Record<string, string>;
  isEditMode: boolean;
  setEditMode: (mode: boolean) => void;
  getContent: (id: string, defaultValue: string) => string;
  updateContent: (id: string, value: string) => void;
  saveAllChanges: () => Promise<{ success: boolean; message: string }>;
  hasUnsavedChanges: boolean;
  pendingChanges: Record<string, string>;
  getSectionConfig: (sectionId: string, defaultConfig: SectionConfig) => SectionConfig;
  updateSectionConfig: (sectionId: string, config: Partial<SectionConfig>) => void;
  getSectionOrder: () => string[];
  moveSectionUp: (sectionId: string) => void;
  moveSectionDown: (sectionId: string) => void;
  isSectionVisible: (sectionId: string) => boolean;
  toggleSectionVisibility: (sectionId: string) => void;
  getButtonConfig: (buttonId: string, defaultConfig: ButtonConfig) => ButtonConfig;
  updateButtonConfig: (buttonId: string, config: Partial<ButtonConfig>) => void;
  isElementVisible: (elementId: string) => boolean;
  toggleElementVisibility: (elementId: string) => void;
  getCustomSections: () => CustomSection[];
  addCustomSection: (type: CustomSection['type'], name: string) => string;
  insertSectionAt: (position: number, type: CustomSection['type'], name: string) => string;
  updateCustomSection: (id: string, updates: Partial<CustomSection>) => void;
  deleteCustomSection: (id: string) => void;
  duplicateSection: (sectionId: string) => string | null;
  getPosition: (id: string) => Position;
  updatePosition: (id: string, position: Position) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const DEFAULT_SECTION_ORDER = ['hero', 'services', 'buyers', 'process', 'faq', 'stories', 'reviews', 'tradeguard', 'contact'];

export function ContentProvider({ children }: { children: ReactNode }) {
  const { isAdmin, getToken } = useAdmin();
  const [content, setContent] = useState<Record<string, string>>({});
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setIsEditMode(false);
      setPendingChanges({});
    }
  }, [isAdmin]);

  const loadContent = async () => {
    try {
      const response = await fetch('/api/content');
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      }
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const getContent = (id: string, defaultValue: string) => {
    if (pendingChanges[id] !== undefined) {
      return pendingChanges[id];
    }
    return content[id] || defaultValue;
  };

  const updateContent = (id: string, value: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const getSectionConfig = (sectionId: string, defaultConfig: SectionConfig): SectionConfig => {
    const configKey = `_section_${sectionId}`;
    const stored = getContent(configKey, '');
    if (stored) {
      try {
        return { ...defaultConfig, ...JSON.parse(stored) };
      } catch {
        return defaultConfig;
      }
    }
    return defaultConfig;
  };

  const updateSectionConfig = (sectionId: string, config: Partial<SectionConfig>) => {
    const configKey = `_section_${sectionId}`;
    const current = getSectionConfig(sectionId, { id: sectionId, visible: true, order: 0, name: sectionId });
    const updated = { ...current, ...config };
    updateContent(configKey, JSON.stringify(updated));
  };

  const getSectionOrder = (): string[] => {
    const orderKey = '_section_order';
    const stored = getContent(orderKey, '');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_SECTION_ORDER;
      }
    }
    return DEFAULT_SECTION_ORDER;
  };

  const saveSectionOrder = (order: string[]) => {
    updateContent('_section_order', JSON.stringify(order));
  };

  const moveSectionUp = (sectionId: string) => {
    const order = getSectionOrder();
    const index = order.indexOf(sectionId);
    if (index > 0) {
      const newOrder = [...order];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      saveSectionOrder(newOrder);
    }
  };

  const moveSectionDown = (sectionId: string) => {
    const order = getSectionOrder();
    const index = order.indexOf(sectionId);
    if (index < order.length - 1) {
      const newOrder = [...order];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      saveSectionOrder(newOrder);
    }
  };

  const isSectionVisible = (sectionId: string): boolean => {
    const visibilityKey = `_visible_section_${sectionId}`;
    const stored = getContent(visibilityKey, 'true');
    return stored !== 'false';
  };

  const toggleSectionVisibility = (sectionId: string) => {
    const visibilityKey = `_visible_section_${sectionId}`;
    const current = isSectionVisible(sectionId);
    updateContent(visibilityKey, current ? 'false' : 'true');
  };

  const getButtonConfig = (buttonId: string, defaultConfig: ButtonConfig): ButtonConfig => {
    const configKey = `_button_${buttonId}`;
    const stored = getContent(configKey, '');
    if (stored) {
      try {
        return { ...defaultConfig, ...JSON.parse(stored) };
      } catch {
        return defaultConfig;
      }
    }
    return defaultConfig;
  };

  const updateButtonConfig = (buttonId: string, config: Partial<ButtonConfig>) => {
    const configKey = `_button_${buttonId}`;
    const current = getButtonConfig(buttonId, { text: '', visible: true });
    const updated = { ...current, ...config };
    updateContent(configKey, JSON.stringify(updated));
  };

  const isElementVisible = (elementId: string): boolean => {
    const visibilityKey = `_visible_${elementId}`;
    const stored = getContent(visibilityKey, 'true');
    return stored !== 'false';
  };

  const toggleElementVisibility = (elementId: string) => {
    const visibilityKey = `_visible_${elementId}`;
    const current = isElementVisible(elementId);
    updateContent(visibilityKey, current ? 'false' : 'true');
  };

  const getCustomSections = (): CustomSection[] => {
    const sectionsKey = '_custom_sections';
    const stored = getContent(sectionsKey, '[]');
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  };

  const saveCustomSections = (sections: CustomSection[]) => {
    updateContent('_custom_sections', JSON.stringify(sections));
  };

  const generateId = () => `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const getDefaultContent = (type: CustomSection['type']): CustomSection['content'] => {
    switch (type) {
      case 'text':
        return {
          title: 'New Text Section',
          description: 'Add your content here. Click to edit this text.',
          backgroundColor: 'white'
        };
      case 'features':
        return {
          title: 'Features',
          subtitle: 'What We Offer',
          items: [
            { id: generateId(), title: 'Feature 1', description: 'Description of feature 1' },
            { id: generateId(), title: 'Feature 2', description: 'Description of feature 2' },
            { id: generateId(), title: 'Feature 3', description: 'Description of feature 3' },
          ],
          backgroundColor: 'slate'
        };
      case 'cta':
        return {
          title: 'Ready to Get Started?',
          description: 'Take action today and see the difference.',
          buttonText: 'Get Started',
          buttonLink: '#contact',
          backgroundColor: 'dark'
        };
      case 'testimonial':
        return {
          title: 'What Our Clients Say',
          items: [
            { id: generateId(), title: 'John Doe', description: 'This service exceeded my expectations!' },
          ],
          backgroundColor: 'white'
        };
      case 'gallery':
        return {
          title: 'Our Work',
          subtitle: 'See what we\'ve accomplished',
          items: [],
          backgroundColor: 'slate'
        };
      default:
        return { title: 'New Section', backgroundColor: 'white' };
    }
  };

  const addCustomSection = (type: CustomSection['type'], name: string): string => {
    const id = generateId();
    const newSection: CustomSection = {
      id,
      type,
      name: name || `New ${type} Section`,
      visible: true,
      content: getDefaultContent(type)
    };
    
    const sections = getCustomSections();
    sections.push(newSection);
    saveCustomSections(sections);
    
    const order = getSectionOrder();
    order.push(id);
    saveSectionOrder(order);
    
    return id;
  };

  const insertSectionAt = (position: number, type: CustomSection['type'], name: string): string => {
    const id = generateId();
    const newSection: CustomSection = {
      id,
      type,
      name: name || `New ${type} Section`,
      visible: true,
      content: getDefaultContent(type)
    };
    
    const sections = getCustomSections();
    sections.push(newSection);
    saveCustomSections(sections);
    
    const order = getSectionOrder();
    order.splice(position, 0, id);
    saveSectionOrder(order);
    
    return id;
  };

  const updateCustomSection = (id: string, updates: Partial<CustomSection>) => {
    const sections = getCustomSections();
    const index = sections.findIndex(s => s.id === id);
    if (index !== -1) {
      sections[index] = { ...sections[index], ...updates };
      saveCustomSections(sections);
    }
  };

  const deleteCustomSection = (id: string) => {
    const sections = getCustomSections().filter(s => s.id !== id);
    saveCustomSections(sections);
    
    const order = getSectionOrder().filter(sId => sId !== id);
    saveSectionOrder(order);
  };

  const duplicateSection = (sectionId: string): string | null => {
    const sections = getCustomSections();
    const section = sections.find(s => s.id === sectionId);
    
    if (section) {
      const newId = generateId();
      const duplicated: CustomSection = {
        ...section,
        id: newId,
        name: `${section.name} (Copy)`,
        content: JSON.parse(JSON.stringify(section.content))
      };
      sections.push(duplicated);
      saveCustomSections(sections);
      
      const order = getSectionOrder();
      const originalIndex = order.indexOf(sectionId);
      order.splice(originalIndex + 1, 0, newId);
      saveSectionOrder(order);
      
      return newId;
    }
    return null;
  };

  const saveAllChanges = async (): Promise<{ success: boolean; message: string }> => {
    const token = getToken();
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }

    const items = Object.entries(pendingChanges).map(([id, value]) => ({
      id,
      content: value
    }));

    if (items.length === 0) {
      return { success: true, message: 'No changes to save' };
    }

    try {
      const response = await fetch('/api/content/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items })
      });

      if (response.ok) {
        const data = await response.json();
        setContent(prev => ({
          ...prev,
          ...pendingChanges
        }));
        setPendingChanges({});
        return { success: true, message: `Saved ${data.updated} changes successfully!` };
      } else {
        const error = await response.json();
        return { success: false, message: error.error || 'Failed to save' };
      }
    } catch (error) {
      console.error('Save error:', error);
      return { success: false, message: 'Failed to save changes' };
    }
  };

  const setEditMode = (mode: boolean) => {
    if (!isAdmin && mode) {
      return;
    }
    setIsEditMode(mode);
  };

  const hasUnsavedChanges = Object.keys(pendingChanges).length > 0;

  const getPosition = (id: string): Position => {
    const positionKey = `_position_${id}`;
    const stored = getContent(positionKey, '');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { x: 0, y: 0 };
      }
    }
    return { x: 0, y: 0 };
  };

  const updatePosition = (id: string, position: Position) => {
    const positionKey = `_position_${id}`;
    updateContent(positionKey, JSON.stringify(position));
  };

  return (
    <ContentContext.Provider value={{
      content,
      isEditMode,
      setEditMode,
      getContent,
      updateContent,
      saveAllChanges,
      hasUnsavedChanges,
      pendingChanges,
      getSectionConfig,
      updateSectionConfig,
      getSectionOrder,
      moveSectionUp,
      moveSectionDown,
      isSectionVisible,
      toggleSectionVisibility,
      getButtonConfig,
      updateButtonConfig,
      isElementVisible,
      toggleElementVisibility,
      getCustomSections,
      addCustomSection,
      insertSectionAt,
      updateCustomSection,
      deleteCustomSection,
      duplicateSection,
      getPosition,
      updatePosition
    }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
