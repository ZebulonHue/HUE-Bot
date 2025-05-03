import { useState } from "react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { ChatWindow } from "./ChatWindow";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#0A0A0A]">
      <header className="h-16 px-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <img 
            src="https://media.discordapp.net/attachments/1013265874385391688/1192772618626015363/H_U_Emm.Apng.png" 
            alt="HUE Logo" 
            className="h-8 w-auto"
          />
          <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            HUE Assistant
          </h1>
        </div>
        <SignOutButton />
      </header>
      <main className="flex-1 flex">
        <div className="flex-1 max-w-4xl mx-auto w-full p-6">
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
      <Authenticated>
        <ChatWindow sessionId={sessionId} />
      </Authenticated>
    </div>
  );
}
