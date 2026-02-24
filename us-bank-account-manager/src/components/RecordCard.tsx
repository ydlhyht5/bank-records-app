import { motion } from 'motion/react';
import { BankRecord, LeadBankRecord, WellsFargoRecord } from '../types';
import { Copy, Edit2, Trash2, RotateCcw, XCircle, CheckCircle2, DollarSign } from 'lucide-react';
import { useState } from 'react';

interface RecordCardProps {
  key?: string | number;
  record: BankRecord;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  isRecycleBin: boolean;
  onManageTransactions?: () => void;
}

export function RecordCard({ record, onEdit, onDelete, onRestore, onPermanentDelete, isRecycleBin, onManageTransactions }: RecordCardProps) {
  const [copied, setCopied] = useState(false);

  const LEAD_BANK_ADDR = "1801 Main St, Kansas City, Missouri, 64108";
  const WF_BANK_ADDR = "420 Montgomery Street, San Francisco, CA 94104";

  const generateCopyText = () => {
    const isLead = record.bankType === 'Lead Bank';
    const r = record as any;
    
    const text = `编号/邮箱: ${r.emailId}
账户名(Acc Name) : ${r.firstName} ${r.lastName}
wire路由(Routing No): ${isLead ? r.routing : r.wire}
账号(Account No): ${r.accountNo}
银行(Bank Name): ${isLead ? 'Lead Bank' : 'Wells Fargo'}
银行地址(Bank Address): ${isLead ? LEAD_BANK_ADDR : WF_BANK_ADDR}
收款人地址(Receiver Address): ${isLead ? '' : r.receiverAddress}
生日(DOB): ${isLead ? '' : r.dob}`;

    return text;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateCopyText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const isLead = record.bankType === 'Lead Bank';

  const getRemainingLimit = (transactions: any[] = []) => {
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
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative group h-full"
    >
      <div className="breathing-border rounded-3xl h-full">
        <div className="glass-panel rounded-3xl p-6 h-full flex flex-col relative overflow-hidden">
          {/* Bank Type Badge */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold tracking-tight truncate">{record.firstName} {record.lastName}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{record.emailId}</p>
            </div>
            <div className={`px-3 py-1 text-xs font-medium rounded-full ${
              isLead 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' 
                : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
            }`}>
              {record.bankType}
            </div>
          </div>

          {!isLead && (
            <div className="mb-4 p-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 mb-1">剩余转出额度 (30天)</span>
                <span className={`text-xl font-semibold tracking-tight ${getRemainingLimit((record as WellsFargoRecord).transactions) < 10000 ? 'text-red-500' : 'text-emerald-500'}`}>
                  ${getRemainingLimit((record as WellsFargoRecord).transactions).toLocaleString()}
                </span>
              </div>
              <button
                onClick={onManageTransactions}
                className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-700 shadow-sm rounded-xl text-blue-500 hover:text-blue-600 transition-colors cursor-pointer text-sm font-medium"
                title="管理额度"
              >
                <DollarSign className="w-4 h-4" />
                管理入账
              </button>
            </div>
          )}

          <div className="space-y-3 text-sm flex-1 mb-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-slate-500">账号</span>
              <span className="font-mono font-medium">{record.accountNo}</span>
            </div>
            
            {isLead ? (
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500">路由</span>
                <span className="font-mono font-medium">{(record as LeadBankRecord).routing}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">Wire</span>
                  <span className="font-mono font-medium">{(record as WellsFargoRecord).wire}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">ACH</span>
                  <span className="font-mono font-medium">{(record as WellsFargoRecord).ach}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto pt-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? '已复制' : '复制信息'}
            </button>

            <div className="flex items-center gap-1">
              {!isRecycleBin ? (
                <>
                  <button onClick={onEdit} className="p-2.5 text-slate-400 hover:text-blue-600 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" title="编辑">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={onDelete} className="p-2.5 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" title="删除">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={onRestore} className="p-2.5 text-slate-400 hover:text-emerald-500 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" title="恢复">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button onClick={onPermanentDelete} className="p-2.5 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" title="彻底删除">
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
