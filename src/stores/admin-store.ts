import { create } from "zustand";
import type { Expense, ScanLog } from "@/lib/types/database";

interface AdminState {
  expenses: Expense[];
  scanLogs: ScanLog[];
  totalBudget: number;
  monthlyLimit: number;
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  setScanLogs: (logs: ScanLog[]) => void;
  addScanLog: (log: ScanLog) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  expenses: [],
  scanLogs: [],
  totalBudget: 35000,
  monthlyLimit: 35000,
  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) =>
    set((state) => ({ expenses: [...state.expenses, expense] })),
  removeExpense: (id) =>
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),
  setScanLogs: (scanLogs) => set({ scanLogs }),
  addScanLog: (log) =>
    set((state) => ({ scanLogs: [log, ...state.scanLogs] })),
}));
