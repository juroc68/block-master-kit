type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

export function NumberField({ label, value, onChange }: NumberFieldProps) {
  return (
    <label>
      {label}
      <input
        type="number"
        step="0.1"
        value={Number.isFinite(value) ? value.toFixed(2) : "0.00"}
        onChange={(event) => {
          const nextValue = Number(event.target.value);
          if (Number.isFinite(nextValue)) {
            onChange(nextValue);
          }
        }}
      />
    </label>
  );
}
