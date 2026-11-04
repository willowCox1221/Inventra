import { useId, useState, type FormEvent } from 'react';

interface BarcodeEntryFormProps {
  submitLabel: string;
  onSubmit: (barcode: string) => void;
}

/** Manual barcode entry, used as a fallback when camera scanning isn't available. */
export default function BarcodeEntryForm({ submitLabel, onSubmit }: BarcodeEntryFormProps) {
  const inputId = useId();
  const [barcode, setBarcode] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = barcode.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setBarcode('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          Barcode
        </label>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
      <button
        type="submit"
        disabled={!barcode.trim()}
        className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  );
}
