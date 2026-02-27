import { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { getAiAssistantAdvice } from '@/lib/gemini';
import ReactMarkdown from 'react-markdown';
import { Bot, Send, User, Loader2, Sparkles } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function AiAssistantPage() {
    const { profile } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: `Hello ${profile?.full_name || 'Caregiver'}! I'm your M-Kumbusha AI Assistant. How can I help you manage elderly care today? You can ask about medications, care tips, or system features.`
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const profileContext = `Name: ${profile?.full_name}, Role: ${profile?.role}`;
            const response = await getAiAssistantAdvice(userMessage, profileContext);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error('AI Assistant Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 max-w-4xl mx-auto h-[calc(100vh-64px)] flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">AI Care Assistant</h1>
                        <p className="text-muted-foreground mt-1">
                            Your personal AI companion for healthcare guidance and assistance
                        </p>
                    </div>
                    <div className="bg-primary/10 p-2 rounded-full">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                </div>

                <Card className="flex-1 flex flex-col overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="border-b bg-muted/30 py-3">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-primary" />
                            <CardTitle className="text-sm font-medium">Chat with M-Kumbusha AI</CardTitle>
                        </div>
                    </CardHeader>

                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                        }`}
                                >
                                    <div
                                        className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                            }`}
                                    >
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${message.role === 'user' ? 'bg-primary' : 'bg-muted border'
                                            }`}>
                                            {message.role === 'user' ? (
                                                <User className="h-4 w-4 text-primary-foreground" />
                                            ) : (
                                                <Bot className="h-4 w-4 text-primary" />
                                            )}
                                        </div>
                                        <div
                                            className={`rounded-2xl px-4 py-2 text-sm ${message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted/50 border shadow-sm'
                                                }`}
                                        >
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <ReactMarkdown>{message.content}</ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3 max-w-[80%]">
                                        <div className="h-8 w-8 rounded-full bg-muted border flex items-center justify-center shrink-0">
                                            <Bot className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="rounded-2xl px-4 py-3 bg-muted/50 border flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            <span className="text-xs text-muted-foreground italic">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <CardHeader className="border-t bg-muted/20 p-4">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            className="flex gap-2"
                        >
                            <Input
                                placeholder="Ask me anything (e.g., 'Metformin side effects' or 'How to add a new schedule?')..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={loading}
                                className="bg-background"
                            />
                            <Button type="submit" size="icon" disabled={!input.trim() || loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </form>
                    </CardHeader>
                </Card>

                <div className="flex flex-wrap gap-2">
                    {['Common drugs', 'Care tips', 'How to use M-Kumbusha', 'Analyze logs'].map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setInput(tag)}
                            className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
