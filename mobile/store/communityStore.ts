// store/communityStore.ts — Community posts + answers state

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { CommunityPost } from '../lib/supabase';

interface CommunityState {
  posts: CommunityPost[];
  loading: boolean;
  upvotedIds: Set<string>;
  loadPosts: (tag?: string) => Promise<void>;
  upvotePost: (postId: string, userId: string) => Promise<void>;
  addPost: (post: CommunityPost) => void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  posts: [],
  loading: false,
  upvotedIds: new Set(),

  loadPosts: async (tag) => {
    set({ loading: true });
    try {
      let query = supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(40);

      if (tag && tag !== 'All') query = query.contains('tags', [tag]);

      const { data, error } = await query;
      if (!error && data) set({ posts: data as CommunityPost[] });
    } catch (err) {
      console.warn('[communityStore] loadPosts:', err);
    } finally {
      set({ loading: false });
    }
  },

  upvotePost: async (postId, userId) => {
    const { upvotedIds } = get();
    if (upvotedIds.has(postId)) return;

    set(s => ({
      upvotedIds: new Set([...s.upvotedIds, postId]),
      posts: s.posts.map(p => p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p),
    }));

    try {
      await supabase.from('post_upvotes').insert({ user_id: userId, post_id: postId });
    } catch { /* silent — optimistic update stands */ }
  },

  addPost: (post) => {
    set(s => ({ posts: [post, ...s.posts] }));
  },
}));
