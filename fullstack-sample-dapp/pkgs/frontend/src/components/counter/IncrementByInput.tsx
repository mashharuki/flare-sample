interface IncrementByInputProps {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export function IncrementByInput({ value, onChange, onSubmit, disabled = false }: IncrementByInputProps) {
  const isValid = value !== '' && !isNaN(parseInt(value, 10)) && parseInt(value, 10) > 0

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <input
        type="number"
        min="1"
        placeholder="Amount"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && isValid && !disabled) onSubmit() }}
        disabled={disabled}
        style={{
          flex: 1,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          padding: '11px 14px',
          fontFamily: '"Space Mono", monospace',
          fontSize: '13px',
          color: 'white',
          outline: 'none',
          opacity: disabled ? 0.4 : 1,
          transition: 'border-color 0.15s ease',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'rgba(232,87,63,0.5)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(255,255,255,0.1)'
        }}
      />
      <button
        onClick={onSubmit}
        disabled={disabled || !isValid}
        style={{
          padding: '11px 20px',
          borderRadius: '10px',
          background: isValid && !disabled
            ? 'linear-gradient(135deg, #E8573F, #C04530)'
            : 'rgba(255,255,255,0.06)',
          color: isValid && !disabled ? 'white' : 'rgba(255,255,255,0.3)',
          border: 'none',
          fontFamily: '"Space Grotesk", system-ui, sans-serif',
          fontWeight: 600,
          fontSize: '13px',
          cursor: disabled || !isValid ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.4 : 1,
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
        }}
      >
        + N
      </button>
    </div>
  )
}
