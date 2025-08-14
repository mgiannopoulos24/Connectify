import React from 'react';
import { Reaction } from '@/types/post';
import { ThumbsUp, Heart, Award, Sparkles, Laugh, MessageSquareQuote } from 'lucide-react';

interface ReactionIconProps {
  type: Reaction['type'];
  className?: string;
}

const iconMap: Record<Reaction['type'], React.ElementType> = {
  like: ThumbsUp,
  support: Heart,
  congrats: Award,
  awesome: Sparkles,
  funny: Laugh,
  constructive: MessageSquareQuote,
};

const ReactionIcon: React.FC<ReactionIconProps> = ({ type, className = 'w-5 h-5' }) => {
  const IconComponent = iconMap[type];
  return <IconComponent className={className} />;
};

export default ReactionIcon;
