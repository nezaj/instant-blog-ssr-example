"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { id, InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

// InstaQLEntity with Date objects (since we use useDateObjects: true)
type Post = Omit<InstaQLEntity<AppSchema, "posts", { author: {} }>, "createdAt"> & {
  createdAt: Date;
};
// type Post = InstaQLEntity<AppSchema, "posts", { author: {} }>


export default function App() {
  const { data } = db.useSuspenseQuery({
    posts: {
      $: { order: { createdAt: "desc" } },
      author: {},
    },
  });

  const { posts } = data;

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto font-sans">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Microblog</h1>
        <AuthSection />
      </header>

      <main className="space-y-6">
        <CreatePost />
        <PostList posts={posts} />
      </main>

      <footer className="mt-12 text-center text-xs text-gray-400">
        Posts are rendered via SSR. View page source to verify!
      </footer>
    </div>
  );
}

function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        No posts yet. Be the first to write something!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const deletePost = () => {
    db.transact(db.tx.posts[post.id].delete());
  };

  return (
    <article className="border border-gray-200 rounded p-4">
      <div className="flex justify-between items-start">
        <h2 className="font-semibold text-lg">{post.title}</h2>
        <button
          onClick={deletePost}
          className="text-gray-400 hover:text-red-500 text-sm"
        >
          Delete
        </button>
      </div>
      <p className="text-gray-700 mt-2 whitespace-pre-wrap">{post.content}</p>
      <div className="text-xs text-gray-400 mt-3">
        {post.author?.email && <span>By {post.author.email} · </span>}
        {post.createdAt.toLocaleString()}
      </div>
    </article>
  );
}

function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { user } = db.useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const postId = id();
    const tx = db.tx.posts[postId].update({
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date(),
    });

    if (user) {
      db.transact([tx, db.tx.posts[postId].link({ author: user.id })]);
    } else {
      db.transact(tx);
    }

    setTitle("");
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded p-4">
      <input
        type="text"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
      />
      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-2 resize-none"
      />
      <button
        type="submit"
        disabled={!title.trim() || !content.trim()}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Post
      </button>
    </form>
  );
}

function AuthSection() {
  const { isLoading, user, error } = db.useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentTo, setSentTo] = useState("");

  if (isLoading) {
    return <div className="text-gray-500">Loading auth...</div>;
  }

  if (error) {
    return <div className="text-red-500">Auth error: {error.message}</div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user.email}</span>
        <button
          onClick={() => db.auth.signOut()}
          className="text-sm text-blue-500 hover:underline"
        >
          Sign out
        </button>
      </div>
    );
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await db.auth.sendMagicCode({ email: email.trim() });
    setSentTo(email.trim());
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    await db.auth.signInWithMagicCode({ email: sentTo, code: code.trim() });
  };

  if (sentTo) {
    return (
      <form onSubmit={handleVerifyCode} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
        />
        <button
          type="submit"
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Verify
        </button>
        <button
          type="button"
          onClick={() => setSentTo("")}
          className="text-sm text-gray-500 hover:underline"
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendCode} className="flex gap-2">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm w-48"
      />
      <button
        type="submit"
        className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
      >
        Sign in
      </button>
    </form>
  );
}
