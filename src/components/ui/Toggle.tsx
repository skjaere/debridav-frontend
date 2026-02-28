interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
        border-2 border-transparent transition-colors duration-200 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-drac-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-drac-bg
        disabled:cursor-not-allowed disabled:opacity-50
        ${checked ? 'bg-drac-cyan' : 'bg-drac-current'}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-drac-fg shadow-sm
          ring-0 transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  )
}
