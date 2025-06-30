import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign } from 'lucide-react';

const STATIC_CATEGORIES = [
  { name: 'Salary', icon: '💰', type: 'INCOME' },
  { name: 'Freelance', icon: '💼', type: 'INCOME' },
  { name: 'Investment', icon: '📈', type: 'INCOME' },
  { name: 'Other Income', icon: '💵', type: 'INCOME' },
];

interface AddIncomeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (income: any) => void;
}

export function AddIncomeModal({ open, onClose, onSave }: AddIncomeModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    source: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount && formData.category) {
      setLoading(true);
      try {
        // 1. Ensure the category exists in the DB, or create it
        let categoryId = '';
        const categoryObj = STATIC_CATEGORIES.find(c => c.name === formData.category);
        if (!categoryObj) throw new Error('Invalid category');
        // Try to get the category from the DB
        const catRes = await fetch(`/api/categories?type=INCOME`);
        let dbCategories = [];
        if (catRes.ok) {
          const data = await catRes.json();
          dbCategories = data.categories;
        }
        let dbCategory = dbCategories.find((c: any) => c.name === categoryObj.name && c.type === categoryObj.type);
        if (!dbCategory) {
          // Create the category in the DB
          const createRes = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: categoryObj.name, icon: categoryObj.icon, type: categoryObj.type }),
          });
          if (createRes.ok) {
            dbCategory = (await createRes.json()).category;
          }
        }
        if (!dbCategory) throw new Error('Could not create or find category');
        categoryId = dbCategory.id;

        // 2. Create the income
        const incomeData = {
          amount: parseFloat(formData.amount),
          categoryId,
          description: formData.description,
          merchant: formData.source,
          location: formData.location,
          date: new Date().toISOString(),
        };
        const response = await fetch('/api/incomes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(incomeData),
        });
        if (response.ok) {
          const data = await response.json();
          onSave(data.income);
          setFormData({
            amount: '',
            category: '',
            description: '',
            source: '',
            location: ''
          });
          onClose();
        } else {
          console.error('Failed to create income');
        }
      } catch (error) {
        console.error('Error creating income:', error);
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
            <DollarSign className="w-5 h-5 mr-2 text-emerald-600" />
            Add New Income
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
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {STATIC_CATEGORIES.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    <div className="flex items-center space-x-2">
                      <span>{category.icon || '💵'}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              placeholder="Where did you earn?"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
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
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Where did you earn? (optional)"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Income'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 