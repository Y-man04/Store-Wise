import { useEffect } from 'react';
import Receipt from './Receipt';

const ReceiptPrint = ({ sale, cashierName, onClose }) => {
  useEffect(() => {
    // Small delay to ensure render before print
    const timer = setTimeout(() => {
      window.print();
      onClose?.();
    }, 300);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="print-only">
      <Receipt sale={sale} cashierName={cashierName} />
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-only, .print-only * { visibility: visible !important; }
          .print-only { position: absolute; left: 0; top: 0; width: 100%; }
        }
        @media screen {
          .print-only { display: none; }
        }
      `}</style>
    </div>
  );
};

export default ReceiptPrint;