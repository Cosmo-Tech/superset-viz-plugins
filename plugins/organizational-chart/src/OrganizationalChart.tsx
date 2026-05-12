import { CSSProperties } from 'react';
import { OrganizationalChartProps, TreeNode, BoxConfig } from './types';

const COLOR_MAP: Record<BoxConfig['color'], CSSProperties> = {
  blue: { backgroundColor: '#1a3a6c', color: '#ffffff' },
  green: { backgroundColor: '#2e7d32', color: '#ffffff' },
  red: { backgroundColor: '#c62828', color: '#ffffff' },
  darkred: { backgroundColor: '#7b1a2c', color: '#ffffff' },
  grey: { backgroundColor: '#546e7a', color: '#ffffff' },
};

function Box({ node, fontSize }: { node: TreeNode; fontSize: number }) {
  const colorStyle = COLOR_MAP[node.box.color] || COLOR_MAP.grey;
  const boxStyle: CSSProperties = {
    ...colorStyle,
    borderRadius: 6,
    padding: '8px 16px',
    textAlign: 'center',
    minWidth: 100,
    display: 'inline-block',
  };

  return (
    <div style={boxStyle}>
      <div style={{ fontSize: fontSize * 0.85, opacity: 0.9 }}>{node.box.label}</div>
      <div style={{ fontSize: fontSize * 1.6, fontWeight: 700, marginTop: 2 }}>
        {node.value !== '' ? String(node.value) : '—'}
      </div>
    </div>
  );
}

function TreeLevel({ nodes, fontSize }: { nodes: TreeNode[]; fontSize: number }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      {nodes.map((node, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {/* Connector line from parent */}
          <div style={{ width: 2, height: 16, backgroundColor: '#888' }} />
          <Box node={node} fontSize={fontSize} />
          {node.children && node.children.length > 0 && (
            <>
              {/* Connector line to children */}
              <div style={{ width: 2, height: 16, backgroundColor: '#888' }} />
              {/* Horizontal line spanning children */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: node.children.length > 1 ? '25%' : '50%',
                    right: node.children.length > 1 ? '25%' : '50%',
                    height: 2,
                    backgroundColor: '#888',
                  }}
                />
              </div>
              <TreeLevel nodes={node.children} fontSize={fontSize} />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default function OrganizationalChart({
  height,
  width,
  fontSize,
  tree,
}: OrganizationalChartProps) {
  return (
    <div
      style={{
        height,
        width,
        overflow: 'auto',
        padding: 16,
        fontFamily: "'Inter', Helvetica, Arial, sans-serif",
        fontSize,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
      }}
    >
      <Box node={tree} fontSize={fontSize} />
      {tree.children && tree.children.length > 0 && (
        <>
          <div style={{ width: 2, height: 16, backgroundColor: '#888' }} />
          <TreeLevel nodes={tree.children} fontSize={fontSize} />
        </>
      )}
    </div>
  );
}
