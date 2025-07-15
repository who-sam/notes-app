import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Plus, Save, X } from 'lucide-react';

interface CreateNoteProps {
  onCreateNote: (title: string, content: string) => void;
}

export const CreateNote = ({ onCreateNote }: CreateNoteProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;
    onCreateNote(title, content);
    setTitle('');
    setContent('');
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setIsExpanded(false);
  };

  const handleExpand = () => {
    setIsExpanded(true);
  };

  return (
    <Card className="bg-card border-dashed border-2 border-muted hover:border-primary/50 transition-colors duration-200">
      <CardContent className="p-4">
        {!isExpanded ? (
          <Button
            variant="ghost"
            onClick={handleExpand}
            className="w-full h-12 text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-5 h-5 mr-2" />
            Take a note...
          </Button>
        ) : (
          <div className="space-y-3">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="font-medium"
            />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="min-h-24 resize-none"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={!title.trim() && !content.trim()}
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
