'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Users, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AddDebtModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (debt: any) => void;
}

const categories = [
  { value: 'personal', label: 'Personal', icon: '👤' },
  { value: 'food', label: 'Food & Dining', icon: '🍽️' },
  { value: 'transport', label: 'Transportation', icon: '🚗' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'bills', label: 'Bills & Utilities', icon: '💡' },
  { value: 'emergency', label: 'Emergency', icon: '🚨' },
  { value: 'other', label: 'Other', icon: '📦' }
];

export function AddDebtModal({ open, onClose, onSave }: AddDebtModalProps) {
  const [formData, setFormData] = useState({
    type: 'LENT' as 'LENT' | 'BORROWED',
    person: '',
    amount: '',
    description: '',
    category: '',
    dueDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.person && formData.amount && formData.category) {
      onSave({
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date().toISOString().split('T')[0],
        status: 'PENDING'
      });
      setFormData({
        type: 'LENT',
        person: '',
        amount: '',
        description: '',
        category: '',
        dueDate: ''
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Add Debt/Credit Entry
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selection */}
          <div>
            <Label>Transaction Type *</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value: 'LENT' | 'BORROWED') => setFormData({ ...formData, type: value })}
              className="flex space-x-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="LENT" id="lent" />
                <Label htmlFor="lent" className="flex items-center cursor-pointer">
                  <ArrowUpRight className="w-4 h-4 mr-1 text-green-600" />
                  I Lent Money
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="BORROWED" id="borrowed" />
                <Label htmlFor="borrowed" className="flex items-center cursor-pointer">
                  <ArrowDownRight className="w-4 h-4 mr-1 text-red-600" />
                  I Borrowed Money
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Person Name */}
          <div>
            <Label htmlFor="person">Person Name *</Label>
            <Input
              id="person"
              placeholder="Who did you lend to / borrow from?"
              value={formData.person}
              onChange={(e) => setFormData({ ...formData, person: e.target.value })}
              required
            />
          </div>

          {/* Amount */}
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

          {/* Category */}
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
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center space-x-2">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date (Optional) */}
          <div>
            <Label htmlFor="dueDate">Due Date (Optional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What was this for?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="resize-none"
              rows={2}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              Save Entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}