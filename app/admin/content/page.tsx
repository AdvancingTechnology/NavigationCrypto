"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Content, Profile } from "@/lib/supabase/types";

interface ContentWithAuthor extends Content {
  author?: Profile;
}

export default function ContentPage() {
  const [content, setContent] = useState<ContentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "course" | "video" | "article" | "tutorial">("all");
  const [showNewContent, setShowNewContent] = useState(false);
  const [showEditContent, setShowEditContent] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentWithAuthor | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "article" as "course" | "video" | "article" | "tutorial",
    content_body: "",
    thumbnail_url: "",
    video_url: "",
  });

  const supabase = createClient();

  // Load content and current user
  useEffect(() => {
    loadContent();
    getCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch content with author profiles
      const { data, error: fetchError } = await (supabase as any)
        .from('content')
        .select(`
          *,
          author:profiles!content_author_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setContent(data || []);
    } catch (err) {
      console.error('Error loading content:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async () => {
    if (!currentUserId) {
      setError('You must be logged in to create content');
      return;
    }

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error: insertError } = await (supabase as any)
        .from('content')
        .insert({
          title: formData.title,
          description: formData.description || null,
          type: formData.type,
          content_body: formData.content_body || null,
          thumbnail_url: formData.thumbnail_url || null,
          video_url: formData.video_url || null,
          author_id: currentUserId,
          status: 'draft',
          views: 0,
          ai_generated: false,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Reload content
      await loadContent();

      // Reset form and close modal
      setFormData({
        title: "",
        description: "",
        type: "article",
        content_body: "",
        thumbnail_url: "",
        video_url: "",
      });
      setShowNewContent(false);
    } catch (err) {
      console.error('Error creating content:', err);
      setError(err instanceof Error ? err.message : 'Failed to create content');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContent = async () => {
    if (!editingContent) return;

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await (supabase as any)
        .from('content')
        .update({
          title: formData.title,
          description: formData.description || null,
          type: formData.type,
          content_body: formData.content_body || null,
          thumbnail_url: formData.thumbnail_url || null,
          video_url: formData.video_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingContent.id);

      if (updateError) throw updateError;

      // Reload content
      await loadContent();

      // Reset form and close modal
      setFormData({
        title: "",
        description: "",
        type: "article",
        content_body: "",
        thumbnail_url: "",
        video_url: "",
      });
      setShowEditContent(false);
      setEditingContent(null);
    } catch (err) {
      console.error('Error updating content:', err);
      setError(err instanceof Error ? err.message : 'Failed to update content');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await (supabase as any)
        .from('content')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Reload content
      await loadContent();
    } catch (err) {
      console.error('Error deleting content:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete content');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (item: ContentWithAuthor) => {
    try {
      setLoading(true);
      setError(null);

      const newStatus = item.status === 'published' ? 'draft' : 'published';
      const updates: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // Set published_at when publishing
      if (newStatus === 'published' && !item.published_at) {
        updates.published_at = new Date().toISOString();
      }

      const { error: updateError } = await (supabase as any)
        .from('content')
        .update(updates)
        .eq('id', item.id);

      if (updateError) throw updateError;

      // Reload content
      await loadContent();
    } catch (err) {
      console.error('Error toggling publish status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update publish status');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item: ContentWithAuthor) => {
    setEditingContent(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      type: item.type,
      content_body: item.content_body || "",
      thumbnail_url: item.thumbnail_url || "",
      video_url: item.video_url || "",
    });
    setShowEditContent(true);
  };

  const filteredContent = typeFilter === "all" ? content : content.filter(c => c.type === typeFilter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "course": return "📚";
      case "video": return "🎥";
      case "article": return "📝";
      case "tutorial": return "💡";
      default: return "📄";
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
          <span className="text-red-400">⚠️</span>
          <div className="flex-1">
            <h4 className="text-red-400 font-semibold mb-1">Error</h4>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Content Management</h2>
          <p className="text-gray-500">Create and manage courses, videos, articles, and tutorials.</p>
        </div>
        <div className="flex gap-3">
          <button
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
            onClick={() => alert('AI content generation coming soon!')}
          >
            🤖 AI Generate
          </button>
          <button
            onClick={() => {
              setFormData({
                title: "",
                description: "",
                type: "article",
                content_body: "",
                thumbnail_url: "",
                video_url: "",
              });
              setShowNewContent(true);
            }}
            className="bg-cyan-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-cyan-400 transition"
            disabled={loading}
          >
            + New Content
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Content", value: content.length.toString(), icon: "📚" },
          { label: "Published", value: content.filter(c => c.status === "published").length.toString(), icon: "✅" },
          { label: "Total Views", value: content.reduce((sum, c) => sum + c.views, 0).toLocaleString(), icon: "👁️" },
          { label: "AI Generated", value: content.filter(c => c.ai_generated).length.toString(), icon: "🤖" },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{stat.icon}</span>
              <span className="text-gray-500 text-sm">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "course", "video", "article", "tutorial"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-4 py-2 rounded-lg capitalize transition flex items-center gap-2 ${
              typeFilter === type
                ? "bg-cyan-500 text-black font-semibold"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {type !== "all" && <span>{getTypeIcon(type)}</span>}
            {type}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {loading && !content.length ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4"></div>
            <p className="text-gray-400">Loading content...</p>
          </div>
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-12 border border-gray-800 text-center">
          <span className="text-6xl mb-4 block">📝</span>
          <h3 className="text-xl font-bold text-white mb-2">No content yet</h3>
          <p className="text-gray-500 mb-6">Create your first piece of content to get started.</p>
          <button
            onClick={() => {
              setFormData({
                title: "",
                description: "",
                type: "article",
                content_body: "",
                thumbnail_url: "",
                video_url: "",
              });
              setShowNewContent(true);
            }}
            className="bg-cyan-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-cyan-400 transition inline-block"
          >
            Create Content
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <div key={item.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(item.type)}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    item.status === "published"
                      ? "bg-green-500/20 text-green-400"
                      : item.status === "scheduled"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}>
                    {item.status}
                  </span>
                </div>
                {item.ai_generated && (
                  <span className="text-purple-400 text-sm">🤖 AI</span>
                )}
              </div>

              <h3 className="text-white font-semibold mb-2 line-clamp-2">{item.title}</h3>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{item.author?.full_name || item.author?.email || 'Unknown'}</span>
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <div className="flex items-center gap-1 text-gray-400">
                  <span>👁️</span>
                  <span>{item.views.toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePublishToggle(item)}
                    className={`p-2 rounded hover:bg-gray-700 transition ${
                      item.status === 'published'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                    title={item.status === 'published' ? 'Unpublish' : 'Publish'}
                    disabled={loading}
                  >
                    {item.status === 'published' ? '✓' : '📤'}
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 bg-gray-800 rounded hover:bg-gray-700 transition"
                    title="Edit"
                    disabled={loading}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteContent(item.id)}
                    className="p-2 bg-gray-800 rounded hover:bg-red-900/50 transition text-red-400"
                    title="Delete"
                    disabled={loading}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Content Modal */}
      {showNewContent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create New Content</h3>
              <button onClick={() => setShowNewContent(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-2">Content Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="article">📝 Article</option>
                  <option value="video">🎥 Video</option>
                  <option value="course">📚 Course</option>
                  <option value="tutorial">💡 Tutorial</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">Title *</label>
                <input
                  type="text"
                  placeholder="Enter content title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">Description</label>
                <textarea
                  placeholder="Enter description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">Content Body</label>
                <textarea
                  placeholder="Enter main content..."
                  value={formData.content_body}
                  onChange={(e) => setFormData({ ...formData, content_body: e.target.value })}
                  rows={6}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              {formData.type === 'video' && (
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Video URL</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              )}
              <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
                <span className="text-2xl">🤖</span>
                <div className="flex-1">
                  <div className="text-white font-medium">Use AI to generate content</div>
                  <div className="text-gray-500 text-sm">Let our AI agent create the initial draft</div>
                </div>
                <button
                  className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition"
                  onClick={() => alert('AI content generation coming soon!')}
                >
                  Generate
                </button>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowNewContent(false)}
                  className="flex-1 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateContent}
                  className="flex-1 bg-cyan-500 text-black py-3 rounded-lg font-semibold hover:bg-cyan-400 transition disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Content'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Content Modal */}
      {showEditContent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit Content</h3>
              <button onClick={() => {
                setShowEditContent(false);
                setEditingContent(null);
              }} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-2">Content Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="article">📝 Article</option>
                  <option value="video">🎥 Video</option>
                  <option value="course">📚 Course</option>
                  <option value="tutorial">💡 Tutorial</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">Title *</label>
                <input
                  type="text"
                  placeholder="Enter content title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">Description</label>
                <textarea
                  placeholder="Enter description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">Content Body</label>
                <textarea
                  placeholder="Enter main content..."
                  value={formData.content_body}
                  onChange={(e) => setFormData({ ...formData, content_body: e.target.value })}
                  rows={6}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              {formData.type === 'video' && (
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Video URL</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditContent(false);
                    setEditingContent(null);
                  }}
                  className="flex-1 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateContent}
                  className="flex-1 bg-cyan-500 text-black py-3 rounded-lg font-semibold hover:bg-cyan-400 transition disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Content'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
