import React from 'react';
import { cn } from '@/lib/utils';
import { List, X } from 'lucide-react';

interface ChatToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

const ChatToggleButton: React.FC<ChatToggleButtonProps> = ({
  isOpen,
  onClick,
  className
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-4 left-4 md:hidden z-50 bg-blue-600 text-white rounded-full p-3 shadow-lg",
        className
      )}
      aria-label={isOpen ? "Close contacts" : "Open contacts"}
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <List className="w-6 h-6" />
      )}
    </button>
  );
};

export default ChatToggleButton;