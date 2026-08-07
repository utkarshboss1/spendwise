import React, { useState } from 'react';
import { X, Keyboard, Sparkles, ArrowLeft } from 'lucide-react';
import ReceiptUpload from '../receipt/ReceiptUpload';

const AddExpenseChoiceModal = ({ isOpen, onClose, onManualClick, onReceiptParsed }) => {
  const [showScanner, setShowScanner] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl shadow-xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-darkBorder">
          <div className="flex items-center gap-2">
            {showScanner && (
              <button
                onClick={() => setShowScanner(false)}
                className="mr-1 p-1 hover:bg-gray-100 dark:hover:bg-darkBg rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {showScanner ? 'Scan Expense Receipt' : 'Add Expense'}
            </h2>
          </div>
          <button
            onClick={() => {
              setShowScanner(false);
              onClose();
            }}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showScanner ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 text-center mb-2">
                How would you like to log this expense?
              </p>

              {/* Choice 1: Manual Entry */}
              <button
                onClick={() => {
                  onClose();
                  onManualClick();
                }}
                className="w-full p-4 border border-gray-200 dark:border-darkBorder bg-gray-50/50 dark:bg-darkBg/20 hover:border-primary-505/50 hover:bg-primary-50/5 dark:hover:bg-primary-950/5 rounded-2xl flex items-start gap-4 transition-all duration-200 text-left hover:-translate-y-0.5 group focus:outline-none"
              >
                <div className="p-3 bg-white dark:bg-darkCard rounded-xl border border-gray-150 dark:border-darkBorder shadow-sm text-gray-500 group-hover:text-primary-505 group-hover:border-primary-505/20 transition-all">
                  <Keyboard className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white group-hover:text-primary-505 transition-colors">
                    Enter Expense Manually
                  </h3>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 leading-normal">
                    Type in the title, amount, category, and other details yourself.
                  </p>
                </div>
              </button>

              {/* Choice 2: Receipt Scanning */}
              <button
                onClick={() => setShowScanner(true)}
                className="w-full p-4 border border-gray-200 dark:border-darkBorder bg-gray-50/50 dark:bg-darkBg/20 hover:border-indigo-505/50 hover:bg-indigo-50/5 dark:hover:bg-indigo-950/5 rounded-2xl flex items-start gap-4 transition-all duration-200 text-left hover:-translate-y-0.5 group focus:outline-none"
              >
                <div className="p-3 bg-white dark:bg-darkCard rounded-xl border border-gray-150 dark:border-darkBorder shadow-sm text-gray-505 group-hover:text-indigo-600 group-hover:border-indigo-505/20 transition-all">
                  <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    Scan Receipt (AI)
                  </h3>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 leading-normal">
                    Upload receipt image. AI extracts merchant, amount, category, and items automatically.
                  </p>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <ReceiptUpload
                onParsed={(parsedData, classification) => {
                  setShowScanner(false);
                  onClose();
                  onReceiptParsed(parsedData, classification);
                }}
              />
              <p className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 px-4">
                Supported formats: JPEG, JPG, PNG up to 5MB. Make sure the text on the receipt is clearly visible.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AddExpenseChoiceModal;
