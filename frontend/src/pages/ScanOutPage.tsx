import { scanOut } from '../api/client';
import ScanPageContent from '../components/ScanPageContent';

/** Route page for removing a tool from inventory by scanning its barcode. */
export default function ScanOutPage() {
  return (
    <ScanPageContent
      title="Scan Out"
      description="Scan a tool barcode to remove it from inventory."
      submitLabel="Scan Out"
      onScan={scanOut}
    />
  );
}
