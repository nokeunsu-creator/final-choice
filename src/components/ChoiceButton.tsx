interface Props {
  label: string;
  disabled?: boolean;
  hint?: string | null;
  onClick: () => void;
}

export function ChoiceButton({ label, disabled, hint, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '14px 16px',
        background: disabled ? '#1a1a1a' : '#171717',
        color: disabled ? '#555' : '#f0f0f0',
        border: `1px solid ${disabled ? '#222' : '#333'}`,
        borderLeft: `3px solid ${disabled ? '#333' : '#ffaa00'}`,
        borderRadius: 6,
        fontSize: 15,
        fontFamily: 'inherit',
        marginBottom: 10,
        transition: 'transform 0.06s, background 0.15s, border-color 0.15s',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(0.98)';
      }}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = '#222';
      }}
      onMouseOut={(e) => (e.currentTarget.style.background = disabled ? '#1a1a1a' : '#171717')}
    >
      <div>{label}</div>
      {hint && (
        <div style={{ marginTop: 4, fontSize: 12, color: '#ff6666' }}>
          🔒 {hint}
        </div>
      )}
    </button>
  );
}
