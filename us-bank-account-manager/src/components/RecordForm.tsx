import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { BankRecord, BankType, LeadBankRecord, WellsFargoRecord } from '../types';
import { X } from 'lucide-react';

interface RecordFormProps {
  record: BankRecord | null;
  onClose: () => void;
  onSave: (record: BankRecord) => void;
}

export function RecordForm({ record, onClose, onSave }: RecordFormProps) {
  const [bankType, setBankType] = useState<BankType>(record?.bankType || 'Lead Bank');
  
  // Common fields
  const [emailId, setEmailId] = useState(record?.emailId || '');
  const [firstName, setFirstName] = useState(record?.firstName || '');
  const [lastName, setLastName] = useState(record?.lastName || '');
  const [accountNo, setAccountNo] = useState(record?.accountNo || '');
  const [notes, setNotes] = useState(record?.notes || '');
  
  // Lead Bank fields
  const [routing, setRouting] = useState((record as LeadBankRecord)?.routing || '');
  
  // Wells Fargo fields
  const [dob, setDob] = useState((record as WellsFargoRecord)?.dob || '');
  const [ssn, setSsn] = useState((record as WellsFargoRecord)?.ssn || '');
  const [ach, setAch] = useState((record as WellsFargoRecord)?.ach || '');
  const [wire, setWire] = useState((record as WellsFargoRecord)?.wire || '');
  const [loginId, setLoginId] = useState((record as WellsFargoRecord)?.loginId || '');
  const [password, setPassword] = useState((record as WellsFargoRecord)?.password || '');
  const [receiverAddress, setReceiverAddress] = useState((record as WellsFargoRecord)?.receiverAddress || '');
  const [phone, setPhone] = useState((record as WellsFargoRecord)?.phone || '');
  const [phoneLink, setPhoneLink] = useState((record as WellsFargoRecord)?.phoneLink || '');
  const [phoneExpiry, setPhoneExpiry] = useState((record as WellsFargoRecord)?.phoneExpiry || '');

  const generateId = () => {
    try {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) {}
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const baseRecord = {
      id: record?.id || generateId(),
      emailId,
      firstName,
      lastName,
      accountNo,
      notes,
      createdAt: record?.createdAt || Date.now(),
      isDeleted: record?.isDeleted || false,
    };

    let newRecord: BankRecord;

    if (bankType === 'Lead Bank') {
      newRecord = {
        ...baseRecord,
        bankType: 'Lead Bank',
        routing,
      };
    } else {
      newRecord = {
        ...baseRecord,
        bankType: 'Wells Fargo',
        dob,
        ssn,
        ach,
        wire,
        loginId,
        password,
        receiverAddress,
        phone,
        phoneLink,
        phoneExpiry,
        transactions: (record as WellsFargoRecord)?.transactions || [],
      };
    }

    onSave(newRecord);
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
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel rounded-3xl breathing-border p-6 sm:p-8 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold mb-6 tracking-tight">{record ? '编辑记录' : '新增记录'}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!record && (
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-fit mb-6">
              <button
                type="button"
                onClick={() => setBankType('Lead Bank')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${bankType === 'Lead Bank' ? 'bg-white dark:bg-slate-700 shadow-sm text-black dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Lead Bank
              </button>
              <button
                type="button"
                onClick={() => setBankType('Wells Fargo')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${bankType === 'Wells Fargo' ? 'bg-white dark:bg-slate-700 shadow-sm text-black dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Wells Fargo
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="编号/邮箱" value={emailId} onChange={setEmailId} required />
            <InputField label="名字 (First Name)" value={firstName} onChange={setFirstName} required />
            <InputField label="姓 (Last Name)" value={lastName} onChange={setLastName} required />
            <InputField label="账号 (Account No)" value={accountNo} onChange={setAccountNo} required />

            {bankType === 'Lead Bank' ? (
              <>
                <InputField label="路由 (Routing)" value={routing} onChange={setRouting} required />
                <InputField label="银行名字" value="Lead Bank" onChange={() => {}} disabled />
                <InputField label="银行地址" value="1801 Main St, Kansas City, Missouri, 64108" onChange={() => {}} disabled className="sm:col-span-2" />
              </>
            ) : (
              <>
                <InputField label="生日 (DOB)" value={dob} onChange={setDob} placeholder="MM/DD/YYYY" />
                <InputField label="SSN" value={ssn} onChange={setSsn} />
                <InputField label="ACH" value={ach} onChange={setAch} />
                <InputField label="Wire" value={wire} onChange={setWire} />
                <InputField label="登录ID" value={loginId} onChange={setLoginId} />
                <InputField label="密码" value={password} onChange={setPassword} />
                <InputField label="收款人地址" value={receiverAddress} onChange={setReceiverAddress} className="sm:col-span-2" />
                <InputField label="接码手机" value={phone} onChange={setPhone} />
                <InputField label="接码链接" value={phoneLink} onChange={setPhoneLink} />
                <InputField label="号码过期" value={phoneExpiry} onChange={setPhoneExpiry} type="datetime-local" className="sm:col-span-2" />
                
                <InputField label="银行名字" value="Wells Fargo" onChange={() => {}} disabled />
                <InputField label="银行地址" value="420 Montgomery Street, San Francisco, CA 94104" onChange={() => {}} disabled className="sm:col-span-2" />
              </>
            )}

            <div className="sm:col-span-2 flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">
                备注信息 (Notes)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="输入任何需要备注的特殊信息..."
                rows={3}
                className="px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors cursor-pointer shadow-sm"
            >
              保存
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function InputField({ label, value, onChange, required, type = "text", className = "", placeholder = "", disabled = false }: any) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={`px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${
          disabled 
            ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed' 
            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50'
        }`}
      />
    </div>
  );
}
