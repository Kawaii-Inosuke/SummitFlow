"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/ui/admin-header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useAdminStore } from "@/stores/admin-store";
import { v4 as uuidv4 } from "uuid";
import type { ExpenseCategory } from "@/lib/types/database";

const CATEGORY_CONFIG: Record<ExpenseCategory, { color: string; icon: string; bgColor: string }> = {
  Hospitality: { color: "#EC5B13", icon: "🍽", bgColor: "bg-orange-50" },
  Marketing: { color: "#3B82F6", icon: "📢", bgColor: "bg-blue-50" },
  Operations: { color: "#22C55E", icon: "⚙", bgColor: "bg-green-50" },
  Logistics: { color: "#A855F7", icon: "🚚", bgColor: "bg-purple-50" },
  Other: { color: "#64748B", icon: "📋", bgColor: "bg-slate-50" },
};

const CATEGORY_BUDGETS: Record<string, number> = {
  Hospitality: 15000,
  Marketing: 11000,
  Operations: 15000,
  Logistics: 10000,
};

export default function BudgetTrackerPage() {
  const expenses = useAdminStore((s) => s.expenses);
  const addExpense = useAdminStore((s) => s.addExpense);
  const totalBudget = useAdminStore((s) => s.totalBudget);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({ amount: "", category: "Hospitality" as ExpenseCategory, description: "" });

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const available = totalBudget - totalSpent;
  const percentRemaining = Math.round((available / totalBudget) * 100);

  const categoryTotals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const handleAddExpense = () => {
    if (!newExpense.amount) return;
    addExpense({
      id: uuidv4(),
      event_id: "e1",
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      description: newExpense.description || null,
      logged_by: "u2",
      created_at: new Date().toISOString(),
    });
    setNewExpense({ amount: "", category: "Hospitality", description: "" });
    setShowAddForm(false);
  };

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentRemaining / 100);

  return (
    <div className="min-h-dvh bg-surface pb-20">
      <AdminHeader />

      <div className="px-5 py-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-4">Available Budget</p>
          <div className="flex justify-center">
            <div className="relative">
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="14" />
                <circle
                  cx="90" cy="90" r={radius} fill="none" stroke="#EC5B13" strokeWidth="14"
                  strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 90 90)" className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">&#8377;{available.toLocaleString()}</span>
                <span className="text-xs text-slate-400">{percentRemaining}% Remaining</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <span className="text-sm font-medium text-slate-700">Monthly Spending Limit</span>
            <span className="text-sm text-slate-400">&#8377;{totalBudget.toLocaleString()} total</span>
          </div>
          <p className="text-xs text-brand-orange mt-1">&#8377;{totalSpent.toLocaleString()} spent this month</p>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Spending Categories</h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-brand-orange text-xs font-semibold flex items-center gap-1"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add
            </button>
          </div>

          <div className="space-y-3">
            {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[])
              .filter((cat) => cat !== "Other" || categoryTotals[cat])
              .map((category) => {
                const config = CATEGORY_CONFIG[category];
                const spent = categoryTotals[category] || 0;
                const budget = CATEGORY_BUDGETS[category] || 10000;
                const percent = Math.min(Math.round((spent / budget) * 100), 100);

                return (
                  <div key={category} className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg ${config.bgColor} flex items-center justify-center text-sm`}>
                          {config.icon}
                        </div>
                        <span className="font-medium text-slate-900">{category}</span>
                      </div>
                      <span className="font-bold text-slate-900">&#8377;{spent.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%`, backgroundColor: config.color }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-slate-400">Budget: &#8377;{budget.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400">{percent}% used</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {showAddForm && (
          <BottomSheet title="Add Expense" onClose={() => setShowAddForm(false)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input type="number" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} placeholder="0.00" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-orange" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as ExpenseCategory })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-orange appearance-none bg-white">
                  {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input type="text" value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} placeholder="What was this for?" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-orange" />
              </div>
              <button onClick={handleAddExpense} disabled={!newExpense.amount} className="w-full bg-brand-orange text-white font-semibold py-3 rounded-xl hover:bg-brand-orange-hover transition-colors disabled:opacity-50">
                Add Expense
              </button>
            </div>
          </BottomSheet>
        )}
      </div>

      <BottomNav variant="admin" />
    </div>
  );
}
