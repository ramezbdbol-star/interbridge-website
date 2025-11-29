import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAdmin } from './adminContext';

interface ContentContextType {
  content: Record<string, string>;
  isEditMode: boolean;
  setEditMode: (mode: boolean) => void;
  getContent: (id: string, defaultValue: string) => string;
  updateContent: (id: string, value: string) => void;
  saveAllChanges: () => Promise<{ success: boolean; message: string }>;
  hasUnsavedChanges: boolean;
  pendingChanges: Record<string, string>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

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

  return (
    <ContentContext.Provider value={{
      content,
      isEditMode,
      setEditMode,
      getContent,
      updateContent,
      saveAllChanges,
      hasUnsavedChanges,
      pendingChanges
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
