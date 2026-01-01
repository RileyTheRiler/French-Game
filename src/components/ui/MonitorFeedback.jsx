import React from 'react';

// The "Monitor" hypothesis suggests conscious learning acts as an editor.
// This component visualizes that "Monitor" process gently.

const MonitorFeedback = ({ feedback, message }) => {
    if (!feedback) return null;

    const isSuccess = feedback === 'success';

    return (
        <div className={`
      fixed bottom-8 right-8 max-w-sm p-4 rounded-xl shadow-2xl border backdrop-blur-md transform transition-all duration-500 animate-slide-up
      ${isSuccess
                ? 'bg-green-500/20 border-green-400 text-green-100'
                : 'bg-indigo-500/20 border-indigo-400 text-indigo-100'}
    `}>
            <div className="flex items-start gap-3">
                <div className={`text-2xl ${isSuccess ? 'animate-bounce' : ''}`}>
                    {isSuccess ? '🧠' : '🤔'}
                </div>
                <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider mb-1">
                        {isSuccess ? 'Monitor Approved' : 'Monitor Check'}
                    </h4>
                    <p className="text-sm font-medium leading-relaxed">
                        {message || (isSuccess ? "Excellent syntax flow!" : "Hmm, something feels off...")}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MonitorFeedback;
