type FormFieldProps = {
  label: string;
  required?: boolean;
  id?: string;
  children: React.ReactNode;
};

export default function FormField({
  label,
  required,
  id,
  children,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-indigo-600">*</span>}
      </label>
      {children}
    </div>
  );
}
