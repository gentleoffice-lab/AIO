"use client";


import { useState, useRef, useEffect } from "react";

import { useTheme } from "@/lib/useTheme";

import { supabase } from "@/lib/supabaseClient";



interface Message {

  id: string;

  chat_id: string;

  sender_id: string;

  content: string;

  created_at: string;

  profiles?: { username: string; avatar_url: string | null };

}



interface Chat {

  id: string;

  name: string;

  is_group: boolean;

  avatar?: string;

  created_by: string;

}



interface Profile {

  id: string;

  username: string;

  avatar_url: string | null;

}



export default function RealtimeWhatsAppChat() {

 

  const [chats, setChats] = useState<Chat[]>([]);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [allUsers, setAllUsers] = useState<Profile[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeChat = chats.find(c => c.id === activeChatId);



  // 1. Initialisierung
useEffect(() => {
  const initializeChat = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // --- ERSETZE DEN ALTEN CODE HIERMIT ---
const { data: profile } = await supabase
  .from("profiles")
  .select("id, username") 
  .eq("user_uuid", session.user.id) // WICHTIG: Hier prüfen wir die neue Spalte gegen die UUID
  .maybeSingle();

if (profile) {
  // 'id' ist dein int8 (BigInt), wir konvertieren es für den State
  setCurrentUserId(profile.id.toString()); 
}
// --------------------------------------
  };
  initializeChat();
}, []);


  // 2. Kontakte für das Modal laden

  const openNewChatModal = async () => {

    setIsModalOpen(true);

    // Da IDs in profiles Integers sind und currentUserId ein String, 

    // laden wir einfach alle verfügbaren Profile ohne .not()-Filter, um SQL-Fehler zu vermeiden

    const { data: profilesData } = await supabase

      .from("profiles")

      .select("id, username, avatar_url");



    if (profilesData) setAllUsers(profilesData as Profile[]);

  };



  // 3. Chat starten oder öffnen

  const startChatWithUser = async (username: string) => {
  setIsModalOpen(false);
  if (!currentUserId) return;

  const isAI = username === "AIO KI-Assistent";

  try {
    // 1. Suche nach dem Chat
    // Für die KI suchen wir nach dem Namen, für User nach Name + UserID
    let query = supabase.from("chats").select("*").eq("name", username);
    
    if (!isAI) {
      query = query.eq("created_by", currentUserId);
    }
    
    const { data: existing } = await query.maybeSingle();

    if (existing) {
      setActiveChatId(existing.id);
      return;
    }

    // 2. Erstelle den Chat
    // Wir setzen jetzt IMMER ein created_by, um den NOT NULL Fehler zu verhindern.
    // Wenn KI, dann '0', sonst die echte ID.
    const insertPayload = { 
      name: username, 
      is_group: false, 
      created_by: isAI ? 1 : Number(currentUserId) // Hier die 0 für KI
    };

    const { data: newChat, error } = await supabase
      .from("chats")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      // WICHTIG: Jetzt sehen wir den echten Fehler, falls es noch einen gibt!
      console.error("Supabase Insert Details:", JSON.stringify(error, null, 2));
      return;
    }

    if (newChat) {
      setChats(prev => [newChat as Chat, ...prev]);
      setActiveChatId(newChat.id);
    }
  } catch (err) {
    console.error("Fehler im Chat-Handshake:", err);
  }
};


  // 4. Realtime Nachrichten-Handling

  useEffect(() => {

    if (!activeChatId) return;



    const fetchMessages = async () => {

      setIsLoadingMessages(true);

      // Wir holen Nachrichten. Da Profile-Joins bei Typenkonflikten scheitern können,

      // ist hier ein robuster Select eingebaut.

      const { data } = await supabase

        .from("messages")

        .select(`id, chat_id, sender_id, content, created_at`)

        .eq("chat_id", activeChatId)

        .order("created_at", { ascending: true });



      if (data) setMessages(data as any);

      setIsLoadingMessages(false);

    };



    fetchMessages();



    const channel = supabase

      .channel(`chat-room-${activeChatId}`)

      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${activeChatId}` }, 

        (payload) => {

          const incomingMessage: Message = {

            id: payload.new.id,

            chat_id: payload.new.chat_id,

            sender_id: payload.new.sender_id,

            content: payload.new.content,

            created_at: payload.new.created_at,

          };

          setMessages((prev) => [...prev, incomingMessage]);

        }

      ).subscribe();



    return () => { supabase.removeChannel(channel); };

  }, [activeChatId]);



  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [messages]);



  const handleSendMessage = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!input.trim() || !activeChatId || !currentUserId) return;



    const messageText = input;

    setInput("");



    await supabase.from("messages").insert({

      chat_id: activeChatId,

      sender_id: currentUserId,

      content: messageText,

    });

  };



  return (

    <div className="h-[calc(100vh-65px)] w-full flex overflow-hidden relative bg-background text-foreground transition-colors duration-300">
      
      {/* LINKSEITE: Chat-Liste */}
      <div className={`w-full md:w-80 flex flex-col border-r h-full shrink-0 relative bg-card-bg border-border ${activeChatId ? "hidden md:flex" : "flex"}`}>
        
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-xl select-none">💬</span>
          <h2 className="font-bold text-base tracking-tight text-right flex-1">Chats</h2>
        </div>

       <div className="flex-1 overflow-y-auto divide-y divide-border no-scrollbar pb-24">
          {chats.map((chat) => (
            <button 
            key={chat.id} 
            onClick={() => setActiveChatId(chat.id)} 
            className={`w-full p-4 flex items-center gap-3 text-left transition ${activeChatId === chat.id ? "bg-border" : "hover:bg-card-bg/80"}`}>
              <div className="w-11 h-11 rounded-full bg-border border border-border flex items-center justify-center text-xl shrink-0">
                {chat.name.includes("KI") ? "🤖" : "👨‍💻"}
              </div>
              <h3 className="font-semibold text-sm text-foreground">{chat.name}</h3>
            </button>
          ))}
          {chats.length === 0 && <p className="text-xs text-zinc-500 text-center pt-8 px-4">Noch keine aktiven Chats.</p>}
        </div>

        <button 
          onClick={openNewChatModal} 
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-xl transition active:scale-90 z-20 bg-card-bg border border-border text-foreground hover:bg-border"
        >
          ➕
        </button> 
      </div>

      {/* RECHTE SEITE: Chatverlauf */}
     <div className={`flex-1 flex flex-col h-full relative bg-background ${!activeChatId && "hidden md:flex"}`}>
      
        {activeChat ? (
          <>
            <div className="px-6 py-3 border-b flex items-center gap-3 z-10 bg-card-bg/90 border-border shadow-sm">
              <button onClick={() => setActiveChatId(null)} className="md:hidden text-zinc-400 pr-2 text-xl">←</button>
             <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-xl">
                {activeChat.name.includes("KI") ? "🤖" : "👨‍💻"}
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight text-foreground">{activeChat.name}</h2>
                <p className="text-[10px] text-zinc-500">{activeChat.name.includes("KI") ? "KI-Assistent" : "Online"}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 no-scrollbar bg-background">
              {isLoadingMessages ? (
                <div className="text-center text-xs text-zinc-500 py-4">Nachrichten werden geladen...</div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === currentUserId;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in`}>
                      <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm shadow-sm border ${isMe ? "bg-foreground text-background border-foreground" : "bg-card-bg border-border text-foreground"}`}>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <span className="text-[9px] block text-right mt-1 opacity-50 font-mono">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-card-bg border-border">
              <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto w-full">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Schreibe eine Nachricht..." className="flex-1 px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-zinc-500 transition bg-background border-border text-foreground placeholder-zinc-500"/>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-medium transition bg-foreground text-background hover:opacity-90">Senden</button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm p-6 text-center">Wähle links einen Kontakt aus oder erstelle einen neuen Chat!</div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl bg-card-bg border-border text-foreground">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base">Neuer Chat</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-foreground">✕</button>
            </div>
            <div className="max-h-72 overflow-y-auto space-y-2 no-scrollbar">
              <button onClick={() => startChatWithUser("AIO KI-Assistent")} className="w-full p-3 flex items-center justify-between rounded-xl text-left transition border bg-background border-border hover:bg-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-xl">🤖</div>
                  <div className="font-semibold text-sm">AIO KI-Assistent</div>
                </div>
                <span className="text-[10px] bg-border px-1.5 py-0.5 rounded text-zinc-500 font-mono">System</span>
              </button>
              <hr className="border-border my-2" />
              {allUsers.map((user) => (
                <button key={user.id} onClick={() => startChatWithUser(user.username)} className="w-full p-3 flex items-center justify-between rounded-xl text-left transition border bg-background border-border hover:bg-border">
                  <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-xl">👨‍💻</div>
                  <div className="font-medium text-sm">{user.username}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>

  );

} 

