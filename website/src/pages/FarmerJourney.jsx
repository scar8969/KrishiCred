import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pseudoDatabase from '../services/pseudoDatabase';

export default function FarmerJourney() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showStartOverlay, setShowStartOverlay] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [pickupConfirmed, setPickupConfirmed] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [selectedKhasra, setSelectedKhasra] = useState('');
  const [userName, setUserName] = useState('');
  const chatEndRef = useRef(null);

  const steps = [
    {
      number: '1',
      title: 'WhatsApp Registration',
      description: 'ਵਟਸਐਪ ਰਜਿਸਟ੍ਰੇਸ਼ਨ: Send Hi to start your onboarding process via WhatsApp.',
      icon: 'chat',
      badge: 'Step 01',
      isActive: currentStep === 1,
      isCompleted: currentStep > 1,
    },
    {
      number: '2',
      title: 'Satellite Detection',
      description: 'ਸੈਟੇਲਾਈਟ ਖੋਜ: We verify no-burn practices through high-res satellite imaging.',
      icon: 'satellite_alt',
      badge: 'Step 02',
      isActive: currentStep === 2,
      isCompleted: currentStep > 2,
    },
    {
      number: '3',
      title: 'Pickup Confirmation',
      description: 'ਪਿਕਅੱਪ ਪੁਸ਼ਟੀ: Confirm residue collection for secondary processing.',
      icon: 'local_shipping',
      badge: 'Step 03',
      isActive: currentStep === 3,
      isCompleted: currentStep > 3,
    },
    {
      number: '4',
      title: 'Payment',
      description: 'ਭੁਗਤਾਨ: Instant credit transfer to your linked bank account or wallet.',
      icon: 'account_balance_wallet',
      badge: 'Complete',
      isActive: currentStep === 4,
      isCompleted: currentStep > 4,
    },
  ];

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // WhatsApp chat messages
  const whatsappFlow = {
    1: [
      { role: 'bot', text: '🙏 ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! Welcome to KrishiCred!', delay: 500 },
      { role: 'bot', text: 'I help you earn money from your paddy stubble instead of burning it.', delay: 1500 },
      { role: 'bot', text: 'Let\'s get you started. Please enter your name:', delay: 2500 },
    ],
    2: [
      { role: 'bot', text: `Thank you ${userName}! 🌾`, delay: 500 },
      { role: 'bot', text: 'Now please share your Khasra number:', delay: 1500 },
    ],
    3: [
      { role: 'bot', text: 'Great! Let me verify your land details...', delay: 500 },
      { role: 'bot', text: `✅ Khasra ${selectedKhasra} verified - 5.2 acres in Ludhiana`, delay: 2000 },
      { role: 'bot', text: 'Your stubble is ready for sale! Current price: ₹2,200/acre + ₹800/acre carbon credits', delay: 3000 },
    ],
  };

  // Send chat message
  const sendMessage = (text) => {
    if (!text.trim()) return;

    // Add user message
    setChatMessages(prev => [...prev, { role: 'user', text }]);

    // Process based on current flow state
    setTimeout(() => {
      if (!userName) {
        setUserName(text);
        // Trigger next bot messages
        whatsappFlow[2].forEach(msg => {
          setTimeout(() => {
            setChatMessages(prev => [...prev, { role: 'bot', text: msg.text }]);
          }, msg.delay);
        });
      } else if (!selectedKhasra) {
        setSelectedKhasra(text);
        whatsappFlow[3].forEach(msg => {
          setTimeout(() => {
            setChatMessages(prev => [...prev, { role: 'bot', text: msg.text }]);
            if (msg.text.includes('carbon credits')) {
              setTimeout(() => {
                setCurrentStep(2);
                setScanProgress(0);
              }, 2000);
            }
          }, msg.delay);
        });
      }
    }, 500);
  };

  // Start satellite scan
  useEffect(() => {
    if (currentStep === 2 && scanProgress < 100) {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setCurrentStep(3), 1000);
            return 100;
          }
          return prev + 5;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [currentStep, scanProgress]);

  // Confirm pickup
  const handlePickupConfirm = () => {
    setPickupConfirmed(true);
    // Calculate payment
    const acreage = 5.2;
    const stubblePayment = acreage * 2200;
    const carbonCredits = acreage * 800;
    setPaymentAmount(stubblePayment + carbonCredits);

    setTimeout(() => {
      setCurrentStep(4);
      setShowPayment(true);
    }, 2000);
  };

  // Start journey
  const startJourney = () => {
    setShowStartOverlay(false);
    setIsPlaying(true);
    setCurrentStep(1);
    // Initialize chat
    whatsappFlow[1].forEach(msg => {
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: 'bot', text: msg.text }]);
      }, msg.delay);
    });
  };

  // Restart journey
  const restartJourney = () => {
    setCurrentStep(1);
    setIsPlaying(false);
    setShowStartOverlay(true);
    setChatMessages([]);
    setUserInput('');
    setScanProgress(0);
    setPickupConfirmed(false);
    setShowPayment(false);
    setPaymentAmount(0);
    setSelectedKhasra('');
    setUserName('');
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <main className="pt-24 px-6 max-w-md mx-auto pb-32">
        {/* Hero Section */}
        <section className="mb-10">
          <h1 className="text-4xl font-extrabold text-on-background leading-tight mb-2">Farmer Journey</h1>
          <p className="text-on-surface-variant font-medium">ਕਿਸਾਨ ਯਾਤਰਾ: Your path to carbon rewards.</p>
        </section>

        {/* Progress Indicator */}
        {isPlaying && (
          <div className="bg-surface-container-low rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Progress</span>
              <span className="text-xs font-bold text-primary">{currentStep} of 4</span>
            </div>
            <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Vertical Stepper / Flow Diagram */}
        <div className="relative">
          {/* Continuous Connection Line */}
          <div className="absolute left-6 top-8 bottom-8 w-1 bg-surface-container-high rounded-full"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative flex gap-6 mb-12">
              <div className={`z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
                step.isCompleted ? 'bg-emerald-500' :
                step.isActive ? 'signature-gradient' :
                'bg-surface-container-high text-on-surface-variant'
              }`}>
                <span className="material-symbols-outlined">
                  {step.isCompleted ? 'check' : step.icon}
                </span>
              </div>
              <div className="flex-grow">
                <div className={`bg-surface-container-low rounded-lg p-6 transition-all ${
                  step.isActive ? 'ring-2 ring-primary' : ''
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-lg font-bold text-on-background ${
                      step.isActive ? 'text-primary' : ''
                    }`}>{step.number}. {step.title}</h3>
                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${
                      step.isCompleted ? 'bg-emerald-100 text-emerald-800' :
                      step.isActive ? 'bg-primary text-on-primary' :
                      'bg-surface-container-highest text-on-surface-variant'
                    }`}>
                      {step.badge}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-4">{step.description}</p>

                  {/* Step 1: WhatsApp Chat */}
                  {step.number === '1' && (
                    <div className="bg-surface-container-highest rounded-xl overflow-hidden">
                      <div className="bg-emerald-600 text-white px-4 py-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">chat</span>
                        <span className="text-sm font-bold">WhatsApp</span>
                      </div>
                      <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                        {chatMessages.length === 0 && !isPlaying && (
                          <p className="text-center text-sm text-on-surface-variant py-4">
                            Click "Start My Journey" to begin
                          </p>
                        )}
                        {chatMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                              msg.role === 'user'
                                ? 'bg-emerald-600 text-white rounded-br-sm'
                                : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                            }`}>
                              <p className="text-sm">{msg.text}</p>
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                      {currentStep === 1 && (
                        <div className="p-3 border-t border-surface-container-high">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={userInput}
                              onChange={(e) => setUserInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && sendMessage(userInput)}
                              placeholder="Type your message..."
                              className="flex-1 bg-surface-container-low rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                              disabled={currentStep !== 1}
                            />
                            <button
                              onClick={() => sendMessage(userInput)}
                              className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center"
                              disabled={!userInput.trim() || currentStep !== 1}
                            >
                              <span className="material-symbols-outlined text-sm">send</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Satellite Scanner */}
                  {step.number === '2' && (
                    <div className="space-y-4">
                      <div className="overflow-hidden rounded-2xl relative h-40">
                        <img
                          className="w-full h-full object-cover grayscale-[30%] contrast-125"
                          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop"
                          alt="Satellite view"
                        />
                        <div className="absolute inset-0 bg-primary/20 backdrop-overlay flex items-center justify-center">
                          <div className="w-20 h-20 border-2 border-primary-container rounded-sm flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white bg-primary px-2">
                              {scanProgress < 100 ? `SCANNING ${scanProgress}%` : 'VERIFIED'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-surface-container-highest rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-on-surface-variant">Scan Progress</span>
                          <span className="text-xs font-bold text-primary">{scanProgress}%</span>
                        </div>
                        <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-200"
                            style={{ width: `${scanProgress}%` }}
                          />
                        </div>
                        {scanProgress === 100 && (
                          <p className="text-xs text-emerald-600 font-bold mt-2">✅ No burning detected - Carbon credits eligible!</p>
                        )}
                      </div>
                      {step.isActive && scanProgress === 100 && (
                        <button
                          onClick={() => setCurrentStep(3)}
                          className="w-full signature-gradient text-on-primary py-3 rounded-xl font-bold text-sm"
                        >
                          Continue to Pickup
                        </button>
                      )}
                    </div>
                  )}

                  {/* Step 3: Pickup Confirmation */}
                  {step.number === '3' && (
                    <div className="space-y-4">
                      {!pickupConfirmed ? (
                        <>
                          <div className="bg-surface-container-highest rounded-2xl p-4 border border-outline-variant/30">
                            <div className="text-[10px] font-bold text-slate-500 mb-2">TRUCK ID: PB-10-CX-9921</div>
                            <div className="text-sm font-bold mb-1">Arriving in 14 mins</div>
                            <div className="text-xs text-on-surface-variant">Driver: Balwinder Singh | +91 98765 43210</div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-surface-container-highest rounded-xl p-3 text-center">
                              <p className="text-[10px] text-on-surface-variant">Est. Weight</p>
                              <p className="text-lg font-bold">12 tons</p>
                            </div>
                            <div className="bg-secondary-container text-on-secondary-container rounded-xl p-3 text-center">
                              <p className="text-[10px] opacity-70">Est. Earnings</p>
                              <p className="text-lg font-bold">₹15,600</p>
                            </div>
                          </div>
                          <button
                            onClick={handlePickupConfirm}
                            className="w-full signature-gradient text-on-primary py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
                          >
                            Confirm Pickup
                          </button>
                        </>
                      ) : (
                        <div className="bg-emerald-50 rounded-2xl p-4 text-center border-2 border-emerald-500">
                          <span className="material-symbols-outlined text-4xl text-emerald-600 mb-2">check_circle</span>
                          <p className="text-sm font-bold text-emerald-800">Pickup Confirmed!</p>
                          <p className="text-xs text-emerald-600 mt-1">Processing your payment...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 4: Payment */}
                  {step.number === '4' && showPayment && (
                    <div className="space-y-4">
                      <div className="bg-secondary-container text-on-secondary-container rounded-2xl p-6 text-center animate-pulse">
                        <p className="text-[10px] font-bold opacity-70 mb-1">REWARD DISBURSED</p>
                        <div className="text-3xl font-black mb-1">₹ {paymentAmount.toLocaleString()}</div>
                        <div className="text-[11px] font-medium">Transaction ID: KC{Date.now()}</div>
                      </div>
                      <div className="bg-surface-container-highest rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-on-surface-variant">Stubble Payment (5.2 acres)</span>
                          <span className="font-bold">₹11,440</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-on-surface-variant">Carbon Credits</span>
                          <span className="font-bold text-primary">₹4,160</span>
                        </div>
                        <div className="border-t border-surface-container-high pt-2 flex justify-between text-sm font-bold">
                          <span>Total</span>
                          <span>₹{paymentAmount.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={restartJourney}
                          className="flex-1 py-3 bg-surface-container-highest text-on-surface hover:bg-surface-container-high rounded-xl font-bold text-sm transition-all"
                        >
                          Start New
                        </button>
                        <Link
                          to="/account"
                          className="flex-1 signature-gradient text-on-primary py-3 rounded-xl font-bold text-sm text-center"
                        >
                          View Account
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Start Overlay */}
        {showStartOverlay && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-2xl p-8 max-w-sm w-full text-center animate-slide-up">
              <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-on-primary-container">agriculture</span>
              </div>
              <h2 className="text-2xl font-bold text-on-surface mb-2">Begin Your Journey</h2>
              <p className="text-on-surface-variant text-sm mb-6">
                Experience how farmers earn money from stubble instead of burning it.
              </p>
              <button
                onClick={startJourney}
                className="w-full signature-gradient text-on-primary py-4 rounded-xl font-bold text-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                Start My Journey
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <p className="text-center text-[12px] text-slate-500 mt-4">
                Already registered? <Link className="text-primary font-bold" to="/account">Check Status</Link>
              </p>
            </div>
          </div>
        )}

        {/* Controls when playing */}
        {isPlaying && !showStartOverlay && currentStep < 4 && (
          <section className="mt-8 flex gap-3">
            <button
              onClick={restartJourney}
              className="flex-1 py-3 bg-surface-container-low text-on-surface hover:bg-surface-container-high rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Restart
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
