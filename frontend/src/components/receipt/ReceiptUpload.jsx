import React, { useState, useRef } from 'react';
import { FileText, Loader2, Sparkles, Upload } from 'lucide-react';
import { uploadReceipt } from '../../api/ocrApi';
import { useToast } from '../../context/ToastContext';

const ReceiptUpload = ({ onParsed, disabled, compact = false }) => {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const handleFile = async (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showToast('Please upload a valid image file (JPG, JPEG, or PNG)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size exceeds the 5MB limit', 'error');
      return;
    }

    setLoading(true);
    showToast('Uploading receipt image...', 'info');

    try {
      const data = await uploadReceipt(file);
      
      if (data.success) {
        console.log("========== OCR RESPONSE ==========");
        console.log(data);
        console.log("parsedData:", data.parsedData);
        console.log("classification:", data.classification);

        if (onParsed) {
          onParsed(data.parsedData, data.classification);
        }
      }
    } catch (err) {
      console.error(err);
      showToast(typeof err === 'string' ? err : 'OCR extraction failed. Please enter details manually.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  if (compact) {
    return (
      <div className="w-full sm:w-auto">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files[0])}
          disabled={loading || disabled}
        />
        <button
          onClick={onButtonClick}
          disabled={loading || disabled}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-505 to-sky-600 hover:from-indigo-600 hover:to-sky-700 disabled:opacity-50 text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-indigo-505/20 hover:shadow-indigo-600/30 transition-all hover:-translate-y-0.5 focus:outline-none h-[52px] shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              Scanning Receipt...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              Scan Receipt (AI)
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files[0])}
        disabled={loading || disabled}
      />
      
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`w-full p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-200 cursor-pointer ${
          dragActive
            ? 'border-primary-505 bg-primary-50/10 dark:bg-primary-950/10'
            : 'border-gray-200 dark:border-darkBorder bg-gray-50/50 dark:bg-darkCard/20 hover:border-primary-505/50 hover:bg-gray-100/50 dark:hover:bg-darkBg/20'
        } ${loading ? 'opacity-70 pointer-events-none' : ''}`}
        onClick={onButtonClick}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary-505 animate-spin" />
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              AI is reading your receipt...
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              Extracting receipt data & running smart classification (Mindee AI)
            </p>
          </div>
        ) : (
          <>
            <div className="p-3 bg-white dark:bg-darkCard rounded-xl border border-gray-150 dark:border-darkBorder shadow-sm text-gray-400 dark:text-gray-500">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Drag & drop or <span className="text-primary-505 hover:underline font-extrabold">browse</span> receipt
              </p>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Supports JPG, JPEG, PNG (max 5MB)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReceiptUpload;
