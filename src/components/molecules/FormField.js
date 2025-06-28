import Input from '../atoms/Input';

export default function FormField({ label, name, value, onChange, type = "text", error }) {
  return (
    <div>
      <Input label={label} name={name} value={value} onChange={onChange} type={type} />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
