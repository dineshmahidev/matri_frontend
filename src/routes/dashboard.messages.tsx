import { useState, useRef, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/AppLayouts";
import { api, getImageUrl } from "@/lib/api";
import { Search, ArrowLeft, Send, Paperclip, Smile, Loader2, MessageCircle, Heart, X, Check, Ban, Crown, Sparkles, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { useUpgrade } from "@/lib/upgrade";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/messages")({
  validateSearch: (search: Record<string, unknown>) => ({
    userId: search.userId as string | undefined,
    userName: search.userName as string | undefined,
    userPhoto: search.userPhoto as string | undefined,
  }),
  head: () => ({ meta: [{ title: "Messages — Ungalkalyanam" }] }),
  component: Messages,
});

type ChatType = {
  id: number | string;
  memberId: string;
  memberName: string;
  memberPhoto: string | null;
  online: boolean;
  lastMessage: string | null;
  time: string | null;
  unread: number;
};

type InterestType = {
  id: number;
  status: string;
  member: {
    id: string;
    name: string;
    photo: string | null;
    online: boolean;
  };
  created_at: string;
  sent_at?: string;
  received_at?: string;
};

type MessageType = {
  id: number;
  from: "me" | "them";
  text: string | null;
  imageUrl: string | null;
  time: string;
};

const EMOJIS = ["😀", "😂", "🥰", "😍", "🙏", "👍", "❤️", "🔥", "✨", "💯", "🎉", "😎", "🥺", "😊", "🥳"];

function Messages() {
  const { userId, userName, userPhoto } = Route.useSearch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { openUpgrade } = useUpgrade();
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "sent" | "received">("chat");
  const [active, setActive] = useState<number | string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chats = [], isLoading: loadingChats } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => api.get<ChatType[]>("/conversations"),
  });

  const { data: sentInterestsResponse, isLoading: loadingSent } = useQuery({
    queryKey: ["interests", "sent"],
    queryFn: () => api.get<any>("/interests/sent"),
    enabled: activeTab === "sent",
  });

  const { data: receivedInterestsResponse, isLoading: loadingReceived } = useQuery({
    queryKey: ["interests", "received"],
    queryFn: () => api.get<any>("/interests/received"),
    enabled: activeTab === "received",
  });

  const sentInterests = sentInterestsResponse?.data || [];
  const receivedInterests = receivedInterestsResponse?.data || [];

  const [syntheticChat, setSyntheticChat] = useState<ChatType | null>(null);

  const allChats = syntheticChat && !chats.some(c => c.id === syntheticChat.id)
    ? [syntheticChat, ...chats]
    : chats;

  useEffect(() => {
    if (loadingChats) return;

    if (active === null) {
      if (userId) {
        const uId = userId.toString().toLowerCase();
        const existingChat = chats.find(c => {
          const cMemberId = c.memberId ? c.memberId.toString().toLowerCase() : "";
          return cMemberId === uId || cMemberId.replace(/\D/g, "") === uId.replace(/\D/g, "") || c.id.toString() === uId;
        });

        if (existingChat) {
          setActive(existingChat.id);
          return;
        } else if (userName) {
          const newId = -1;
          setSyntheticChat({
            id: newId,
            memberId: userId.toString(),
            memberName: userName,
            memberPhoto: userPhoto || null,
            online: true,
            lastMessage: null,
            time: null,
            unread: 0,
          });
          setActive(newId);
          return;
        }
      }

      if (chats.length > 0 && window.innerWidth >= 640) {
        setActive(chats[0].id);
      }
    }
  }, [chats, loadingChats, active, userId, userName, userPhoto]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeChat = allChats.find((c) => c.id === active);
  const filteredChats = allChats.filter(c => c.memberName.toLowerCase().includes(searchQuery.toLowerCase()));

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", active],
    queryFn: () => {
      if (active === -1) return Promise.resolve([]);
      return api.get<MessageType[]>(`/conversations/${active}/messages`);
    },
    enabled: active !== null && active !== -1,
  });

  // Fetch user profile to check premium status
  const { data: profileData } = useQuery<any>({
    queryKey: ["my-profile"],
    queryFn: () => api.get<any>("/profile"),
    staleTime: 60000,
  });
  const isPremium = profileData?.data?.premium ?? false;

  // Check locking logic: input is locked if the last message in the thread is from "me" (non-premium only)
  const isChatLocked = !isPremium && messages.length > 0 && messages[messages.length - 1].from === "me";

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, active]);

  const sendMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (active === -1) {
        return api.post<any>(`/conversations/send-to-user`, formData);
      }
      return api.post<any>(`/conversations/${active}/messages`, formData);
    },
    onSuccess: (data: any) => {
      setText("");
      clearSelectedImage();
      if (active === -1 && data.conversation_id) {
        setActive(data.conversation_id);
        setSyntheticChat(null);
      }
      queryClient.invalidateQueries({ queryKey: ["messages", active] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: any) => {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("upgrade")) {
        setShowQuotaModal(true);
      } else {
        toast.error(msg || "Failed to send message");
      }
    }
  });

  const respondInterestMutation = useMutation({
    mutationFn: ({ interestId, status }: { interestId: number; status: 'accepted' | 'rejected' }) => {
      return api.put(`/interests/${interestId}`, { status });
    },
    onSuccess: (data: any, variables) => {
      toast.success(`Interest ${variables.status === 'accepted' ? 'accepted' : 'declined'} successfully.`);
      queryClient.invalidateQueries({ queryKey: ["interests", "received"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to respond to interest");
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !imageFile) || isChatLocked) return;
    
    const formData = new FormData();
    if (text.trim()) formData.append("text", text.trim());
    if (imageFile) formData.append("image", imageFile);
    if (active === -1 && syntheticChat) {
      formData.append("receiver_id", syntheticChat.memberId.toString());
    }
    sendMutation.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <DashboardLayout noMargins>
      <div className="flex h-[calc(100vh-144px)] lg:h-[calc(100vh-64px)] w-full overflow-hidden bg-card">
        {/* Sidebar Chat List */}
        <aside className={`w-full sm:w-80 md:w-96 border-r flex flex-col bg-card shrink-0 ${active !== null ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-4 border-b">
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground mb-3">Messages</h2>
            
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-full bg-muted/50 border-none focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Tab switchers */}
            <div className="flex p-0.5 rounded-full bg-muted/60 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full transition-all duration-200 ${activeTab === "chat" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <MessageCircle className="h-3.5 w-3.5" /> Chat
              </button>
              <button
                onClick={() => setActiveTab("sent")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full transition-all duration-200 ${activeTab === "sent" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Heart className="h-3.5 w-3.5" /> Sent
              </button>
              <button
                onClick={() => setActiveTab("received")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full transition-all duration-200 ${activeTab === "received" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Heart className="h-3.5 w-3.5" /> Received
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'chat' && (
              loadingChats ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="mx-auto mb-3 h-8 w-8 opacity-20" />
                  <p className="text-sm">No conversations found</p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setActive(chat.id)}
                    className={`flex w-full items-start gap-3 border-b p-4 text-left transition-colors hover:bg-muted/50 ${active === chat.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                  >
                    <div
                      className="relative shrink-0 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); navigate({ to: '/profile/$id', params: { id: chat.memberId } }); }}
                      title="View Profile"
                    >
                      <img 
                        src={getImageUrl(chat.memberPhoto) || (chat.memberGender?.toLowerCase() === "female" ? "/avatar-female.png" : "/avatar-male.png")} 
                        className="h-12 w-12 rounded-full object-cover shadow-sm border border-muted" 
                        alt="" 
                        onError={(e) => {
                          e.currentTarget.src = chat.memberGender?.toLowerCase() === "female" ? "/avatar-female.png" : "/avatar-male.png";
                        }}
                      />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm truncate pr-2 text-foreground">{chat.memberName}</p>
                        {chat.time && <span className="text-[10px] text-muted-foreground shrink-0">{chat.time}</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground truncate flex-1 pr-2">{chat.lastMessage || "No messages yet"}</p>
                        {chat.unread > 0 && (
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white shrink-0">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )
            )}

            {activeTab === 'sent' && (
              loadingSent ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : sentInterests.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Heart className="mx-auto mb-3 h-8 w-8 opacity-20" />
                  <p className="text-sm">No sent interests yet</p>
                </div>
              ) : (
                sentInterests.map((interest: any) => (
                  <div key={interest.id} className="flex w-full items-start gap-3 border-b p-4 text-left bg-card hover:bg-muted/30 transition-colors">
                    <button
                      onClick={() => navigate({ to: '/profile/$id', params: { id: interest.member.id } })}
                      title="View Profile"
                    >
                      <img 
                        src={getImageUrl(interest.member.photo) || (interest.member.gender?.toLowerCase() === "female" ? "/avatar-female.png" : "/avatar-male.png")} 
                        className="h-12 w-12 rounded-full object-cover shadow-sm border border-muted" 
                        alt="" 
                        onError={(e) => {
                          e.currentTarget.src = interest.member.gender?.toLowerCase() === "female" ? "/avatar-female.png" : "/avatar-male.png";
                        }}
                      />
                    </button>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between mb-1">
                        <button
                          onClick={() => navigate({ to: '/profile/$id', params: { id: interest.member.id } })}
                          className="font-semibold text-sm truncate pr-2 text-foreground hover:underline text-left"
                        >
                          {interest.member.name}
                        </button>
                        <span className="text-[10px] text-muted-foreground shrink-0">{interest.sent_at || interest.created_at}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider
                          ${interest.status === 'accepted' ? 'bg-success/10 text-success' : 
                            interest.status === 'declined' || interest.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 
                            'bg-amber-500/10 text-amber-600'}
                        `}>
                          {interest.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}

            {activeTab === 'received' && (
              loadingReceived ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : receivedInterests.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Heart className="mx-auto mb-3 h-8 w-8 opacity-20" />
                  <p className="text-sm">No received interests yet</p>
                </div>
              ) : (
                receivedInterests.map((interest: any) => (
                  <div key={interest.id} className="flex flex-col gap-2 border-b p-4 text-left bg-card transition-colors hover:bg-muted/30">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => navigate({ to: '/profile/$id', params: { id: interest.member.id } })}
                        title="View Profile"
                      >
                        <img 
                          src={getImageUrl(interest.member.photo) || (interest.member.gender?.toLowerCase() === "female" ? "/avatar-female.png" : "/avatar-male.png")} 
                          className="h-12 w-12 rounded-full object-cover shadow-sm border border-muted" 
                          alt="" 
                          onError={(e) => {
                            e.currentTarget.src = interest.member.gender?.toLowerCase() === "female" ? "/avatar-female.png" : "/avatar-male.png";
                          }}
                        />
                      </button>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-1">
                          <button
                            onClick={() => navigate({ to: '/profile/$id', params: { id: interest.member.id } })}
                            className="font-semibold text-sm truncate pr-2 text-foreground hover:underline text-left"
                          >
                            {interest.member.name}
                          </button>
                          <span className="text-[10px] text-muted-foreground shrink-0">{interest.received_at || interest.created_at}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Sent an interest in your profile</p>
                      </div>
                    </div>
                    {interest.status === 'pending' ? (
                      <div className="flex items-center gap-2 mt-2 pl-15 pl-12">
                        <button
                          onClick={() => respondInterestMutation.mutate({ interestId: interest.id, status: 'accepted' })}
                          disabled={respondInterestMutation.isPending}
                          className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full bg-success text-white font-medium hover:bg-success-dark transition-colors"
                        >
                          <Check className="h-3 w-3" /> Accept
                        </button>
                        <button
                          onClick={() => respondInterestMutation.mutate({ interestId: interest.id, status: 'rejected' })}
                          disabled={respondInterestMutation.isPending}
                          className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full bg-muted text-muted-foreground font-medium hover:bg-muted-dark transition-colors"
                        >
                          <X className="h-3 w-3" /> Decline
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 pl-12">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider
                          ${interest.status === 'accepted' ? 'bg-success/10 text-success' : 
                            'bg-destructive/10 text-destructive'}
                        `}>
                          {interest.status}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )
            )}
          </div>
        </aside>

        {/* Message Panel */}
        <section className={`flex-1 flex flex-col h-full bg-muted/5 ${active === null ? 'hidden sm:flex' : 'flex'}`}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b bg-card px-4 py-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setActive(null)} className="p-1 hover:bg-muted rounded-full sm:hidden">
                      <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => navigate({ to: '/profile/$id', params: { id: activeChat.memberId } })}
                      className="flex items-center gap-3"
                      title="View Profile"
                    >
                      <div className="relative">
                        <img 
                          src={getImageUrl(activeChat.memberPhoto) || (activeChat.memberGender?.toLowerCase() === "female" ? "/avatar-female.png" : "/avatar-male.png")} 
                          className="h-10 w-10 rounded-full object-cover border border-muted" 
                          alt="" 
                          onError={(e) => {
                            e.currentTarget.src = activeChat.memberGender?.toLowerCase() === "female" ? "/avatar-female.png" : "/avatar-male.png";
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-foreground hover:underline">{activeChat.memberName}</h3>
                      </div>
                    </button>
                  </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 opacity-20 mb-2" />
                    <p className="text-sm">No messages yet. Start the conversation by sending a message below.</p>
                  </div>
                ) : (
                  <>
                    {messages.map((m) => (
                      <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-soft text-left flex flex-col ${m.from === "me" ? "gradient-rose text-white" : "bg-card text-foreground"}`}>
                          {m.imageUrl && (
                            <img src={m.imageUrl} alt="Attached" className="max-w-xs rounded-lg mb-2 object-cover border" />
                          )}
                          {m.text && <p className="leading-relaxed break-words">{m.text}</p>}
                          <span className="text-[10px] opacity-70 mt-1 self-end text-right">{m.time}</span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Image Preview attachment */}
              {imagePreview && (
                <div className="flex items-center justify-between border-t bg-card px-4 py-2 text-left">
                  <div className="flex items-center gap-3">
                    <img src={imagePreview} alt="Preview" className="h-14 w-14 rounded-lg object-cover border" />
                    <div>
                      <p className="text-xs font-semibold">Image attachment</p>
                      <p className="text-[10px] text-muted-foreground">{(imageFile!.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                  <button onClick={clearSelectedImage} type="button" className="rounded-full bg-muted p-1 hover:bg-muted-foreground/20">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              )}

              {/* Chat locking banner (non-premium only) */}
              {isChatLocked && (
                <div className="flex items-center gap-2 bg-rose-50 border-t border-rose-100 px-4 py-2.5 text-xs text-rose-600 font-medium">
                  <Ban className="h-3.5 w-3.5 shrink-0" />
                  <span>Text input is locked until you receive a reply to ensure balanced communication.</span>
                </div>
              )}

              {/* Chat Input form */}
              <form onSubmit={handleSend} className="relative flex items-center gap-2 border-t bg-card p-3">
                <div className="flex items-center gap-1">
                  
                  {/* Emoji Button */}
                  <button 
                    type="button" 
                    onClick={() => setShowEmojiPicker(prev => !prev)}
                    className="p-2 hover:bg-muted rounded-full text-muted-foreground"
                    disabled={isChatLocked}
                  >
                    <Smile className="h-5 w-5" />
                  </button>

                  {/* Attachment Button */}
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-muted rounded-full text-muted-foreground"
                    disabled={isChatLocked}
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                <textarea
                  placeholder={isChatLocked ? "Waiting for their reply..." : "Type a message..."}
                  className={`flex-1 resize-none bg-muted/40 rounded-full px-4 py-2 text-sm outline-none placeholder:text-muted-foreground/60 border border-muted focus:border-muted-foreground/30 min-h-[38px] max-h-24 ${isChatLocked ? "opacity-75 cursor-not-allowed" : ""}`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isChatLocked}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />

                <button 
                  type="submit" 
                  disabled={sendMutation.isPending || isChatLocked || (!text.trim() && !imageFile)} 
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-rose text-white shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 ${
                    isChatLocked || (!text.trim() && !imageFile) ? "opacity-50 grayscale cursor-not-allowed" : "hover:shadow-lg"
                  }`}
                >
                  {sendMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 ml-0.5" strokeWidth={2.5} />
                  )}
                </button>

                {/* Emoji Picker Popup */}
                {showEmojiPicker && !isChatLocked && (
                  <div 
                    ref={emojiPickerRef} 
                    className="absolute bottom-16 left-4 z-50 grid grid-cols-5 gap-1.5 rounded-2xl border bg-card p-3 shadow-lg w-52"
                  >
                    {EMOJIS.map((emoji) => (
                      <button 
                        key={emoji} 
                        type="button" 
                        onClick={() => {
                          setText(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }} 
                        className="grid h-8 w-8 place-items-center rounded-lg text-lg hover:bg-muted transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-muted/10">
              <div className="mb-4 grid h-20 w-20 place-items-center rounded-full gradient-rose shadow-lg shadow-rose/20">
                <MessageCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Your Messages</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                Select a conversation from the sidebar to view your messages or reply.
              </p>
            </div>
          )}
        </section>
      </div>

      <Dialog open={showQuotaModal} onOpenChange={setShowQuotaModal}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full gradient-rose shadow-glow">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <DialogHeader className="pt-4">
            <DialogTitle className="text-xl flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" /> Upgrade to Unlock Messaging
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-1">
              You've used all your free message credits. Upgrade your plan to continue chatting and unlock unlimited conversations with all members.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pb-4">
            <Button
              onClick={() => { setShowQuotaModal(false); openUpgrade(); }}
              className="gradient-rose text-white shadow-glow w-full h-12 text-base font-bold"
            >
              <Crown className="mr-2 h-5 w-5" /> Unlock Premium <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setShowQuotaModal(false)}>
              Maybe Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
