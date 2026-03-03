import React, { useState } from "react";
import { Heart } from "lucide-react";
import { base44 } from "@/api/base44Client";
import moment from "moment";

export default function CommunityPostCard({ post, currentUserEmail }) {
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
        backgroundColor: '#fff',
        borderColor: isMilestone ? '#c8a97e' : '#e8e4dd',
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
          style={{ backgroundColor: isMilestone ? '#c8a97e' : '#e8e4dd', color: isMilestone ? '#fff' : '#8a8478' }}
        >
          {(post.author_name || "?")[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{post.author_name}</span>
            {post.author_days != null && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(200,169,126,0.12)', color: '#c8a97e' }}>
                {post.author_days}d
              </span>
            )}
          </div>
          <span className="text-[11px]" style={{ color: '#8a8478' }}>
            {moment(post.created_date).fromNow()}
          </span>
        </div>
      </div>

      <p className={`text-sm leading-relaxed text-gray-800 ${isMilestone ? 'font-display text-base' : ''}`}>
        {post.text}
      </p>

      <div className="flex items-center mt-3 pt-2 border-t" style={{ borderColor: '#f0ece5' }}>
        <button 
          onClick={handleHeart}
          className="flex items-center gap-1.5 transition-all"
        >
          <Heart 
            size={16} 
            fill={hearted ? '#c8a97e' : 'none'}
            style={{ 
              color: hearted ? '#c8a97e' : '#8a8478',
              transform: animating ? 'scale(1.3)' : 'scale(1)',
              transition: 'transform 0.2s ease'
            }}
          />
          <span className="text-xs" style={{ color: hearted ? '#c8a97e' : '#8a8478' }}>
            {hearts > 0 ? hearts : ''}
          </span>
        </button>
      </div>
    </div>
  );
}