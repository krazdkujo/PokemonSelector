'use client';

import { useState, useEffect } from 'react';
import type { SecretKeyMeta, SecretKeyResponse } from '@/lib/types';

interface SecretKeyManagerProps {
  trainerId: string;
}

export function SecretKeyManager({ trainerId }: SecretKeyManagerProps) {
  const [keyMeta, setKeyMeta] = useState<SecretKeyMeta | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchKeyMeta();
  }, [trainerId]);

  async function fetchKeyMeta() {
    try {
      setLoading(true);
      const response = await fetch('/api/secret-key');
      if (response.ok) {
        const data: SecretKeyMeta = await response.json();
        setKeyMeta(data);
      } else {
        setError('Failed to fetch key status');
      }
    } catch {
      setError('Failed to fetch key status');
    } finally {
      setLoading(false);
    }
  }

  async function generateKey() {
    try {
      setGenerating(true);
      setError(null);
      setNewKey(null);

      const response = await fetch('/api/secret-key', {
        method: 'POST',
      });

      if (response.ok) {
        const data: SecretKeyResponse = await response.json();
        setNewKey(data.key);
        setKeyMeta({
          has_key: true,
          created_at: data.created_at,
          last_used_at: null,
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to generate key');
      }
    } catch {
      setError('Failed to generate key');
    } finally {
      setGenerating(false);
    }
  }

  async function copyToClipboard() {
    if (!newKey) return;

    try {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString();
  }

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-2">API Secret Key</h3>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold text-gray-800 mb-2">API Secret Key</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      {newKey && (
        <div className="bg-yellow-50 border border-yellow-400 rounded p-3 mb-3">
          <p className="text-yellow-800 text-sm font-medium mb-2">
            Your new secret key (save this - it won&apos;t be shown again):
          </p>
          <div className="flex items-center gap-2">
            <code className="bg-yellow-100 px-2 py-1 rounded text-sm break-all flex-1">
              {newKey}
            </code>
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 whitespace-nowrap"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {keyMeta?.has_key ? (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Status:</span> Active
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Created:</span> {formatDate(keyMeta.created_at)}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Last Used:</span> {formatDate(keyMeta.last_used_at)}
          </div>
          <button
            onClick={generateKey}
            disabled={generating}
            className="mt-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 text-sm"
          >
            {generating ? 'Generating...' : 'Regenerate Key'}
          </button>
          <p className="text-xs text-gray-500 mt-1">
            Warning: Regenerating will invalidate your current key.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 text-sm mb-3">
            Generate a secret key to access the API programmatically.
          </p>
          <button
            onClick={generateKey}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Secret Key'}
          </button>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Use this key with the X-API-Key header to authenticate API requests.
        </p>
      </div>

      {/* API Quick Reference */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <h4 className="font-medium text-gray-800 mb-3">API Quick Reference</h4>

        <div className="space-y-2 text-sm">
          <div className="bg-white rounded p-2 border">
            <div className="font-mono text-xs text-green-600">GET /api/external/trainer</div>
            <div className="text-gray-600 text-xs">Get your trainer profile and stats</div>
          </div>

          <div className="bg-white rounded p-2 border">
            <div className="font-mono text-xs text-green-600">GET /api/dashboard</div>
            <div className="text-gray-600 text-xs">Get dashboard data with active Pokemon</div>
          </div>

          <div className="bg-white rounded p-2 border">
            <div className="font-mono text-xs text-green-600">GET /api/pokecenter</div>
            <div className="text-gray-600 text-xs">List all your Pokemon</div>
          </div>

          <div className="bg-white rounded p-2 border">
            <div className="font-mono text-xs text-green-600">GET /api/pokedex</div>
            <div className="text-gray-600 text-xs">Browse all available Pokemon</div>
          </div>

          <div className="bg-white rounded p-2 border">
            <div className="font-mono text-xs text-blue-600">GET /api/zones</div>
            <div className="text-gray-600 text-xs">List combat zones (public)</div>
          </div>

          <div className="bg-white rounded p-2 border">
            <div className="font-mono text-xs text-green-600">POST /api/battle</div>
            <div className="text-gray-600 text-xs">Start a new battle in a zone</div>
          </div>

          <div className="bg-white rounded p-2 border">
            <div className="font-mono text-xs text-green-600">POST /api/capture</div>
            <div className="text-gray-600 text-xs">Attempt to capture a wild Pokemon</div>
          </div>
        </div>

        {/* Example cURL */}
        <div className="mt-4">
          <h5 className="font-medium text-gray-700 text-xs mb-2">Example Request</h5>
          <div className="bg-gray-800 rounded p-2 overflow-x-auto">
            <code className="text-xs text-green-400 whitespace-pre">
{`curl -H "X-API-Key: YOUR_KEY" \\
  https://your-domain/api/external/trainer`}
            </code>
          </div>
        </div>

        {/* Link to full docs */}
        <div className="mt-3 flex gap-4">
          <a
            href="/docs/API.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Full API Docs
          </a>
          <a
            href="/docs/openapi.yaml"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            OpenAPI Spec
          </a>
        </div>
      </div>
    </div>
  );
}
