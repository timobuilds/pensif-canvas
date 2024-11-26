'use client';

import { useState } from 'react';
import { ApiUsage } from '@/app/lib/types/canvas';

interface AIModelManagerProps {
  apiUsage: ApiUsage;
  spendLimit: number;
  onSpendLimitChange: (limit: number) => void;
  onApiKeyChange: (model: keyof ApiUsage, key: string) => void;
}

export function AIModelManager({
  apiUsage,
  spendLimit,
  onSpendLimitChange,
  onApiKeyChange,
}: AIModelManagerProps) {
  const [activeTab, setActiveTab] = useState<'keys' | 'spend'>('keys');
  const [showKeys, setShowKeys] = useState(false);

  const totalSpend = Object.values(apiUsage).reduce(
    (acc, curr) => acc + curr.spend,
    0
  );

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-neutral-700">
        <h3 className="text-sm font-medium text-neutral-100">AI Model Manager</h3>
        <div className="flex gap-1">
          <button
            className={`px-2 py-1 text-xs rounded ${
              activeTab === 'keys'
                ? 'bg-neutral-700 text-neutral-100'
                : 'text-neutral-400 hover:text-neutral-100'
            }`}
            onClick={() => setActiveTab('keys')}
          >
            Key Manager
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${
              activeTab === 'spend'
                ? 'bg-neutral-700 text-neutral-100'
                : 'text-neutral-400 hover:text-neutral-100'
            }`}
            onClick={() => setActiveTab('spend')}
          >
            Spend Manager
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'keys' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-400">API Keys</span>
              <button
                className="text-xs text-neutral-400 hover:text-neutral-100"
                onClick={() => setShowKeys(!showKeys)}
              >
                {showKeys ? 'Hide' : 'Show'} Keys
              </button>
            </div>
            {(Object.keys(apiUsage) as Array<keyof ApiUsage>).map((model) => (
              <div key={model} className="space-y-1">
                <label className="block text-xs text-neutral-400">
                  {model} API Key
                </label>
                <input
                  type={showKeys ? 'text' : 'password'}
                  className="w-full px-2 py-1 text-xs bg-neutral-900 border border-neutral-700 rounded"
                  placeholder="Enter API key..."
                  onChange={(e) => onApiKeyChange(model, e.target.value)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">
                Spend Limit
              </label>
              <input
                type="number"
                className="w-full px-2 py-1 text-xs bg-neutral-900 border border-neutral-700 rounded"
                value={spendLimit}
                onChange={(e) => onSpendLimitChange(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              {(Object.entries(apiUsage) as Array<[keyof ApiUsage, { calls: number; spend: number }]>).map(
                ([model, usage]) => (
                  <div key={model} className="flex justify-between text-xs">
                    <span className="text-neutral-400">{model}</span>
                    <div className="text-right">
                      <div className="text-neutral-100">
                        ${usage.spend.toFixed(2)}
                      </div>
                      <div className="text-neutral-500">{usage.calls} calls</div>
                    </div>
                  </div>
                )
              )}
              <div className="pt-2 mt-2 border-t border-neutral-700 flex justify-between text-xs">
                <span className="font-medium text-neutral-100">Total</span>
                <span className="font-medium text-neutral-100">
                  ${totalSpend.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Warning if approaching limit */}
      {totalSpend > spendLimit * 0.8 && (
        <div className="p-2 bg-red-900/20 border-t border-red-900/30 text-red-400 text-xs">
          Approaching spend limit (${spendLimit.toFixed(2)})
        </div>
      )}
    </div>
  );
}
