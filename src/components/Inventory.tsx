interface Props {
  items: string[];
}

export function Inventory({ items }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        padding: '8px 0',
        minHeight: 28,
      }}
    >
      <span style={{ fontSize: 12, color: '#666', marginRight: 4, alignSelf: 'center' }}>
        소지품:
      </span>
      {items.length === 0 ? (
        <span style={{ fontSize: 12, color: '#444', fontStyle: 'italic' }}>없음</span>
      ) : (
        items.map((item) => (
          <span
            key={item}
            style={{
              fontSize: 12,
              padding: '3px 8px',
              background: '#222',
              border: '1px solid #444',
              borderRadius: 999,
              color: '#ffaa00',
            }}
          >
            {item}
          </span>
        ))
      )}
    </div>
  );
}
