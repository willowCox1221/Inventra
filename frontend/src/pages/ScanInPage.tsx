import { scanIn } from '../api/client';
import ScanPageContent from '../components/ScanPageContent';

/** Route page for adding a tool to inventory by scanning its barcode. */
export default function ScanInPage() {
  return (
    <ScanPageContent
      title="Scan In"
      description="Scan a tool barcode to add it to inventory."
      submitLabel="Scan In"
      onScan={scanIn}
    />
  );
}
