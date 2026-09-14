interface InputProps {
  name: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'textarea';
  required?: boolean;
}

export function Input({ name, placeholder, type = 'text', required }: InputProps) {
  if (type === 'textarea') {
    return (
      <textarea
        name={name}
        placeholder={placeholder}
        required={required}
        rows={5}
        className="input input--textarea"
      />
    );
  }

  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      className="input"
    />
  );
}
