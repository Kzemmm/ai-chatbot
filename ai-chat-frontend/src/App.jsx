import { useState, useEffect } from 'react';
import { FiSend, FiMenu } from 'react-icons/fi';

function App() {
  const [prompt, setPrompt] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Init blank chat on load
  useEffect(() => {
    if (!currentConversationId) {
      const newId = Date.now();
      setCurrentConversationId(newId);
    }
  }, [currentConversationId]);

  async function handleSend() {
    if (!prompt.trim()) return;

    let updatedConversations = [...conversations];

    // If conversation ID is not in history yet, add it
    if (!updatedConversations.find(c => c.id === currentConversationId)) {
      updatedConversations.push({
        id: currentConversationId,
        name: `Chat ${updatedConversations.length + 1}`,
        messages: []
      });
    }

    updatedConversations = updatedConversations.map(conv => {
      if (conv.id === currentConversationId) {
        return {
          ...conv,
          messages: [...conv.messages, { role: 'user', content: prompt }]
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();
      const reply = data.response || '⚠️ Backend error.';

      const withBotReply = updatedConversations.map(conv => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, { role: 'bot', content: reply }]
          };
        }
        return conv;
      });

      setConversations(withBotReply);
    } catch {
      // Handle error (optional)
    } finally {
      setIsLoading(false);
    }
  }

  const startNewChat = () => {
    setCurrentConversationId(Date.now());
    setPrompt('');
  };

  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  return (
    <div className="min-h-screen bg-white text-black flex">

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col fixed top-0 left-0 bottom-0 z-20`}>
        <div className="flex items-center justify-between p-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-black">
            <FiMenu size={20} />
          </button>
        </div>

        {sidebarOpen && (
          <>
            <div className="p-4 space-y-4 flex-1 overflow-auto">
              <button
                onClick={startNewChat}
                className="w-full text-left bg-gray-100 p-3 rounded-lg hover:bg-gray-200"
              >
                + New Chat
              </button>

              {[...conversations].reverse().map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setCurrentConversationId(conv.id)}
                  className={`w-full text-left p-3 rounded-lg ${
                    conv.id === currentConversationId
                      ? 'bg-gray-200 font-semibold'
                      : 'bg-gray-100'
                  } hover:bg-gray-200`}
                >
                  {conv.name}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <img src="asd.jpg" alt="avatar" className="w-5 h-5 rounded-full" />
                <span className="font-medium">Profile</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>

        {/* Header */}
        <div className="fixed top-0 left-0 right-0 p-2 bg-white flex items-center justify-end pr-4 z-10">
          <img src="asd.jpg" alt="avatar" className="w-8 h-8 rounded-full" />
        </div>

        {/* Messages Area */}
        <div className={`flex-1 overflow-y-auto ${messages.length === 0 ? 'flex items-center justify-center' : ''}`} style={{ paddingTop: '64px', paddingBottom: messages.length > 0 ? '120px' : '0' }}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center text-center space-y-4 max-w-xl px-4 mx-auto">
              <h2 className="text-3xl font-bold text-black">Ask anything and get instant answers.</h2>

              <div className="flex justify-center w-full mt-3">
                <div className="flex flex-col w-full bg-white border border-gray-200 rounded-xl shadow-md p-3 pb-2 pr-2 max-h-50">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Type your question here..."
                    rows={0}
                    className="resize-y max-h-50 bg-white focus:outline-none text-black text-sm"
                    style={{ minHeight: '40px' }}
                  ></textarea>
                  <div className='flex justify-end mt-2'>
                    <button
                      onClick={handleSend}
                      className="ml-2 bg-black text-white hover:bg-gray-800 p-2 rounded-full flex items-center justify-center"
                    >
                      <FiSend size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col px-4 py-8 space-y-6 max-w-2xl mx-auto w-full">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`text-sm leading-relaxed px-4 py-3 rounded-lg max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-black text-white rounded-br-none'
                        : 'text-black bg-gray-100 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 bg-gray-200 text-black text-sm rounded-lg italic animate-pulse">
                    AI is thinking...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed Input (only when chat has started) */}
        {messages.length > 0 && (
          <div
            className="fixed bottom-0 z-10 transition-all duration-300 bg-white pb-4"
            style={{
              left: sidebarOpen ? '16rem' : '0',
              width: sidebarOpen ? 'calc(100% - 16rem)' : '100%'
            }}
          >
            <div className="flex justify-center px-4">
              <div className="flex flex-col w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-md p-3 pb-2 pr-2 max-h-50">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type your message..."
                  rows={0}
                  className="resize-y max-h-50 bg-white focus:outline-none text-black text-sm"
                  style={{ minHeight: '40px' }}
                ></textarea>
                <div className='flex justify-end mt-2'>
                  <button
                    onClick={handleSend}
                    className="ml-2 bg-black text-white hover:bg-gray-800 p-2 rounded-full flex items-center justify-center"
                  >
                    <FiSend size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
