import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign } from 'lucide-react';

interface AddSavingsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (savings: any) => void;
}

export function AddSavingsModal({ open, onClose, onSave }: AddSavingsModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount) {
      setLoading(true);
      try {
        const savingsData = {
          amount: parseFloat(formData.amount),
          description: formData.description,
          date: formData.date || new Date().toISOString(),
        };
        const response = await fetch('/api/savings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(savingsData),
        });
        if (response.ok) {
          const data = await response.json();
          onSave(data.savings);
          setFormData({ amount: '', description: '', date: '' });
          onClose();
        } else {
          console.error('Failed to create savings');
        }
      } catch (error) {
        console.error('Error creating savings:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
            Add New Savings
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="text-lg font-bold"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add a note (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="resize-none"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Savings'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 