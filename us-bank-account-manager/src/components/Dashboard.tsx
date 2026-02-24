import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BankRecord, WellsFargoRecord } from '../types';
import { RecordForm } from './RecordForm';
import { RecordCard } from './RecordCard';
import { TransactionManager } from './TransactionManager';
import { Plus, Trash2, Database, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [records, setRecords] = useState<BankRecord[]>([]);
  const [view, setView] = useState<'active' | 'recycle'>('active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BankRecord | null>(null);
  const [managingTransactionsFor, setManagingTransactionsFor] = useState<WellsFargoRecord | null>(null);

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from('records')
      .select('*, transactions(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching records:', error);
      return;
    }
    
    // Map snake_case back to camelCase for the frontend
    const formattedData = data?.map(record => ({
      ...record,
      bankType: record.bank_type,
      emailId: record.email_id,
      firstName: record.first_name,
      lastName: record.last_name,
      accountNo: record.account_no,
      loginId: record.login_id,
      receiverAddress: record.receiver_address,
      phoneLink: record.phone_link,
      phoneExpiry: record.phone_expiry,
      createdAt: record.created_at,
      isDeleted: record.is_deleted,
      transactions: record.transactions?.map((tx: any) => ({
        ...tx,
        recordId: tx.record_id
      }))
    }));
    
    setRecords(formattedData as BankRecord[]);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSave = async (record: BankRecord) => {
    const { transactions, ...recordData } = record as any;

    // Convert camelCase to snake_case for Supabase
    const supabaseData: any = {
      id: recordData.id,
      bank_type: recordData.bankType,
      email_id: recordData.emailId,
      first_name: recordData.firstName,
      last_name: recordData.lastName,
      account_no: recordData.accountNo,
      routing: recordData.routing || null,
      dob: recordData.dob || null,
      ssn: recordData.ssn || null,
      ach: recordData.ach || null,
      wire: recordData.wire || null,
      login_id: recordData.loginId || null,
      password: recordData.password || null,
      receiver_address: recordData.receiverAddress || null,
      phone: recordData.phone || null,
      phone_link: recordData.phoneLink || null,
      phone_expiry: recordData.phoneExpiry || null,
      created_at: recordData.createdAt,
      is_deleted: recordData.isDeleted ? true : false
    };

    const { error: recordError } = await supabase
      .from('records')
      .upsert(supabaseData);

    if (recordError) {
      console.error('Error saving record:', recordError);
      alert('保存失败: ' + recordError.message);
      return;
    }

    if (record.bankType === 'Wells Fargo' && transactions) {
      await supabase.from('transactions').delete().eq('record_id', record.id);
      if (transactions.length > 0) {
        const txsToInsert = transactions.map((tx: any) => ({
          id: tx.id,
          record_id: record.id,
          amount: tx.amount,
          date: tx.date
        }));
        await supabase.from('transactions').insert(txsToInsert);
      }
    }

    await fetchRecords();
    setIsFormOpen(false);
    setEditingRecord(null);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('records').update({ is_deleted: true }).eq('id', id);
    await fetchRecords();
  };

  const handleRestore = async (id: string) => {
    await supabase.from('records').update({ is_deleted: false }).eq('id', id);
    await fetchRecords();
  };

  const handlePermanentDelete = async (id: string) => {
    await supabase.from('records').delete().eq('id', id);
    await fetchRecords();
  };

  const activeRecords = records.filter(r => !r.isDeleted);
  const deletedRecords = records.filter(r => r.isDeleted);

  const displayedRecords = view === 'active' ? activeRecords : deletedRecords;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen flex flex-col">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6 glass-panel p-4 sm:p-6 rounded-3xl breathing-border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center shadow-md">
            <Database className="text-white dark:text-black w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">账户管理</h1>
            <p className="text-sm text-slate-500">管理您的银行账户信息</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl">
            <button
              onClick={() => setView('active')}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${view === 'active' ? 'bg-white dark:bg-slate-700 shadow-sm text-black dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              活跃记录
            </button>
            <button
              onClick={() => setView('recycle')}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${view === 'recycle' ? 'bg-white dark:bg-slate-700 shadow-sm text-black dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Trash2 className="w-4 h-4" />
              回收站
            </button>
          </div>
          
          <button
            onClick={() => {
              setEditingRecord(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap cursor-pointer shadow-sm ml-2"
          >
            <Plus className="w-5 h-5" />
            新增记录
          </button>
          
          <button
            onClick={onLogout}
            className="p-3 text-slate-400 hover:text-red-500 transition-colors cursor-pointer bg-slate-100 dark:bg-slate-800/50 rounded-2xl ml-1"
            title="退出登录"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1">
        <AnimatePresence mode="popLayout">
          {displayedRecords.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center h-64 text-slate-400"
            >
              <Database className="w-12 h-12 mb-4 opacity-20" />
              <p>暂无记录</p>
            </motion.div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {displayedRecords.map(record => (
                <RecordCard
                  key={record.id}
                  record={record}
                  onEdit={() => {
                    setEditingRecord(record);
                    setIsFormOpen(true);
                  }}
                  onDelete={() => handleDelete(record.id)}
                  onRestore={() => handleRestore(record.id)}
                  onPermanentDelete={() => handlePermanentDelete(record.id)}
                  isRecycleBin={view === 'recycle'}
                  onManageTransactions={record.bankType === 'Wells Fargo' ? () => setManagingTransactionsFor(record as WellsFargoRecord) : undefined}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isFormOpen && (
          <RecordForm
            record={editingRecord}
            onClose={() => setIsFormOpen(false)}
            onSave={handleSave}
          />
        )}
        {managingTransactionsFor && (
          <TransactionManager
            record={managingTransactionsFor}
            onClose={() => setManagingTransactionsFor(null)}
            onSave={(transactions) => {
              handleSave({ ...managingTransactionsFor, transactions });
              setManagingTransactionsFor(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
