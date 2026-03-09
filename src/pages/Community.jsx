import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AnimatePresence } from "framer-motion";
import CommunityPostCard from "../components/current/CommunityPostCard";
import ToneGuideModal from "../components/current/ToneGuideModal";
import BottomNav from "../components/current/BottomNav";
import { getDaysSince } from "../components/current/milestoneData";
import { useTheme } from "../components/current/ThemeContext";

export default function Community() {
  const { t } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [showToneGuide, setShowToneGuide] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [postsData, profiles, user] = await Promise.all([
      base44.entities.CommunityPost.list("-created_date", 50),
      base44.entities.UserProfile.list(),
      base44.auth.me(),
    ]);
    
    setPosts(postsData);
    setUserEmail(user.email);
    
    if (profiles.length > 0) {
      setProfile(profiles[0]);
      if (!profiles[0].has_seen_tone_guide) {
        setShowToneGuide(true);
      }
    }
    setLoading(false);
  };

  const handlePost = async () => {
    if (!newPost.trim() || !profile) return;
    setPosting(true);
    
    const days = getDaysSince(profile.sobriety_date);
    await base44.entities.CommunityPost.create({
      author_name: profile.first_name,
      author_days: days,
      text: newPost.slice(0, 150),
      is_milestone: false,
      hearts: 0,
      hearted_by: [],
    });
    
    setNewPost("");
    setPosting(false);
    loadData();
  };

  const closeToneGuide = async () => {
    setShowToneGuide(false);
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { has_seen_tone_guide: true });
    }
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (a.is_milestone && !b.is_milestone) return -1;
    if (!a.is_milestone && b.is_milestone) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: t.bg }}>
      <AnimatePresence>
        {showToneGuide && <ToneGuideModal onClose={closeToneGuide} />}
      </AnimatePresence>

      <div className="px-6 pt-14 pb-6">
        <h1 className="font-display text-2xl font-medium" style={{ color: t.text }}>Community</h1>
      </div>

      <div className="px-6">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-28 rounded-xl animate-pulse" style={{ backgroundColor: t.bgTertiary }} />
            ))}
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-display text-lg mb-2" style={{ color: t.text }}>Nothing here yet.</p>
            <p className="text-sm" style={{ color: t.muted }}>Be the first to share a moment.</p>
          </div>
        ) : (
          sortedPosts.map(post => (
            <CommunityPostCard key={post.id} post={post} currentUserEmail={userEmail} />
          ))
        )}
      </div>

      <div className="fixed bottom-14 left-0 right-0 border-t px-4 py-3"
        style={{ 
          backgroundColor: t.bg, 
          borderColor: t.border,
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)'
        }}>
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <input
            type="text"
            value={newPost}
            onChange={e => setNewPost(e.target.value.slice(0, 150))}
            placeholder="Share a moment..."
            className="flex-1 text-sm rounded-xl px-4 py-3 border focus:outline-none"
            style={{ backgroundColor: t.bgSecondary, borderColor: t.border, color: t.text }}
            onKeyDown={e => e.key === "Enter" && handlePost()}
          />
          <button
            onClick={handlePost}
            disabled={!newPost.trim() || posting}
            className="px-4 py-3 rounded-xl text-xs font-medium disabled:opacity-30 transition-colors"
            style={{ backgroundColor: t.success, color: '#fff' }}
          >
            Post
          </button>
        </div>
        {newPost.length > 0 && (
          <p className="text-[10px] text-right mt-1 max-w-lg mx-auto" style={{ color: t.muted }}>
            {newPost.length}/150
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}