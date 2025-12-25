import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, Sparkles, X } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// EXPANDED PLATFORM KNOWLEDGE (COMPREHENSIVE Q&A DATASET)
// ─────────────────────────────────────────────────────────────────────────────
// Expanded with more entries covering Admin, Student, Institute, Verifier roles,
// security, blockchain specifics, and common queries. Structured for better matching.
const platformKnowledge = {
  // 1. Getting Started (General)
  'how do i sign up as a student': 'Students sign up for free:\n1. Click “Connect Wallet” on the homepage\n2. MetaMask will prompt you to connect\n3. Fill in your full name and email\n4. Your wallet becomes your permanent academic identity\nNo payment required – unlimited access for students.',
  'how do i request institution authorization': 'To become an authorized issuer:\n1. Go to “Institution → Request Authorization”\n2. Enter institution name, official website, and admin wallet address\n3. Submit the form\n4. Platform admin reviews (usually within 24h)\n5. Once approved, you can issue credentials immediately.',
  'what happens after i submit an authorization request': 'Your request enters the `institution_authorization_requests` table with status **pending**. The admin reviews supporting documents. You’ll receive an email when approved or rejected. Approved institutions gain the `MINTER` role in the smart contract.',
  'do i need to pay to become an authorized institution': 'Authorization itself is free. After approval you must subscribe to a paid plan (Basic/Pro/Enterprise) to issue credentials.',
  'how do i switch to sepolia testnet': 'The platform auto-switches your wallet:\n1. Click “Connect Wallet”\n2. If on another network, MetaMask shows “Switch to Sepolia”\n3. Approve the switch\nYou’ll stay on Sepolia for all transactions.',
  'where can i get free sepolia eth': 'Use any public faucet:\n• https://sepoliafaucet.com\n• https://faucet.sepolia.dev\n• https://faucet.quicknode.com/sepolia\nPaste your address, solve captcha, receive 0.5–2 Sepolia ETH (free, no real value).',
  'what is this platform': 'This is a blockchain-based platform for secure issuance and instant verification of academic credentials. It uses soulbound tokens (SBTs) on Ethereum Sepolia testnet to ensure credentials are tamper-proof, non-transferable, and verifiable in seconds. Ideal for students applying abroad, institutions issuing degrees, and employers/universities verifying authenticity.',

  // 2. Credential Issuance (Institution Role)
  'what file types can i upload for a credential': 'Supported formats: **PDF**, **PNG**, **JPG/JPEG**. Max size per file: 10 MB.',
  'can i issue multiple credentials in one transaction': 'Each credential is minted individually (one transaction per NFT). Bulk upload is planned for Enterprise tier in Phase 2.',
  'what information is required to issue a credential': 'Required fields:\n- Student wallet address\n- Full name\n- Degree title\n- Institution name\n- Graduation year\n- Document file (PDF/PNG/JPG)',
  'how long does it take to issue a credential': 'Average ~15 seconds (IPFS upload ~5-10s + blockchain confirmation ~5s).',
  'is there a limit on how many credentials i can issue': 'Depends on your plan:\n• Basic – 100/month\n• Pro – 500/month\n• Enterprise – unlimited',
  'what happens if the transaction fails': 'If MetaMask rejects or gas is insufficient:\n1. The document stays in IPFS (you keep the hash)\n2. No NFT is minted\n3. You can retry with higher gas or correct inputs.',
  'can i edit a credential after issuing': 'No. Blockchain is immutable. To correct, revoke the old token and issue a new one.',
  'how do i know the credential was minted successfully': 'After transaction confirmation you’ll see:\n- Success toast\n- Token ID displayed\n- Entry in “Issued Credentials” table\n- Event logged in audit trail',
  'how do i revoke a credential': 'As an authorized institution:\n1. Go to “Issued Credentials” dashboard\n2. Select the token ID\n3. Click “Revoke” and confirm transaction\n4. Status updates to “Revoked” on-chain; student is notified via email.',

  // 3. Soulbound Tokens (SBTs)
  'why are credentials non-transferable': 'Soulbound tokens use a custom `_update` override that reverts any transfer except minting (from address 0). This guarantees the degree stays with the original student forever.',
  'can a soulbound token be burned': 'Only the contract owner (platform) can burn a token for cleanup. Issuers can only **revoke** (mark as invalid).',
  'what is the difference between revoke and burn': '• **Revoke** – marks token as invalid, keeps history\n• **Burn** – removes token completely (rare, admin only)',
  'can a student transfer a credential to another wallet': 'No. Any attempt triggers “Soulbound: Token is non-transferable” error.',
  'are soulbound tokens visible on opensea': 'Yes, but they show “Non-Transferable” and cannot be listed for sale.',
  'what blockchain is used': 'Ethereum Sepolia testnet for development (gas-efficient, free ETH via faucets). Mainnet migration planned for production.',

  // 4. Verification (Employer/Verifier Role)
  'how does a university verify a credential': '1. Student sends QR code or share link\n2. University opens link → Verification Portal\n3. System reads token ID → queries contract\n4. Shows: degree, issue date, institution, revocation status, IPFS doc\n5. All in <2 seconds.',
  'do verifiers need a wallet to check a credential': 'No. Verification portal is public; no login or wallet required.',
  'how long do share links stay active': 'Default: 24 hours. You can set 1h, 6h, 24h, 7 days, or custom expiration.',
  'can i see who accessed my share link': 'Yes. In Student Dashboard → “Access Logs” you see:\n- Timestamp\n- IP (anonymized)\n- Institution name (if provided)\n- Access count',
  'what happens when a share link expires': 'The link returns “Expired” and no data is shown. All access is blocked.',
  'can i revoke a share link before it expires': 'Yes. Click “Revoke Link” next to any active share; it is invalidated instantly.',
  'is the original document downloadable by verifiers': 'Yes, the IPFS link opens the PDF/PNG in the browser. The hash is shown for integrity check.',
  'how do i generate a qr code for a credential': 'In Student Wallet → select credential → “Share” → “QR Code”. A printable PNG is generated instantly.',
  'what if a credential is revoked during verification': 'The portal shows “Revoked” status with reason (if provided by issuer). Full history is displayed for transparency.',

  // 5. Student Experience
  'how do i view my credentials in 3d': 'Open Student Wallet → toggle “3D Showcase”. Use mouse to rotate, flip, or switch between Grid/Stack/Focus views.',
  'how do i share my credentials with an employer': '1. Student Dashboard → Select Credential → “Share”\n2. Choose “Link” or “QR Code”\n3. Set expiration and optional password\n4. Send via email or print QR for interviews.',
  'can i export my credentials': 'Yes: Download as PDF summary, JSON metadata, or EVM-compatible wallet export (for integration with other dApps).',

  // 6. Admin Features
  'how do i approve institution requests as admin': 'Admin Dashboard → “Pending Authorizations” → Review docs → Approve/Reject → Assign MINTER role via contract.',
  'what audit logs are available': 'Full on-chain events: Mint, Revoke, Share Access. Off-chain: IPFS uploads, User logins. Exportable as CSV.',
  'how do i manage subscription plans': 'Admin → “Billing” → View usage, upgrade/downgrade institutions, apply promo codes (e.g., TRINETRA for 50% off first month).',

  // 7. Security & IPFS
  'are private keys ever sent to the server': 'Never. All signing happens in MetaMask client-side. Server only receives transaction hashes and public data.',
  'what happens if ipfs node goes down': 'IPFS is decentralized; files are pinned across multiple nodes (via Pinata gateway). If unavailable, fallback to archived copies on platform servers. Hash ensures integrity.',
  'how is data privacy ensured': 'GDPR-compliant: Student data encrypted, access logs anonymized, revocation respects right-to-be-forgotten (via burn). No KYC required.',

  // 8. Pricing & Plans
  'what is promo code trinetra': 'TRINETRA gives 50% off the first month for Pro/Enterprise plans. Apply during subscription checkout.',
  'what are the pricing plans': '• **Basic**: $49/mo – 100 credentials, basic support\n• **Pro**: $199/mo – 500 credentials, priority support, API access\n• **Enterprise**: Custom – Unlimited, white-label, bulk minting\nStudents/Verifiers: Free forever.',

  // 9. Troubleshooting
  'meta mask not connecting': '1. Ensure MetaMask is unlocked\n2. Switch to Sepolia testnet\n3. Clear cache and refresh\n4. Check console for errors (F12).',
  'transaction pending forever': 'Increase gas limit in MetaMask. If stuck, use Etherscan Sepolia to speed up or cancel.',
  'ipfs upload failed': 'Check file size (<10MB), internet connection. Retry or use a different browser.',

  // 10. Advanced/International
  'is this suitable for applications abroad': 'Yes! Instant verification reduces fraud risks for international unis (e.g., US/UK). QR codes work offline; supports multi-language docs.',
  'can i integrate with other systems': 'API available for Enterprise: Query tokens, verify via webhook. Compatible with ERC-721 standards.',
};

// ─────────────────────────────────────────────────────────────────────────────
// IMPROVED AI LOGIC: FUZZY KEYWORD MATCHING + CONTEXT AWARENESS
// ─────────────────────────────────────────────────────────────────────────────
// Simple client-side fuzzy matching using word overlap score.
// No external libs needed. Scores questions based on keyword matches (threshold 0.3).
// Added conversation context: Remembers last 3 messages for follow-ups.
const getAIResponse = (userMessage, conversationHistory = []) => {
  const msg = userMessage.toLowerCase().trim();
  if (!msg) return "Sorry, I didn't catch that. Could you rephrase?";

  // Extract keywords from user message (simple: split and filter common words)
  const userKeywords = msg
    .split(/\s+/)
    .filter(word => word.length > 2 && !['the', 'and', 'for', 'with', 'how', 'what', 'can', 'do', 'i', 'to', 'in', 'on'].includes(word))
    .map(word => word.replace(/[^\w]/g, ''));

  // Build context-augmented query: Include recent history keywords
  const contextKeywords = conversationHistory
    .slice(-3) // Last 3 user messages
    .flatMap(m => m.content.toLowerCase().match(/\b\w{3,}\b/g) || [])
    .filter(word => !['the', 'and', 'for', 'with', 'how', 'what', 'can', 'do', 'i', 'to', 'in', 'on'].includes(word))
    .slice(0, 5); // Limit context

  const allKeywords = [...new Set([...userKeywords, ...contextKeywords])];

  // Score each Q&A pair: Jaccard similarity (intersection over union)
  let bestMatch = null;
  let bestScore = 0;

  for (const [question, answer] of Object.entries(platformKnowledge)) {
    const qLower = question.toLowerCase();
    const qKeywords = qLower
      .split(/\s+/)
      .filter(word => word.length > 2)
      .map(word => word.replace(/[^\w]/g, ''));

    // Jaccard score
    const intersection = qKeywords.filter(kw => allKeywords.includes(kw)).length;
    const union = new Set([...qKeywords, ...allKeywords]).size;
    const score = union > 0 ? intersection / union : 0;

    if (score > bestScore && score >= 0.3) { // Threshold for "good" match
      bestScore = score;
      bestMatch = answer;
    }
  }

  // Fallback keyword rules (enhanced with more conditions)
  if (!bestMatch) {
    const lowerMsg = msg;
    if (lowerMsg.includes('issue') || lowerMsg.includes('mint') || lowerMsg.includes('create credential')) {
      return platformKnowledge['what information is required to issue a credential'];
    }
    if (lowerMsg.includes('verify') || lowerMsg.includes('check') || lowerMsg.includes('validate')) {
      return platformKnowledge['how does a university verify a credential'];
    }
    if (lowerMsg.includes('soulbound') || lowerMsg.includes('sbt') || lowerMsg.includes('non-transferable')) {
      return platformKnowledge['why are credentials non-transferable'];
    }
    if (lowerMsg.includes('share') || lowerMsg.includes('link') || lowerMsg.includes('qr')) {
      return platformKnowledge['how long do share links stay active'];
    }
    if (lowerMsg.includes('wallet') || lowerMsg.includes('connect') || lowerMsg.includes('metamask')) {
      return platformKnowledge['how do i switch to sepolia testnet'];
    }
    if (lowerMsg.includes('ipfs') || lowerMsg.includes('file') || lowerMsg.includes('upload')) {
      return platformKnowledge['what happens if ipfs node goes down'];
    }
    if (lowerMsg.includes('plan') || lowerMsg.includes('price') || lowerMsg.includes('subscription')) {
      return platformKnowledge['what are the pricing plans'];
    }
    if (lowerMsg.includes('security') || lowerMsg.includes('private key') || lowerMsg.includes('safe')) {
      return platformKnowledge['are private keys ever sent to the server'];
    }
    if (lowerMsg.includes('admin') || lowerMsg.includes('approve')) {
      return platformKnowledge['how do i approve institution requests as admin'];
    }
    if (lowerMsg.includes('revoke') || lowerMsg.includes('cancel credential')) {
      return platformKnowledge['how do i revoke a credential'];
    }
    if (lowerMsg.includes('trouble') || lowerMsg.includes('error') || lowerMsg.includes('failed')) {
      return platformKnowledge['meta mask not connecting']; // Generic troubleshooting
    }
  }

  return bestMatch || "I couldn't find a perfect match, but based on our conversation, here's what might help. For more, ask about issuing credentials, verification, SBTs, wallets, security, or plans. What's next?";
};

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED COMPONENT: BETTER UX, CONTEXT TRACKING, ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────────────
export default function AIAssistantChat() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant for the Academic Credentials Platform – securing verifiable degrees on blockchain. Ask about signing up, issuing credentials, verification, SBTs, or troubleshooting. What's on your mind?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]); // Track user messages for context
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    // Update history (only user messages)
    setConversationHistory(prev => [...prev, userMsg].slice(-5)); // Keep last 5 for memory

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Simulate typing delay, then generate response
    setTimeout(() => {
      const botReply = getAIResponse(userMsg.content, conversationHistory);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: botReply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
      setLoading(false);
    }, 800 + Math.random() * 400); // Variable delay for natural feel (800-1200ms)
  };

  const clearChat = () => {
    setMessages(messages.slice(0, 1)); // Reset to welcome message
    setConversationHistory([]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-2xl border border-gray-700 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500 rounded-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">AI Assistant</h3>
            <p className="text-xs text-gray-400">Secure Credentials on Blockchain</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="Clear chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-gray-700 text-gray-100 rounded-bl-sm"
              }`}
            >
              {m.role === "assistant" && (
                <div className="flex items-center mb-2 space-x-2">
                  <Sparkles className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">AI Assistant</span>
                </div>
              )}
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
              <span className="text-xs opacity-60 mt-1 block">
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 p-3 rounded-lg flex items-center space-x-2 rounded-bl-sm">
              <Loader2 className="w-4 h-4 animate-spin text-green-400" />
              <span className="text-gray-300 text-sm">Generating response...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <textarea
            className="flex-1 bg-gray-700 text-white p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Ask about credentials, verification, wallets, or anything else..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{ overflowY: 'auto', maxHeight: '100px' }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`p-3 rounded-lg text-white transition-colors ${
              loading || !input.trim()
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1 text-center">
          Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
