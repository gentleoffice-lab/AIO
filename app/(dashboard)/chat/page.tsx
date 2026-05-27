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

  const { isDark } = useTheme();

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



  // 1. Initialisierung & Profile / Chats holen

  useEffect(() => {

    const initializeChat = async () => {

      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) return;



      const authUserId = session.user.id;

      setCurrentUserId(authUserId);



      // Versuche Profil über die Spalte zu holen, falls dort der String steht

      // Hinweis: Wenn id ein int8 ist, schlägt .eq("id", string) fehl. 

      // Wir fangen das ab, damit die App trotzdem die Chats lädt.

      try {

        const { data: profileData } = await supabase

          .from("profiles")

          .select("*")

          .eq("username", session.user.user_metadata?.username || session.user.email?.split("@")[0])

          .maybeSingle();



        console.log("Profil-Abgleich über Username:", profileData);

      } catch (err) {

        console.warn("Profilabfrage übersprungen wegen Typen-Konflikt in der DB.");

      }



      // Chats werden unabhängig von Profil-Tabellenfehlern geladen

      const { data: chatsData } = await supabase

        .from("chats")

        .select("*")

        .order("updated_at", { ascending: false });



      if (chatsData) setChats(chatsData as Chat[]);

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



    try {

      const { data: existing } = await supabase
  .from("chats")
  .select("*")
  .match({ name: username, created_by: currentUserId })
  .maybeSingle();



      if (existing) {

        setActiveChatId(existing.id);

        return;

      }



      const { data: newChat } = await supabase

        .from("chats")

        .insert({ name: username, is_group: false, created_by: currentUserId })

        .select()

        .single();



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

    <div className="h-[calc(100vh-65px)] w-full flex overflow-hidden relative bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:bg-zinc-950 dark:text-white transition-colors duration-300">

      {/* LINKSEITE: Chat-Liste */}

      <div className={`w-full md:w-80 flex flex-col border-r h-full shrink-0 relative bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 ${activeChatId ? "hidden md:flex" : "flex"}`}>

        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">

          <span className="text-xl select-none">💬</span>

          <h2 className="font-bold text-base tracking-tight text-right flex-1">Chats</h2>

        </div>

       <div className="flex-1 overflow-y-auto divide-y divide-zinc-200 dark:divide-zinc-800 no-scrollbar pb-24">

          {chats.map((chat) => (

            <button 
            key={chat.id} 
            onClick={() => setActiveChatId(chat.id)} 
            className={`w-full p-4 flex items-center gap-3 text-left transition ${activeChatId === chat.id ? "bg-zinc-200 dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-zinc-900/40"}`}>

              <div className="w-11 h-11 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-xl shrink-0">
                {chat.name.includes("KI") ? "🤖" : "👨‍💻"}
              </div>

              <h3 className="font-semibold text-sm">{chat.name}</h3>

            </button>

          ))}

          {chats.length === 0 && <p className="text-xs text-zinc-500 text-center pt-8 px-4">Noch keine aktiven Chats. Klicke unten auf das Plus!</p>}

        </div>

        <button 
          onClick={openNewChatModal} 
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-xl transition active:scale-90 z-20 bg-zinc-200 border border-zinc-300 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:hover:bg-zinc-800"
        >
          ➕
        </button> 
      </div>



      {/* RECHTE SEITE: Chatverlauf */}

      <div className={`flex-1 flex flex-col h-full relative bg-zinc-50 dark:bg-zinc-950/20 ${!activeChatId && "hidden md:flex"}`}>

        {activeChat ? (

          <>

            <div className="px-6 py-3 border-b flex items-center gap-3 z-10 bg-white/80 border-zinc-200 dark:bg-zinc-900/80 dark:border-zinc-800 shadow-sm">

              <button onClick={() => setActiveChatId(null)} className="md:hidden text-zinc-400 pr-2 text-xl">←</button>

             <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xl">
                {activeChat.name.includes("KI") ? "🤖" : "👨‍💻"}
              </div>
              <div>

                <h2 className="text-sm font-bold tracking-tight">{activeChat.name}</h2>

                <p className="text-[10px] text-zinc-400">{activeChat.name.includes("KI") ? "KI-Assistent" : "Online"}</p>

              </div>

            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 no-scrollbar bg-zinc-50 dark:bg-zinc-950/20">

              {isLoadingMessages ? (

                <div className="text-center text-xs text-zinc-500 py-4">Nachrichten werden geladen...</div>

              ) : (

                messages.map((msg) => {

                  const isMe = msg.sender_id === currentUserId;

                  return (

                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in`}>

                      <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm shadow-sm border ${isMe ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-700 dark:border-zinc-600" : "bg-white border-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"}`}>

                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                        <span className="text-[9px] block text-right mt-1 opacity-50 font-mono">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                      </div>

                    </div>

                  );

                })

              )}

              <div ref={messagesEndRef} />

            </div>

            <div className="p-4 border-t bg-white border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800">

              <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto w-full">

                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Schreibe eine Nachricht..." className="flex-1 px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-zinc-500 transition bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white dark:placeholder-zinc-700"/>

                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-medium transition bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700">Senden</button>

              </form>

            </div>

          </>

        ) : (

          <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm p-6 text-center">Wähle links einen Kontakt aus oder erstelle einen neuen Chat!</div>

        )}

      </div>



      {/* MODAL */}

      {isModalOpen && (

        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl bg-white border-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white">

            <div className="flex justify-between items-center mb-4">

              <h3 className="font-bold text-base">Neuer Chat</h3>

              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white">✕</button>

            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 no-scrollbar">

              <button onClick={() => startChatWithUser("AIO KI-Assistent")} className="w-full p-3 flex items-center justify-between rounded-xl text-left transition border bg-zinc-50 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:border-zinc-800 dark:hover:bg-zinc-800">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-full bg-zinc-500/10 flex items-center justify-center text-xl">🤖</div>

                  <div className="font-semibold text-sm">AIO KI-Assistent</div>

                </div>

                <span className="text-[10px] bg-zinc-500/20 px-1.5 py-0.5 rounded text-zinc-400 font-mono">System</span>

              </button>

              <hr className="border-zinc-200 dark:border-zinc-800 my-2" />

              {allUsers.map((user) => (

                <button key={user.id} onClick={() => startChatWithUser(user.username)} className="w-full p-3 flex items-center justify-between rounded-xl text-left transition border bg-zinc-50 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:border-zinc-800 dark:hover:bg-zinc-800">

                  <div className="w-10 h-10 rounded-full bg-zinc-500/10 flex items-center justify-center text-xl">👨‍💻</div>

                  <div className="font-medium text-sm">{user.username}</div>

                </button>

              ))}

              {allUsers.length === 0 && <p className="text-xs text-zinc-500 text-center py-4">Keine weiteren Benutzer registriert.</p>}

            </div>

          </div>

        </div>

      )}

    </div>

  );

} 

