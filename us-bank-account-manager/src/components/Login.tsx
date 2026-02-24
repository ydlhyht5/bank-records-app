import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';

export function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '8278') {
      onLogin();
    } else {
      setError('用户名或密码错误');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="breathing-border rounded-[2rem] w-full max-w-sm"
      >
        <div className="glass-panel rounded-[2rem] p-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-6 shadow-md">
            <Lock className="text-white dark:text-black w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold mb-2 tracking-tight">账户管理</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">请输入凭据以访问系统</p>
          
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <input
                type="text"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors mt-2 cursor-pointer shadow-sm"
            >
              登录
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
