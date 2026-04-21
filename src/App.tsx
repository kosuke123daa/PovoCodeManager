import { useState } from 'react';

interface Voucher {
  description: string;
  code: string;
  remainingCount: number;
  totalCount: number;
  expiryDate: string;
}

const STORAGE_KEY = 'povo_voucher';

function load(): Voucher | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function save(v: Voucher) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function App() {
  const [voucher, setVoucher] = useState<Voucher | null>(load);
  const [editing, setEditing] = useState(!load());
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState<Voucher>(
    voucher ?? { description: '', code: '', remainingCount: 0, totalCount: 0, expiryDate: '' }
  );

  const expired = voucher ? new Date(voucher.expiryDate) < new Date(new Date().toDateString()) : false;
  const unavailable = !voucher || expired || voucher.remainingCount === 0;

  async function handleCopy() {
    if (unavailable || !voucher) return;
    await navigator.clipboard.writeText(voucher.code);
    const updated = { ...voucher, remainingCount: voucher.remainingCount - 1 };
    setVoucher(updated);
    save(updated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const v: Voucher = { ...form, code: form.code.trim().toUpperCase() };
    setVoucher(v);
    save(v);
    setEditing(false);
  }

  function set<K extends keyof Voucher>(key: K, value: Voucher[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  if (editing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-purple-600 px-5 py-4">
            <h1 className="text-white font-bold text-lg">povo バウチャー設定</h1>
          </div>
          <form onSubmit={handleSave} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
              <input
                type="text"
                required
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="例: データ使い放題（7日間）24回分"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">コード</label>
              <input
                type="text"
                required
                value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())}
                placeholder="例: PUL7D76ZRY5CHJ"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono tracking-wider outline-none focus:border-purple-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">利用可能回数</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.totalCount || ''}
                  onChange={e => {
                    const n = Math.max(1, parseInt(e.target.value, 10) || 1);
                    set('totalCount', n);
                    set('remainingCount', n);
                  }}
                  placeholder="24"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">残り回数</label>
                <input
                  type="number"
                  min={0}
                  max={form.totalCount}
                  value={form.remainingCount || ''}
                  onChange={e => set('remainingCount', Math.max(0, Math.min(form.totalCount, parseInt(e.target.value, 10) || 0)))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">入力期限</label>
              <input
                type="date"
                required
                value={form.expiryDate}
                onChange={e => set('expiryDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex gap-3 pt-1">
              {voucher && (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50"
                >
                  キャンセル
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 active:scale-95 transition-all"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (!voucher) return null;

  const pct = (voucher.remainingCount / voucher.totalCount) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-gray-700">povo バウチャー</h1>
          <button
            onClick={() => { setForm(voucher); setEditing(true); }}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            編集
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md p-5 space-y-4">
          <p className="font-semibold text-gray-800">{voucher.description}</p>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            disabled={unavailable}
            className={`w-full flex items-center justify-between px-4 py-4 rounded-xl font-mono font-semibold text-base tracking-widest transition-all duration-150 ${
              unavailable
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : copied
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-purple-50 text-purple-800 border-2 border-purple-200 hover:bg-purple-100 active:scale-95 cursor-pointer'
            }`}
          >
            <span>{voucher.code}</span>
            <span className="text-sm font-sans font-normal ml-2">
              {copied ? '✓ コピー済' : unavailable ? '使用不可' : 'タップでコピー'}
            </span>
          </button>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-500">残り利用回数</span>
              <span className={`font-bold text-base ${voucher.remainingCount === 0 ? 'text-red-500' : voucher.remainingCount <= 3 ? 'text-orange-500' : 'text-green-600'}`}>
                {voucher.remainingCount} / {voucher.totalCount} 回
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  voucher.remainingCount === 0 ? 'bg-red-400' : voucher.remainingCount <= 3 ? 'bg-orange-400' : 'bg-green-500'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Expiry */}
          <div className="flex items-center justify-between text-sm pt-1 border-t border-gray-100">
            <span className="text-gray-500">入力期限</span>
            <span className={`font-medium ${expired ? 'text-red-500' : 'text-gray-700'}`}>
              {formatDate(voucher.expiryDate)}{expired ? '（期限切れ）' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
