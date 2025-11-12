'use client';

import React from 'react';

interface TreeNode {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | 'key';
  value: any;
  children?: TreeNode[];
  key?: string;
}

interface ParsingTreeViewerProps {
  data: any;
}

function buildTree(value: any, key?: string): TreeNode {
  if (value === null) {
    return { type: 'null', value: null, key };
  }

  if (typeof value === 'boolean') {
    return { type: 'boolean', value, key };
  }

  if (typeof value === 'number') {
    return { type: 'number', value, key };
  }

  if (typeof value === 'string') {
    return { type: 'string', value, key };
  }

  if (Array.isArray(value)) {
    return {
      type: 'array',
      value: `Array[${value.length}]`,
      children: value.map((item, index) => buildTree(item, String(index))),
      key,
    };
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    return {
      type: 'object',
      value: `Object{${entries.length}}`,
      children: entries.map(([k, v]) => ({
        ...buildTree(v, k),
        key: k,
      })),
      key,
    };
  }

  return { type: 'null', value: null, key };
}

function TreeNodeComponent({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const indent = depth * 20;
  const isExpanded = depth < 2; // Auto-expand first 2 levels

  const typeColors = {
    object: 'text-blue-600',
    array: 'text-purple-600',
    string: 'text-green-600',
    number: 'text-orange-600',
    boolean: 'text-indigo-600',
    null: 'text-slate-600',
    key: 'text-black',
  };

  const typeBgColors = {
    object: 'bg-blue-500/10 border-blue-500/20',
    array: 'bg-purple-500/10 border-purple-500/20',
    string: 'bg-green-500/10 border-green-500/20',
    number: 'bg-orange-500/10 border-orange-500/20',
    boolean: 'bg-indigo-500/10 border-indigo-500/20',
    null: 'bg-slate-500/10 border-slate-500/20',
    key: 'bg-gray-500/10 border-gray-500/20',
  };

  const [expanded, setExpanded] = React.useState(isExpanded);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="font-mono text-sm">
      <div
        className={`flex items-center gap-2 p-2 rounded border cursor-pointer hover:opacity-80 transition-opacity ${
          typeBgColors[node.type]
        }`}
        style={{ marginLeft: `${indent}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren && (
          <span className="text-black/40 w-4 text-center">
            {expanded ? '▼' : '▶'}
          </span>
        )}
        {!hasChildren && <span className="w-4" />}
        {node.key && (
          <span className="font-medium text-black/80">
            {JSON.stringify(node.key)}:
          </span>
        )}
        <span className={typeColors[node.type]}>
          {node.type === 'string' ? JSON.stringify(node.value) : String(node.value)}
        </span>
        <span className="text-black/40 text-xs ml-auto">
          {node.type}
        </span>
      </div>
      {hasChildren && expanded && (
        <div className="mt-1">
          {node.children!.map((child, index) => (
            <TreeNodeComponent key={index} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ParsingTreeViewer({ data }: ParsingTreeViewerProps) {
  const tree = React.useMemo(() => buildTree(data), [data]);

  return (
    <div className="space-y-4">
      <div className="border border-black/10 p-4 bg-black/5">
        <h3 className="text-sm font-medium text-black/40 mb-2 uppercase tracking-wider font-mono">
          Tree Structure
        </h3>
        <p className="text-sm text-black/60 font-mono">
          Click nodes to expand/collapse
        </p>
      </div>

      <div className="border border-black/10 p-4 max-h-96 overflow-y-auto">
        <TreeNodeComponent node={tree} />
      </div>
    </div>
  );
}

