import { useState, useEffect, useRef } from 'react';
import { FiSend, FiMenu } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

function App({ user, onLogout }) {
  const [prompt, setPrompt] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest('.relative.inline-block')) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  

  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!currentConversationId) {
      const newId = Date.now();
      setCurrentConversationId(newId);
    }
  }, [currentConversationId]);

  useEffect(() => {
    const textarea = textareaRef.current;
    const container = containerRef.current;

    if (textarea && container) {
      textarea.style.height = 'auto';
      container.style.height = 'auto';

      const lineHeight = 20;
      const maxHeight = lineHeight * 7;

      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
      container.style.height = `${newHeight + 60}px`;
    }
  }, [prompt]);

  async function handleSend() {
    if (!prompt.trim()) return;

    let updatedConversations = [...conversations];

    const existing = updatedConversations.find(c => c.id === currentConversationId);

    if (!existing) {
      updatedConversations.push({
        id: currentConversationId,
        name: prompt.length > 40 ? prompt.slice(0, 40) + '...' : prompt, // 🟢 Dynamic title
        messages: []
      });
    } else if (existing.messages.length === 0 && !existing.name.startsWith('Chat')) {
      updatedConversations = updatedConversations.map(conv => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            name: prompt.length > 40 ? prompt.slice(0, 40) + '...' : prompt
          };
        }
        return conv;
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
      // empty
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
    <div className="bg-white text-black min-h-screen flex">
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col fixed top-0 left-0 bottom-0 z-20`}>
        <div className="flex items-center justify-between p-2">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg text-black">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" data-rtl-flip="" class="icon max-md:hidden"><path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.538L16.6299 14.3378C16.7074 14.121 16.7605 13.8478 16.792 13.4618C16.8347 12.9394 16.835 12.2712 16.835 11.3271V8.66301C16.835 7.71885 16.8347 7.05065 16.792 6.52824C16.7605 6.14232 16.7073 5.86904 16.6299 5.65227L16.5439 5.45207C16.32 5.01264 15.9796 4.64498 15.5615 4.3886L15.3779 4.28606C15.1308 4.16013 14.8165 4.08006 14.3018 4.03801C13.7794 3.99533 13.1112 3.99504 12.167 3.99504H8.16406C8.16407 3.99667 8.16504 3.99829 8.16504 3.99992L8.16406 15.995Z"></path></svg>
          </button>
        </div>

        {sidebarOpen && (
          <>
            <div className="flex flex-col p-2 space-y-1 flex-1 overflow-hidden">
                <button
                onClick={startNewChat}
                className={`w-full flex items-center gap-2 text-left cursor-pointer p-1 pl-2 rounded-lg ${
                    (!conversations.find(c => c.id === currentConversationId) ||
                    conversations.find(c => c.id === currentConversationId)?.messages?.length === 0)
                    ? 'bg-gray-100 font-semibold'
                    : 'hover:bg-gray-100'
                }`}
                >
                    <span><svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon" aria-hidden="true"><path d="M2.6687 11.333V8.66699C2.6687 7.74455 2.66841 7.01205 2.71655 6.42285C2.76533 5.82612 2.86699 5.31731 3.10425 4.85156L3.25854 4.57617C3.64272 3.94975 4.19392 3.43995 4.85229 3.10449L5.02905 3.02149C5.44666 2.84233 5.90133 2.75849 6.42358 2.71582C7.01272 2.66769 7.74445 2.66797 8.66675 2.66797H9.16675C9.53393 2.66797 9.83165 2.96586 9.83179 3.33301C9.83179 3.70028 9.53402 3.99805 9.16675 3.99805H8.66675C7.7226 3.99805 7.05438 3.99834 6.53198 4.04102C6.14611 4.07254 5.87277 4.12568 5.65601 4.20313L5.45581 4.28906C5.01645 4.51293 4.64872 4.85345 4.39233 5.27149L4.28979 5.45508C4.16388 5.7022 4.08381 6.01663 4.04175 6.53125C3.99906 7.05373 3.99878 7.7226 3.99878 8.66699V11.333C3.99878 12.2774 3.99906 12.9463 4.04175 13.4688C4.08381 13.9833 4.16389 14.2978 4.28979 14.5449L4.39233 14.7285C4.64871 15.1465 5.01648 15.4871 5.45581 15.7109L5.65601 15.7969C5.87276 15.8743 6.14614 15.9265 6.53198 15.958C7.05439 16.0007 7.72256 16.002 8.66675 16.002H11.3337C12.2779 16.002 12.9461 16.0007 13.4685 15.958C13.9829 15.916 14.2976 15.8367 14.5447 15.7109L14.7292 15.6074C15.147 15.3511 15.4879 14.9841 15.7117 14.5449L15.7976 14.3447C15.8751 14.128 15.9272 13.8546 15.9587 13.4688C16.0014 12.9463 16.0017 12.2774 16.0017 11.333V10.833C16.0018 10.466 16.2997 10.1681 16.6667 10.168C17.0339 10.168 17.3316 10.4659 17.3318 10.833V11.333C17.3318 12.2555 17.3331 12.9879 17.2849 13.5771C17.2422 14.0993 17.1584 14.5541 16.9792 14.9717L16.8962 15.1484C16.5609 15.8066 16.0507 16.3571 15.4246 16.7412L15.1492 16.8955C14.6833 17.1329 14.1739 17.2354 13.5769 17.2842C12.9878 17.3323 12.256 17.332 11.3337 17.332H8.66675C7.74446 17.332 7.01271 17.3323 6.42358 17.2842C5.90135 17.2415 5.44665 17.1577 5.02905 16.9785L4.85229 16.8955C4.19396 16.5601 3.64271 16.0502 3.25854 15.4238L3.10425 15.1484C2.86697 14.6827 2.76534 14.1739 2.71655 13.5771C2.66841 12.9879 2.6687 12.2555 2.6687 11.333ZM13.4646 3.11328C14.4201 2.334 15.8288 2.38969 16.7195 3.28027L16.8865 3.46485C17.6141 4.35685 17.6143 5.64423 16.8865 6.53613L16.7195 6.7207L11.6726 11.7686C11.1373 12.3039 10.4624 12.6746 9.72827 12.8408L9.41089 12.8994L7.59351 13.1582C7.38637 13.1877 7.17701 13.1187 7.02905 12.9707C6.88112 12.8227 6.81199 12.6134 6.84155 12.4063L7.10132 10.5898L7.15991 10.2715C7.3262 9.53749 7.69692 8.86241 8.23218 8.32715L13.2791 3.28027L13.4646 3.11328ZM15.7791 4.2207C15.3753 3.81702 14.7366 3.79124 14.3035 4.14453L14.2195 4.2207L9.17261 9.26856C8.81541 9.62578 8.56774 10.0756 8.45679 10.5654L8.41772 10.7773L8.28296 11.7158L9.22241 11.582L9.43433 11.543C9.92426 11.432 10.3749 11.1844 10.7322 10.8271L15.7791 5.78027L15.8552 5.69629C16.185 5.29194 16.1852 4.708 15.8552 4.30371L15.7791 4.2207Z"></path></svg></span>
                    New Chat
                </button>

              <small className="text-gray-400 font-semibold pl-2 mt-8">Chats</small>

              <div className="space-y-1 flex-1 overflow-x-auto">
                {[...conversations].reverse().map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setCurrentConversationId(conv.id)}
                    className={`w-full text-left p-1 pl-2 rounded-lg cursor-pointer ${
                      conv.id === currentConversationId
                        ? 'bg-gray-100 font-semibold'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {conv.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <img src="asd.jpg" alt="avatar" className="w-5 h-5 rounded-full" />
                <span className="font-medium">{user?.username}</span>
              </div>
            </div>
            
          </>
        )}
      </div>

      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
        <div className={`fixed top-0 left-0 right-0 p-3 ${messages.length > 0 ? 'border-b border-gray-200' : ''} bg-white flex items-center justify-end pr-4 z-10`}>
            <div className="relative inline-block text-left">
                <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center space-x-2 focus:outline-none"
                >
                <img src="asd.jpg" alt="avatar" className="w-7 h-7 rounded-full cursor-pointer" />
                </button>

                {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white border-1 border-gray-200 z-20">
                    <div className="py-1 text-sm text-black">
                    <div className="px-4 py-2">{user?.username}</div>
                    <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                        Logout
                    </button>
                    </div>
                </div>
                )}
            </div>
        </div>


        <div className={`flex-1 overflow-y-auto ${messages.length === 0 ? 'flex items-center justify-center' : ''}`} style={{ paddingTop: '64px', paddingBottom: messages.length > 0 ? '120px' : '0' }}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center text-center space-y-4 w-full px-4 mx-auto">
              <h2 className="text-3xl font-bold text-black">Ask anything and get instant answers.</h2>
              <div className="flex justify-center w-full mt-3">
                <div
                  className="relative h-25 flex flex-col w-full max-w-3xl bg-white border border-gray-200 rounded-3xl shadow-md p-5 overflow-hidden"
                  ref={containerRef}
                >
                  <textarea 
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Ask anything..."
                    className="bg-white text-black focus:outline-none text-sm overflow-y-auto resize-none"
                    style={{ maxHeight: '120px', lineHeight: '20px', minHeight: '30px' }}
                  ></textarea>
                  <div className="absolute bottom-2 right-3 flex justify-end">
                    <button
                      onClick={handleSend}
                      className="cursor-pointer bg-black text-white hover:bg-gray-800 p-2 rounded-full flex items-center justify-center"
                    >
                      <FiSend size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col py-8 space-y-6 max-w-3xl mx-auto w-full">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`text-sm leading-relaxed px-4 py-3 rounded-lg max-w-[100%] ${
                      msg.role === 'user'
                        ? 'border border-gray-100 text-black rounded-br-none'
                        : 'text-black rounded-bl-none'
                    } prose prose-sm break-words`}
                  >
                    <ReactMarkdown
                      components={{
                        code({ inline, children }) {
                          return inline ? (
                            <code className="bg-gray-200 px-1 rounded">{children}</code>
                          ) : (
                            <pre className="bg-gray-200 text-black p-3 rounded overflow-x-auto">
                              <code>{children}</code>
                            </pre>
                          );
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 text-black text-sm rounded-lg italic animate-pulse">
                    AI is thinking...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {messages.length > 0 && (
            <div
            className="fixed bottom-0 z-10 bg-white pb-4 transition-all duration-300"
            style={{
              left: sidebarOpen ? '16rem' : '0',
              width: sidebarOpen ? 'calc(100% - 16rem)' : '100%'
            }}
          >
            <div className="flex justify-center px-4">
                <div
                  className="relative h-25 flex flex-col gap-2 w-full max-w-3xl bg-white border border-gray-200 rounded-3xl shadow-md p-5 pr-4 overflow-hidden"
                  ref={containerRef}
                >
                  <textarea 
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Ask anything..."
                    className="bg-white text-black focus:outline-none text-sm overflow-y-auto resize-none"
                    style={{ maxHeight: '120px', lineHeight: '20px', minHeight: '30px' }}
                  ></textarea>
                  <div className="absolute bottom-11 right-3 flex justify-end">
                    <button
                      onClick={handleSend}
                      className="fixed cursor-pointer bg-black text-white hover:bg-gray-800 p-2 rounded-full flex items-center justify-center"
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
