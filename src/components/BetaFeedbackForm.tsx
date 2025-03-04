
import React, { useState } from 'react';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

type FeedbackType = 'bug' | 'feature' | 'experience' | 'other';

export const BetaFeedbackForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real implementation, this would send data to a server
    console.log({
      type: feedbackType,
      message,
      rating,
      timestamp: new Date().toISOString(),
      user: localStorage.getItem('betster-user') ? JSON.parse(localStorage.getItem('betster-user')!) : null
    });
    
    toast({
      title: "Thank you for your feedback!",
      description: "Your input helps us improve the app.",
    });
    
    // Reset form
    setMessage('');
    setRating(3);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button 
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setIsOpen(true)}
      >
        Beta Feedback
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Beta Testing Feedback</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Feedback Type</label>
            <select 
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
            >
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="experience">User Experience</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">Your Feedback</label>
            <textarea 
              className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[100px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please describe your feedback in detail..."
              required
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">Rate Your Experience (1-5)</label>
            <div className="flex justify-between items-center">
              <span>Poor</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      rating >= value ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                    onClick={() => setRating(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span>Excellent</span>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Feedback
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
