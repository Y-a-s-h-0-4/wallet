'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign } from 'lucide-react';

const STATIC_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍽️', type: 'EXPENSE' },
  { name: 'Transportation', icon: '🚗', type: 'EXPENSE' },
  { name: 'Shopping', icon: '🛍️', type: 'EXPENSE' },
  { name: 'Bills & Utilities', icon: '💡', type: 'EXPENSE' },
  { name: 'Entertainment', icon: '🎬', type: 'EXPENSE' },
  { name: 'Healthcare', icon: '🏥', type: 'EXPENSE' },
  { name: 'Education', icon: '📚', type: 'EXPENSE' },
  { name: 'Other', icon: '📦', type: 'EXPENSE' },
];

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (expense: any) => void;
}

export function AddExpenseModal({ open, onClose, onSave }: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    merchant: '',
    location: '',
    type: 'EXPENSE',
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
        const catRes = await fetch(`/api/categories?type=EXPENSE`);
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

        // 2. Create the transaction (expense or income)
        const transactionData = {
          amount: parseFloat(formData.amount),
          categoryId,
          description: formData.description,
          merchant: formData.merchant,
          location: formData.location,
          date: new Date().toISOString(),
        };
        let response;
        if (formData.type === 'EXPENSE') {
          response = await fetch('/api/expenses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData),
          });
        } else {
          response = await fetch('/api/incomes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData),
          });
        }
        if (response.ok) {
          const data = await response.json();
          onSave(data.expense);
          setFormData({
            amount: '',
            category: '',
            description: '',
            merchant: '',
            location: '',
            type: 'EXPENSE',
          });
          onClose();
        } else {
          console.error('Failed to create transaction');
        }
      } catch (error) {
        console.error('Error creating transaction:', error);
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
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Add New Transaction
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
                      <span>{category.icon || '📦'}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="merchant">Merchant</Label>
            <Input
              id="merchant"
              placeholder="Where did you spend?"
              value={formData.merchant}
              onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
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
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}