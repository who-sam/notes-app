import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Save, X } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NoteCardProps {
  note: Note;
  onEdit: (id: string, title: string, content: string) => void;
  onDelete: (id: string) => void;
}

export const NoteCard = ({ note, onEdit, onDelete }: NoteCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    onEdit(note.id, editTitle, editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(note.id);
  };

  return (
    <Card className="bg-card hover:bg-secondary/50 transition-colors duration-200">
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="font-medium"
              placeholder="Note title..."
            />
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-24 resize-none"
              placeholder="Write your note here..."
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-foreground line-clamp-2">
                {note.title || 'Untitled'}
              </h3>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm line-clamp-4 whitespace-pre-wrap">
              {note.content || 'No content'}
            </p>
            
            <div className="text-xs text-muted-foreground">
              Created: {new Date(note.createdAt).toLocaleDateString()}
              {note.updatedAt !== note.createdAt && (
                <span className="ml-2">
                  Updated: {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
