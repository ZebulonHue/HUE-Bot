import { FormEvent, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function ChatWindow({ sessionId }: { sessionId: string }) {
  const messages = useQuery(api.chat.getMessages, { sessionId }) || [];
  const sendMessage = useMutation(api.chat.sendMessage);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!inputRef.current?.value.trim()) return;

    const content = inputRef.current.value;
    inputRef.current.value = "";

    await sendMessage({
      content,
      sessionId,
    });
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center mt-8">
            <img 
              src="https://media.discordapp.net/attachments/1013265874385391688/1192772618626015363/H_U_Emm.Apng.png" 
              alt="HUE Logo" 
              className="w-24 h-24 mx-auto mb-6 object-contain"
            />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How can I help you with Blender today?</h2>
            <p className="text-gray-600 dark:text-gray-400">Ask me anything about 3D modeling, materials, or HUE's tools!</p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === "user"
                  ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
              }`}
            >
              {message.status === "typing" ? (
                <div className="flex space-x-2 h-6 items-center px-4">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            className="flex-1 bg-transparent px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
