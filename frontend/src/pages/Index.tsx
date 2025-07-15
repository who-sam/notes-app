import { useState, useEffect } from 'react';
import { CreateNote } from '@/components/CreateNote';
import { NoteCard } from '@/components/NoteCard';
import { StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch notes from backend
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/notes`);
        if (!response.ok) {
          throw new Error(`Failed to fetch notes: ${response.status}`);
        }
        const data = await response.json();
        setNotes(data);
      } catch (err) {
        setError('Failed to connect to notes server. Please check your connection and try again.');
        console.error('API Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // Create new note via API
  const handleCreateNote = async (title: string, content: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      
      if (!response.ok) throw new Error('Failed to create note');
      
      const newNote = await response.json();
      setNotes(prevNotes => [newNote, ...prevNotes]);
    } catch (err) {
      console.error('Error creating note:', err);
      alert('Failed to create note. Please try again.');
    }
  };

  // Update existing note via API
  const handleEditNote = async (id: string, title: string, content: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      
      if (!response.ok) throw new Error('Failed to update note');
      
      const updatedNote = await response.json();
      setNotes(prevNotes => 
        prevNotes.map(note => note.id === id ? updatedNote : note)
      );
    } catch (err) {
      console.error('Error updating note:', err);
      alert('Failed to update note. Please try again.');
    }
  };

  // Delete note via API
  const handleDeleteNote = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/notes/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete note');
      
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (err) {
      console.error('Error deleting note:', err);
      alert('Failed to delete note. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <StickyNote className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">My Notes</h1>
        </div>

        {/* Create Note */}
        <div className="mb-6">
          <CreateNote onCreateNote={handleCreateNote} />
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notes...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <StickyNote className="w-16 h-16 text-destructive mx-auto mb-4" />
            <p className="text-destructive text-lg font-medium mb-2">{error}</p>
            <p className="text-muted-foreground mb-4">
              Make sure your backend server is running at {API_BASE}
            </p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Notes Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div key={note.id} className="group">
                <NoteCard
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && notes.length === 0 && (
          <div className="text-center py-12">
            <StickyNote className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No notes yet</h3>
            <p className="text-muted-foreground">Create your first note to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
