import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Story } from '@/types';
import { BookOpen } from 'lucide-react';

interface StoryCardProps {
  story: Story;
  onSelect: () => void;
}

export const StoryCard = ({ story, onSelect }: StoryCardProps) => {
  return (
    <Card 
      className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-2 cursor-pointer bg-gradient-to-br from-card to-muted/30"
      onClick={onSelect}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="text-5xl animate-float">{story.emoji || '📖'}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            <BookOpen className="w-3 h-3" />
            <span>{story.scenes} scenes</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {story.title}
          </h3>
          
          {story.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {story.description}
            </p>
          )}
          
          {story.themes && story.themes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {story.themes.map((theme) => (
                <span 
                  key={theme}
                  className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <Button 
          variant="hero" 
          size="lg" 
          className="w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          Select Story
        </Button>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Card>
  );
};
