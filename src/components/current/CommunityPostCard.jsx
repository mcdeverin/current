import React, { useState } from "react";
import { Heart } from "lucide-react";
import { base44 } from "@/api/base44Client";
import moment from "moment";
import { useTheme } from "./ThemeContext";

export default function CommunityPostCard({ post, currentUserEmail }) {
  const { t } = useTheme();
  const [hearts, setHearts] = useState(post.hearts || 0);
  const [hearted, setHearted] = useState(
    (post.hearted_by || []).includes(currentUserEmail)
  );
  const [animating, setAnimating] = useState(false);

  const handleHeart = async () => {
    if (hearted) return;
    setAnimating(true);
    setHearted(true);
    setHearts(h => h + 1);
    const newHeartedBy = [...(post.hearted_by || []), currentUserEmail];
    await base44.entities.CommunityPost.update(post.id, {
      hearts: (post.hearts || 0) + 1,
      hearted_by: newHeartedBy,
    });
    setTimeout(() => setAnimating(false), 300);
  };

  const isMilestone = post.is_milestone;

  return (
    <div 
      className={`rounded-xl p-4 mb-3 ${isMilestone ? 'border-2' : 'border'}`}
      style={{ 
        backgroundColor: t.bgSecondary,
        borderColor: isMilestone ? t.success : t.border,
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
          style={{ backgroundColor: isMilestone ? t.success : t.bgTertiary, color: isMilestone ? '#fff' : t.muted }}
        >
          {(post.author_name || "?")[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: t.text }}>{post.author_name}</span>
            {post.author_days != null && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: t.successBg, color: t.success }}>
                {post.author_days}d
              </span>
            )}
          </div>
          <span className="text-[11px]" style={{ color: t.muted }}>
            {moment(post.created_date).fromNow()}
          </span>
        </div>
      </div>

      <p className={`text-sm leading-relaxed ${isMilestone ? 'font-display text-base' : ''}`} style={{ color: t.text }}>
        {post.text}
      </p>

      <div className="flex items-center mt-3 pt-2 border-t" style={{ borderColor: t.border }}>
        <button onClick={handleHeart} className="flex items-center gap-1.5 transition-all">
          <Heart 
            size={16} 
            fill={hearted ? t.success : 'none'}
            style={{ 
              color: hearted ? t.success : t.muted,
              transform: animating ? 'scale(1.3)' : 'scale(1)',
              transition: 'transform 0.2s ease'
            }}
          />
          <span className="text-xs" style={{ color: hearted ? t.success : t.muted }}>
            {hearts > 0 ? hearts : ''}
          </span>
        </button>
      </div>
    </div>
  );
}