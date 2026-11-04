import { scanOut } from '../api/client';
import ScanPageContent from '../components/ScanPageContent';

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
