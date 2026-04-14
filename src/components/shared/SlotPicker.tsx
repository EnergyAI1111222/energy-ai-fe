"use client";
import { useState } from 'react';
import { Calendar, Clock, ChevronDown } from 'lucide-react';

interface SlotPickerProps {
  slots: string[];
  activeSlot: string;
  onSlotChange: (slot: string) => void;
}

export function SlotPicker({ slots, activeSlot, onSlotChange }: SlotPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <Clock className="w-4 h-4 text-slate-400" />
        <span>Delivery Slot: <strong>{activeSlot}</strong></span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-sm z-50 py-2 max-h-64 overflow-y-auto">
          {slots.map(slot => (
            <button
              key={slot}
              onClick={() => {
                onSlotChange(slot);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${
                activeSlot === slot ? 'text-[#2563eb] font-bold bg-slate-50/50' : 'text-slate-600'
              }`}
            >
              {slot}
              {activeSlot === slot && <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
