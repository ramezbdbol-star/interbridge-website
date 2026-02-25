import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAdmin } from '@/lib/adminContext';
import { useContent } from '@/lib/contentContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, Save, Settings, X } from 'lucide-react';

export function AdminFloatingToolbar() {
  const [isSaving, setIsSaving] = useState(false);
  const { isAdmin, logout } = useAdmin();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const {
    isEditMode,
    setEditMode,
    saveAllChanges,
    hasUnsavedChanges,
    pendingChanges,
  } = useContent();

  if (!isAdmin) {
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveAllChanges();
    toast({
      title: result.success ? 'Saved!' : 'Error',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
    setIsSaving(false);
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2" data-testid="admin-toolbar">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 flex flex-col gap-2">
        <Button
          size="sm"
          variant={isEditMode ? 'default' : 'outline'}
          onClick={() => setEditMode(!isEditMode)}
          className="gap-2"
          data-testid="button-toggle-edit"
        >
          {isEditMode ? (
            <>
              <X className="w-4 h-4" />
              Exit Edit
            </>
          ) : (
            <>
              <Settings className="w-4 h-4" />
              Edit Mode
            </>
          )}
        </Button>

        {isEditMode && hasUnsavedChanges && (
          <Button
            size="sm"
            variant="default"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-green-600 hover:bg-green-700"
            data-testid="button-save-floating"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save ({Object.keys(pendingChanges).length})
              </>
            )}
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setLocation('/admin')}
          className="gap-2"
          data-testid="button-admin-panel"
        >
          <Settings className="w-4 h-4" />
          Panel
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleLogout}
          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          data-testid="button-logout-floating"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      {isEditMode && (
        <div className="bg-blue-600 text-white text-xs px-3 py-2 rounded-lg text-center max-w-[180px]">
          <div className="font-medium mb-1">Edit Mode Active</div>
          <div className="text-blue-200 text-[10px]">Click text to edit and hover for controls</div>
        </div>
      )}
    </div>
  );
}
