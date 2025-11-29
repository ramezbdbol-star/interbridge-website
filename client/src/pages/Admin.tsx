import { useState } from 'react';
import { useAdmin } from '@/lib/adminContext';
import { useContent } from '@/lib/contentContext';
import { useLocation } from 'wouter';
import { 
  Lock, 
  LogOut, 
  Edit3, 
  Save, 
  Eye, 
  Check, 
  X, 
  AlertCircle,
  Home,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Admin() {
  const { isAdmin, isLoading, login, logout } = useAdmin();
  const { isEditMode, setEditMode, saveAllChanges, hasUnsavedChanges, pendingChanges } = useContent();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    const result = await login(username, password);
    
    if (!result.success) {
      setLoginError(result.message || 'Login failed');
    } else {
      toast({
        title: "Welcome, Admin!",
        description: "You can now edit your website content.",
      });
    }
    
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await logout();
    setEditMode(false);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveAllChanges();
    
    toast({
      title: result.success ? "Saved!" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive"
    });
    
    setIsSaving(false);
  };

  const goToWebsite = () => {
    setLocation('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2" data-testid="text-login-error">
                  <AlertCircle className="w-4 h-4" />
                  {loginError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  data-testid="input-admin-username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  data-testid="input-admin-password"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoggingIn}
                data-testid="button-admin-login"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            
            <div className="mt-6 pt-6 border-t">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={goToWebsite}
                data-testid="button-back-to-website"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Website
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Admin Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900">Admin Panel</h1>
                <p className="text-xs text-slate-500">InterBridge Website Editor</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {hasUnsavedChanges && (
                <span className="text-amber-600 text-sm font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {Object.keys(pendingChanges).length} unsaved changes
                </span>
              )}
              
              <Button 
                variant="outline" 
                onClick={handleLogout}
                data-testid="button-admin-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Edit Mode Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                Edit Mode
              </CardTitle>
              <CardDescription>
                Toggle edit mode to modify your website content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">Edit Mode Status</p>
                  <p className="text-sm text-slate-500">
                    {isEditMode ? 'Currently editing - click text on website to edit' : 'View only mode'}
                  </p>
                </div>
                <Button
                  variant={isEditMode ? "default" : "outline"}
                  onClick={() => setEditMode(!isEditMode)}
                  data-testid="button-toggle-edit-mode"
                >
                  {isEditMode ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Editing On
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Enable Editing
                    </>
                  )}
                </Button>
              </div>
              
              <Button 
                className="w-full" 
                onClick={goToWebsite}
                data-testid="button-go-to-website"
              >
                <Eye className="w-4 h-4 mr-2" />
                Go to Website {isEditMode && '(Edit Mode)'}
              </Button>
            </CardContent>
          </Card>

          {/* Save Changes Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="w-5 h-5 text-green-600" />
                Save Changes
              </CardTitle>
              <CardDescription>
                Save all your edits to the database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-slate-900">Pending Changes</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    hasUnsavedChanges 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {Object.keys(pendingChanges).length} changes
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {hasUnsavedChanges 
                    ? 'You have unsaved changes that will be lost if you leave'
                    : 'All changes have been saved'}
                </p>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                data-testid="button-save-changes"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save All Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Edit Your Website</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3 text-slate-600">
              <li className="p-3 bg-slate-50 rounded-lg">
                <strong>Enable Edit Mode</strong> - Click the "Enable Editing" button above
              </li>
              <li className="p-3 bg-slate-50 rounded-lg">
                <strong>Go to Website</strong> - Click "Go to Website" to see your site with editable fields
              </li>
              <li className="p-3 bg-slate-50 rounded-lg">
                <strong>Edit Text</strong> - Click on any text with a <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">blue highlight</span> to edit it
              </li>
              <li className="p-3 bg-slate-50 rounded-lg">
                <strong>Save Changes</strong> - Return here or use the floating save button to save your edits
              </li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
