import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { whatsappConversationTemplates } from '../services/pseudoDatabase';
import { useDemoStore } from '../stores';

const ChatDemo = () => {
  const {
    currentStep,
    setCurrentStep,
    selectedKhasra,
    setSelectedKhasra,
    chatMessages,
    addChatMessage,
    resetChat,
  } = useDemoStore();

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef(null);

  // Initial messages
  useEffect(() => {
    if (chatMessages.length === 0) {
      const initialMessages = whatsappConversationTemplates.registration;
      initialMessages.forEach((msg, i) => {
        setTimeout(() => {
          addChatMessage({ ...msg, id: Date.now() + i });
          if (i === initialMessages.length - 1) {
            setShowQuickReplies(true);
          }
        }, msg.delay);
      });
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = (text = inputValue) => {
    if (!text.trim()) return;

    // Add user message
    addChatMessage({
      id: Date.now(),
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    });
    setInputValue('');
    setShowQuickReplies(false);

    // Process response based on step
    setIsTyping(true);
    setTimeout(() => {
      processBotResponse(text);
      setIsTyping(false);
    }, 1500);
  };

  const processBotResponse = (userInput) => {
    let responseMessages = [];

    switch (currentStep) {
      case 1: // Language selection
        if (userInput === '1' || userInput.toLowerCase().includes('punjabi')) {
          responseMessages = whatsappConversationTemplates.punjabi;
          setCurrentStep(2);
        } else if (userInput === '2' || userInput.toLowerCase().includes('hindi')) {
          responseMessages = [
            { role: 'bot', text: 'अच्छा! अब अपना खेत नंबर (Khasra) बताएं।' },
          ];
          setCurrentStep(2);
        } else {
          responseMessages = [{ role: 'bot', text: 'Please select 1 for Punjabi or 2 for Hindi.' }];
        }
        break;

      case 2: // Khasra number
        setSelectedKhasra(userInput);
        responseMessages = [
          {
            role: 'bot',
            text: `✅ Khasra ${userInput} verified!\n\nFarm: 5 acres in Rampur, Ludhiana\nCrop: Paddy (Basmati)\nExpected stubble: 20 tons`,
          },
          {
            role: 'bot',
            text: '🌾 Your stubble is ready! Would you like to see buyer offers?',
            delay: 1000,
          },
        ];
        setCurrentStep(3);
        break;

      case 3: // Show offers
        responseMessages = whatsappConversationTemplates.stubbleReady;
        setCurrentStep(4);
        break;

      case 4: // Confirmation
        if (userInput.toLowerCase().includes('confirm') || userInput.toLowerCase().includes('yes')) {
          responseMessages = [
            {
              role: 'bot',
              text: '✅ Pickup Confirmed!\n\n📅 Date: October 26, 2026\n🕐 Time: 8:00 AM\n🚛 Vehicle: PB-10-1234\n\nPayment will be sent via UPI after collection.',
            },
            {
              role: 'bot',
              text: '💰 You will receive:\n• ₹11,000 (stubble sale)\n• ₹4,000 (carbon credits)\n• Total: ₹15,000',
              delay: 1000,
            },
          ];
          setCurrentStep(5);
        }
        break;

      case 5: // Fire alert simulation
        responseMessages = whatsappConversationTemplates.fireAlert;
        setCurrentStep(6);
        break;

      case 6: // Payment
        responseMessages = whatsappConversationTemplates.payment;
        setCurrentStep(7);
        break;

      default:
        responseMessages = [
          {
            role: 'bot',
            text: '🎉 Congratulations! You\'ve completed the demo. Thank you for not burning stubble!',
          },
        ];
        setCurrentStep(8);
    }

    // Send messages with delays
    let delay = 0;
    responseMessages.forEach((msg) => {
      setTimeout(() => {
        addChatMessage({
          ...msg,
          id: Date.now() + Math.random(),
          timestamp: new Date().toISOString(),
        });
      }, msg.delay || delay);
      delay += delay || 1000;
    });
  };

  const handleQuickReply = (action) => {
    switch (action) {
      case 'register':
        handleSendMessage('1');
        break;
      case 'check-status':
        handleSendMessage('Status');
        break;
      case 'reset':
        resetChat();
        setCurrentStep(1);
        setShowQuickReplies(true);
        break;
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 1:
        return 'Select Language (1 or 2)';
      case 2:
        return 'Enter Khasra Number';
      case 3:
        return 'Type anything to continue';
      case 4:
        return 'Type "confirm" to accept';
      default:
        return 'Type a message...';
    }
  };

  return (
    <div className="flex gap-8 items-start justify-center">
      {/* Phone Frame */}
      <div className="bg-gray-900 rounded-[3rem] p-4 shadow-2xl">
        <div className="bg-white rounded-[2.5rem] overflow-hidden" style={{ width: '320px', height: '600px' }}>
          {/* Phone Header */}
          <div className="bg-kc-green text-white px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
              📱
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">KrishiCred Bot</div>
              <div className="text-xs text-green-200">WhatsApp Business</div>
            </div>
            <button
              onClick={() => {
                resetChat();
                setCurrentStep(1);
                setShowQuickReplies(true);
              }}
              className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Chat Messages */}
          <div className="h-[450px] overflow-y-auto p-4 bg-[#E5DDD5]">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-[#DCF8C6] rounded-br-sm'
                      : 'bg-white rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.action ? (
                    <button className="w-full py-2 bg-kc-gold text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors">
                      Confirm Pickup
                    </button>
                  ) : (
                    <div className="whitespace-pre-line">{msg.text}</div>
                  )}
                  {msg.timestamp && (
                    <div className="text-[10px] text-gray-400 text-right mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {showQuickReplies && currentStep === 1 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={() => handleQuickReply('register')}
                  className="flex-1 py-2 bg-kc-green text-white rounded-lg text-sm font-medium hover:bg-kc-light transition-colors"
                >
                  1. ਪੰਜਾਬੀ
                </button>
                <button
                  onClick={() => handleQuickReply('register')}
                  className="flex-1 py-2 bg-kc-green text-white rounded-lg text-sm font-medium hover:bg-kc-light transition-colors"
                >
                  2. हिंदी
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={getButtonText()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-kc-green"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              className="w-10 h-10 rounded-full bg-kc-green text-white flex items-center justify-center hover:bg-kc-light transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="max-w-md space-y-4">
        {[
          {
            step: 1,
            title: '📝 Step 1: Registration',
            description: 'Farmers register with their Khasra number (land record ID). We verify using Punjab Land Records API.',
          },
          {
            step: 2,
            title: '🌾 Step 2: Stubble Ready',
            description: 'After harvest, we detect via satellite and send buyer offers. Farmers see total earnings including carbon credits.',
          },
          {
            step: 3,
            title: '🚛 Step 3: Scheduled Pickup',
            description: 'Our routing algorithm schedules optimal pickup. Balers arrive at confirmed time.',
          },
          {
            step: 4,
            title: '💰 Step 4: Instant Payment',
            description: 'Payment via UPI immediately. Carbon credits processed and paid in 30 days.',
          },
        ].map((stepInfo) => (
          <div
            key={stepInfo.step}
            className={`p-4 rounded-xl transition-all ${
              currentStep >= stepInfo.step
                ? 'bg-kc-green/10 border-2 border-kc-green'
                : 'bg-white border-2 border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= stepInfo.step
                    ? 'bg-kc-green text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep >= stepInfo.step ? <CheckCircle className="w-5 h-5" /> : stepInfo.step}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{stepInfo.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{stepInfo.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatDemo;
