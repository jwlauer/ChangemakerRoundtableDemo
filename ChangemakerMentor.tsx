import React, { useState } from 'react';
import { Send, Users, ChevronDown } from 'lucide-react';

type Message = {
  role: string;
  content: string;
  displayContent?: string;
  mentor?: string;
};

const ChangemakerMentor = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Welcome to the Changemaker Round-Table! We're here to help you develop the skills to drive meaningful change in engineering.\n\n**Meet your mentors:**\n\n🔧 **Maya Rodriguez** - Senior Structural Engineer at a mid-size civil engineering firm (10 years experience)\n\n💼 **James Chen** - Director of Infrastructure at the City Planning Department (your future client)\n\n🏘️ **Sophia Williams** - Community organizer and neighborhood association president (affected by your projects)\n\nYou can ask questions to the whole panel or direct them to a specific mentor. What challenge are you facing, or what would you like to learn about changemaking in engineering?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState('all');

  const mentors = [
    { 
      id: 'all', 
      name: 'All Mentors', 
      icon: '👥',
      color: 'bg-slate-100 text-slate-700'
    },
    { 
      id: 'maya', 
      name: 'Maya (Engineer)', 
      icon: '🔧',
      color: 'bg-blue-100 text-blue-700',
      role: 'Senior Structural Engineer'
    },
    { 
      id: 'james', 
      name: 'James (Client)', 
      icon: '💼',
      color: 'bg-green-100 text-green-700',
      role: 'City Planning Director'
    },
    { 
      id: 'sophia', 
      name: 'Sophia (Community)', 
      icon: '🏘️',
      color: 'bg-purple-100 text-purple-700',
      role: 'Community Organizer'
    }
  ];

  const systemPrompt = `You are facilitating a round-table discussion with three mentors helping first and second-year engineering students (civil, electrical, computer, mechanical) develop changemaking soft skills.

THE THREE MENTORS:

1. MAYA RODRIGUEZ - Senior Structural Engineer (10 years experience, mid-level)
- Works at a mid-size civil engineering firm
- Has navigated office politics, project management, client relations
- Understands the reality of engineering practice vs. what's taught in school
- Focuses on: career development, workplace dynamics, technical leadership, building influence
- Perspective: Pragmatic but idealistic, knows how to work within systems while pushing for change
- Voice: Friendly mentor, shares real stories, balances idealism with practicality

2. JAMES CHEN - Director of Infrastructure, City Planning Department (the client)
- Commissions and oversees engineering projects for the city
- Cares about: budget, timeline, community impact, political pressures, long-term value
- Has worked with many engineering firms, knows what makes projects succeed or fail
- Focuses on: stakeholder management, communication, understanding client needs, delivering value
- Perspective: Sees the bigger picture beyond technical solutions
- Voice: Direct, appreciates proactive communication, values engineers who understand context

3. SOPHIA WILLIAMS - Community Organizer & Neighborhood Association President
- Lives in communities affected by infrastructure and development projects
- Represents residents who often feel excluded from decision-making
- Cares about: equity, environmental justice, community voice, long-term impacts
- Focuses on: inclusive design, meaningful engagement, accountability, environmental/social impact
- Perspective: Skeptical of "we know best" engineering, wants genuine partnership
- Voice: Passionate advocate, challenges assumptions, appreciates humility and listening

RESPONSE FORMAT:

When the student asks "all mentors" or doesn't specify:
- Have 2-3 mentors respond (vary which ones based on relevance)
- Each gives their perspective in 2-3 sentences
- Show diverse viewpoints, sometimes complementary, sometimes in tension
- Format like:
**Maya:** [response]
**James:** [response]
**Sophia:** [response]

When directed to a specific mentor:
- Only that mentor responds
- Can be longer (3-4 paragraphs for deeper coaching)
- That mentor might reference what others would say

COACHING APPROACH:
- Help students see how changemaking requires understanding ALL stakeholder perspectives
- Show the tensions between technical excellence, client needs, and community impact
- Build skills: communication, stakeholder mapping, advocacy, empathy, systems thinking
- Address fears about speaking up, challenging norms, navigating power dynamics
- Provide concrete strategies and examples
- Always end with a question or next step

Keep each mentor's individual responses concise (2-4 sentences) unless doing deep coaching with one mentor. Be conversational and authentic to each persona.`;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const mentorContext = selectedMentor !== 'all' 
      ? `[Question directed to ${mentors.find(m => m.id === selectedMentor)?.name}]\n\n`
      : '';

    const userMessage = { 
      role: 'user', 
      content: mentorContext + input,
      displayContent: input,
      mentor: selectedMentor
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.content[0].text
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '**[Connection error]** We apologize, but we encountered a technical issue. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    { text: "How do I speak up when I disagree with my team's approach?", mentor: 'all' },
    { text: "What makes an engineer valuable from a client perspective?", mentor: 'james' },
    { text: "How can I build authentic professional relationships?", mentor: 'maya' },
    { text: "Why don't engineers listen to community concerns?", mentor: 'sophia' }
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Changemaker Round-Table</h1>
            <p className="text-sm text-slate-600">Learn from diverse perspectives on engineering impact</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl rounded-2xl px-5 py-3 ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-slate-800 shadow-sm border border-slate-200'
            }`}>
              {msg.role === 'user' && msg.mentor !== 'all' && (
                <div className="text-indigo-200 text-xs mb-1 font-medium">
                  → {mentors.find(m => m.id === msg.mentor)?.name}
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.displayContent || msg.content}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-800 rounded-2xl px-5 py-3 shadow-sm border border-slate-200">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}

        {/* Quick prompts */}
        {messages.length === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto mt-6">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(prompt.text);
                  setSelectedMentor(prompt.mentor);
                }}
                className="bg-white border-2 border-slate-200 p-4 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all duration-200 text-left"
              >
                <div className="text-xs text-slate-500 mb-1 font-medium">
                  {prompt.mentor === 'all' ? 'Ask everyone' : `Ask ${mentors.find(m => m.id === prompt.mentor)?.name}`}
                </div>
                <span className="text-sm text-slate-700">{prompt.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 mb-2">
            <div className="relative">
              <select
                value={selectedMentor}
                onChange={(e) => setSelectedMentor(e.target.value)}
                className="appearance-none border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
              >
                {mentors.map(mentor => (
                  <option key={mentor.id} value={mentor.id}>
                    {mentor.icon} {mentor.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your question or share a challenge..."
              className="flex-1 resize-none border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={2}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-indigo-600 text-white px-6 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangemakerMentor;