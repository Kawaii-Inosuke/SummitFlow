"use client";

import { useEffect } from "react";


interface ToSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ToSModal({ isOpen, onClose }: ToSModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full sm:w-[90%] sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Terms of Service</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto text-sm text-slate-600 space-y-4">
          <p>
            Welcome to SummitFlow. By registering for this event, you agree to the following terms and conditions:
          </p>
          
          <h4 className="font-semibold text-slate-900 mt-4">1. Event Access & Conduct</h4>
          <p>
            Your ticket is non-transferable. You must carry a valid University ID or equivalent proof for verification at the venue. Any disruptive behavior may lead to immediate revocation of your entry.
          </p>

          <h4 className="font-semibold text-slate-900 mt-4">2. Payment & Refunds (If Applicable)</h4>
          <p>
            For paid events, tickets will remain locked upon reservation until payment is verified. Refund policies are strictly dictated by the event organizers and SummitFlow assumes no liability.
          </p>

          <h4 className="font-semibold text-slate-900 mt-4">3. Data Privacy</h4>
          <p>
            The information you provide (Name, Phone Number, Student ID, Interests) will be securely shared with the event organizer to manage attendance, distribute certificates, and ensure a seamless experience. We do not sell your personal data.
          </p>
          
          <h4 className="font-semibold text-slate-900 mt-4">4. Certificates</h4>
          <p>
            If applicable, certificates are generated solely based on confirmed attendance (Checked-In status) and are accessible only post-event. Modifying or falsifying certificates is strictly prohibited.
          </p>
        </div>
        
        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-brand-orange text-white rounded-xl font-semibold hover:bg-brand-orange-hover transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
