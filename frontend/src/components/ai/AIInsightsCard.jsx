import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, Info, ChevronRight, X } from 'lucide-react';
import { getAIInsights } from '../../api/insightApi';

const AIInsightsCard = () => {
  const [insights, setInsights] = useState(null);
  const [calculations, setCalculations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const data = await getAIInsights();
        setInsights(data.aiInsights);
        setCalculations(data.calculations);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Unable to load AI insights at the moment.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center py-12 gap-3">
        <Sparkles className="w-8 h-8 text-primary-505 animate-pulse" />
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
          Gathering stats & compiling AI insights...
        </p>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center py-8 gap-2 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
          {error || 'No insights available'}
        </p>
        <p className="text-xs text-gray-450 dark:text-gray-500">
          Make sure your server is running and database has transaction data.
        </p>
      </div>
    );
  }

  // Choose bullet summaries to display on card
  const cardHighlights = [];
  if (insights.warnings && insights.warnings.length > 0) {
    cardHighlights.push({ text: insights.warnings[0], type: 'warning' });
  }
  if (insights.strengths && insights.strengths.length > 0) {
    cardHighlights.push({ text: insights.strengths[0], type: 'strength' });
  }
  // Fill up if low highlights
  if (cardHighlights.length < 2 && insights.recommendations && insights.recommendations.length > 0) {
    cardHighlights.push({ text: insights.recommendations[0], type: 'tip' });
  }

  return (
    <>
      <div className="bg-gradient-to-br from-indigo-50/50 to-sky-50/50 dark:from-indigo-950/20 dark:to-sky-950/20 border border-indigo-100/50 dark:border-darkBorder rounded-2xl p-6 shadow-sm space-y-4 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute -right-12 -top-12 w-24 h-24 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500 text-white rounded-lg shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-gray-900 dark:text-white">
            🤖 AI Spending Insights
          </h3>
        </div>

        {/* Short Summary text */}
        <p className="text-sm font-medium text-gray-600 dark:text-gray-350 line-clamp-2">
          {insights.summary}
        </p>

        {/* Highlights List */}
        <div className="space-y-2.5">
          {cardHighlights.map((hl, idx) => (
            <div key={idx} className="flex gap-2.5 items-start">
              {hl.type === 'warning' ? (
                <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
              ) : hl.type === 'strength' ? (
                <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
              )}
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {hl.text}
              </span>
            </div>
          ))}
        </div>

        {/* View Details Button */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full mt-2 flex items-center justify-center gap-1 py-2 bg-white dark:bg-darkCard hover:bg-gray-50 dark:hover:bg-darkBg text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl border border-indigo-100 dark:border-darkBorder shadow-sm transition-all duration-200"
        >
          View Detailed Analysis
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl shadow-xl overflow-hidden animate-slide-in flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-darkBorder">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  AI Financial Analysis
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-grow">
              
              {/* Summary Block */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/10 p-4 rounded-xl border border-indigo-100/50 dark:border-darkBorder">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                  Executive Summary
                </h4>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                  {insights.summary}
                </p>
              </div>

              {/* Strengths & Alerts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Strengths Card */}
                <div className="p-4 bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-100/30 dark:border-darkBorder rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Positives & Strengths
                  </h4>
                  <ul className="space-y-1.5">
                    {insights.strengths?.map((str, idx) => (
                      <li key={idx} className="text-xs font-semibold text-gray-600 dark:text-gray-350 list-disc list-inside">
                        {str}
                      </li>
                    ))}
                    {(!insights.strengths || insights.strengths.length === 0) && (
                      <li className="text-xs italic text-gray-400">None logged</li>
                    )}
                  </ul>
                </div>

                {/* Alerts / Warnings Card */}
                <div className="p-4 bg-rose-50/20 dark:bg-rose-950/5 border border-rose-100/30 dark:border-darkBorder rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-450 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Alerts & Overruns
                  </h4>
                  <ul className="space-y-1.5">
                    {insights.warnings?.map((warn, idx) => (
                      <li key={idx} className="text-xs font-semibold text-gray-600 dark:text-gray-350 list-disc list-inside">
                        {warn}
                      </li>
                    ))}
                    {(!insights.warnings || insights.warnings.length === 0) && (
                      <li className="text-xs italic text-gray-400">All budgets within margins</li>
                    )}
                  </ul>
                </div>

              </div>

              {/* Actionable Recommendations */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Info className="w-4.5 h-4.5 text-indigo-500" />
                  Actionable Recommendations
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {insights.recommendations?.map((rec, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 dark:bg-darkBg border border-gray-150 dark:border-darkBorder rounded-xl flex gap-2.5 items-start">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 text-xs font-extrabold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {rec}
                      </p>
                    </div>
                  ))}
                  {(!insights.recommendations || insights.recommendations.length === 0) && (
                    <p className="text-xs italic text-gray-450 text-center py-2">No specific tips compiled</p>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-darkBg/50 border-t border-gray-100 dark:border-darkBorder flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-darkCard dark:hover:bg-darkBg border border-gray-300 dark:border-darkBorder rounded-xl font-bold text-xs text-gray-700 dark:text-gray-300 transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default AIInsightsCard;
