import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Transaction, WellsFargoRecord } from '../types';

interface Props {
  record: WellsFargoRecord;
  onClose: () => void;
  onSave: (transactions: Transaction[]) => void;
}

export function TransactionManager({ record, onClose, onSave }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>(record.transactions || []);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const generateId = () => {
    try {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) {}
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!amount || !date) return;
    
    const newTx: Transaction = {
      id: generateId(),
      amount: parseFloat(amount),
      date
    };
    
    setTransactions([...transactions, newTx].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setAmount('');
  };

  const handleDelete = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const getRemainingLimit = () => {
    const MAX_LIMIT = 75000;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const recentTotal = transactions.reduce((sum, t) => {
      const tDate = new Date(t.date);
      tDate.setHours(0, 0, 0, 0);
      const diffTime = now.getTime() - tDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays <= 30) {
        return sum + t.amount;
      }
      return sum;
    }, 0);
    
    return MAX_LIMIT - recentTotal;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col glass-panel rounded-3xl breathing-border p-6 sm:p-8 shadow-2xl bg-white dark:bg-[#1c1c1e]"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold mb-2 tracking-tight">额度管理</h2>
        <p className="text-sm text-slate-500 mb-6">Wells Fargo 30天滚动额度: $75,000</p>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-6 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700/50">
          <span className="text-sm text-slate-500 mb-2">当前剩余转出额度</span>
          <span className={`text-4xl font-semibold tracking-tight ${getRemainingLimit() < 10000 ? 'text-red-500' : 'text-emerald-500'}`}>
            ${getRemainingLimit().toLocaleString()}
          </span>
        </div>

        <form onSubmit={handleAdd} className="flex gap-3 mb-6">
          <div className="flex-1">
            <input
              type="number"
              step="0.01"
              placeholder="入账金额 ($)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              required
            />
          </div>
          <div className="flex-1">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center justify-center cursor-pointer shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        <div className="flex-1 overflow-y-auto min-h-[200px] pr-2">
          <h3 className="text-sm font-medium text-slate-500 mb-3">入账记录</h3>
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">暂无记录</p>
          ) : (
            <div className="space-y-2">
              {transactions.map(t => {
                const tDate = new Date(t.date);
                tDate.setHours(0, 0, 0, 0);
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const diffDays = Math.floor((now.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24));
                const isActive = diffDays >= 0 && diffDays <= 30;

                return (
                  <div key={t.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">${t.amount.toLocaleString()}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{t.date} {isActive ? <span className="text-amber-500">(占用额度中)</span> : <span className="text-emerald-500">(已恢复)</span>}</div>
                    </div>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={() => onSave(transactions)}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors cursor-pointer shadow-sm"
          >
            保存记录
          </button>
        </div>
      </motion.div>
    </div>
  );
}
