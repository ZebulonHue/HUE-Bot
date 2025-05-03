import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import OpenAI from "openai";
import { api } from "./_generated/api";

export const sendMessage = mutation({
  args: {
    content: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.insert("messages", {
      content: args.content,
      role: "user",
      sessionId: args.sessionId,
    });

    await ctx.db.insert("messages", {
      content: "",
      role: "assistant",
      sessionId: args.sessionId,
      status: "typing",
    });

    await ctx.scheduler.runAfter(0, api.chat.generateResponse, {
      sessionId: args.sessionId,
      messageId: message,
    });
  },
});

export const getMessages = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

export const generateResponse = action({
  args: {
    sessionId: v.string(),
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.runQuery(api.chat.getMessages, {
      sessionId: args.sessionId,
    });

    const systemPrompt = await ctx.runQuery(api.knowledge.getSystemPrompt);

    const openai = new OpenAI({
      baseURL: process.env.CONVEX_OPENAI_BASE_URL,
      apiKey: process.env.CONVEX_OPENAI_API_KEY,
    });

    const chatMessages = messages
      .filter((m: { status?: string }) => m.status !== "typing")
      .map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      }));

    chatMessages.unshift({
      role: "system",
      content: systemPrompt,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: chatMessages,
    });

    const content = completion.choices[0].message.content;

    await ctx.runMutation(api.chat.updateResponse, {
      sessionId: args.sessionId,
      content: content || "I couldn't generate a response.",
    });
  },
});

export const updateResponse = mutation({
  args: {
    sessionId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const typingMessage = await ctx.db
      .query("messages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("status"), "typing"))
      .unique();

    if (typingMessage) {
      await ctx.db.patch(typingMessage._id, {
        content: args.content,
        status: "complete",
      });
    }
  },
});
