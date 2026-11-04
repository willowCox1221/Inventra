import { useState } from 'react';
import BarcodeEntryForm from './BarcodeEntryForm';

interface ScanPageContentProps {
  title: string;
  description: string;
  submitLabel: string;
  /** Sends the barcode to the API. */
  onScan: (barcode: string) => Promise<unknown>;
}

/** Shared body of the Scan In / Scan Out pages. */
export default function ScanPageContent({
  title,
  description,
  submitLabel,
  onScan,
}: ScanPageContentProps) {
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(barcode: string) {
    try {
      await onScan(barcode);
      setStatus({ ok: true, text: `Submitted ${barcode}.` });
    } catch {
      setStatus({ ok: false, text: `Could not submit ${barcode}. Please try again.` });
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-slate-600">{description}</p>
      </div>

      {/* TODO: Wire in the camera scanner here (getUserMedia + a barcode
          decoding library, not yet chosen). On a successful decode, call
          handleSubmit(decodedValue). */}
      <div className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white text-slate-500">
        Camera scanner coming soon
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Enter barcode manually</h2>
        <BarcodeEntryForm submitLabel={submitLabel} onSubmit={handleSubmit} />
        <p
          role="status"
          className={`mt-3 text-sm ${status?.ok === false ? 'text-red-700' : 'text-green-700'}`}
        >
          {status?.text}
        </p>
      </div>
    </section>
  );
}
