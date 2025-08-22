import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface EmojiPickerPopoverProps {
  children: React.ReactNode;
  onEmojiSelect: (emoji: EmojiClickData) => void;
}

const EmojiPickerPopover: React.FC<EmojiPickerPopoverProps> = ({ children, onEmojiSelect }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="p-0 border-none w-auto">
        <EmojiPicker onEmojiClick={onEmojiSelect} />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPickerPopover;
