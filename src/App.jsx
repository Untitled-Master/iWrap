import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import html2canvas from 'html2canvas';
import {
  MessageSquare, Zap, ShieldCheck, ArrowRight, Code2,
  BarChart3, Globe, Clock, Check, Star, Upload, Download,
  ChevronRight, Trophy, Activity, Send, Target, Heart,
  Layers, MessageCircle, Camera, Coffee, Ghost, Terminal
} from 'lucide-react';

// --- Utilities ---
const decodeIG = (s) => {
  if (!s) return "";
  try { return decodeURIComponent(escape(s)); } catch (e) { return s; }
};

const formatTimeSpent = (msgs) => {
  const count = msgs || 0;
  const seconds = count * 5;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return { h, m };
};

const getTopFromMap = (map) => {
  const entries = Object.entries(map);
  if (entries.length === 0) return ["None", 0];
  return entries.sort((a, b) => b[1] - a[1])[0];
};

// --- Sub-Components ---
const RollingNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, value || 0, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (val) => setDisplay(Math.floor(val)),
    });
    return () => controls.stop();
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
};

const App = () => {
  const [step, setStep] = useState('landing');
  const [slideIndex, setSlideIndex] = useState(0);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const shareCardRef = useRef(null);

  const addLog = (msg) => {
    setLogs(prev => [...prev.slice(-6), `> ${msg}`]);
  };

  const funnyQuotes = [
    "Decompiling your social life...",
    "Scanning 2 AM text logs...",
    "Measuring caffeine-to-message ratio...",
    "Calculating tea spilled in 2025...",
    "Analyzing thumb-travel distance...",
    "Checking for signs of 'Leaving on Read'...",
    "Organizing your unread messages...",
    "Preparing the vibe report..."
  ];

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setStep('loading');
    setLogs([]);

    const rawStats = {
      msgFreq: {},
      dmMap: {},
      totalMessages: 0,
      totalSent: 0,
      storyLikesMap: {},
      totalStoryLikes: 0,
      postLikesMap: {},
      totalPostLikes: 0,
      totalComments: 0,
      totalStoriesPosted: 0,
    };

    const jsonFiles = files.filter(f => f.name.endsWith('.json'));
    addLog(`Detected ${jsonFiles.length} JSON entities.`);

    const batchSize = 50;
    for (let i = 0; i < jsonFiles.length; i += batchSize) {
      const batch = jsonFiles.slice(i, i + batchSize);

      await Promise.all(batch.map(async (file) => {
        const path = file.webkitRelativePath;
        try {
          const text = await file.text();
          const data = JSON.parse(text);

          if (path.includes('messages/inbox/')) {
            const isGroup = (data.participants?.length > 2) || !!data.joinable_mode;
            const threadTitle = decodeIG(data.title || "Unknown");

            data.messages?.forEach(m => {
              const s = decodeIG(m.sender_name);
              rawStats.msgFreq[s] = (rawStats.msgFreq[s] || 0) + 1;
              rawStats.totalMessages++;
              if (!isGroup) {
                if (!rawStats.dmMap[threadTitle]) rawStats.dmMap[threadTitle] = { count: 0, senderMap: {} };
                rawStats.dmMap[threadTitle].count++;
                rawStats.dmMap[threadTitle].senderMap[s] = (rawStats.dmMap[threadTitle].senderMap[s] || 0) + 1;
              }
            });
          }

          if (path.includes('story_likes.json')) {
            const lks = data.story_activities_story_likes || [];
            rawStats.totalStoryLikes += lks.length;
            lks.forEach(item => {
              const u = decodeIG(item.title);
              rawStats.storyLikesMap[u] = (rawStats.storyLikesMap[u] || 0) + 1;
            });
          }

          if (path.includes('liked_posts.json')) {
            const lks = data.likes_media_likes || [];
            rawStats.totalPostLikes += lks.length;
            lks.forEach(item => {
              const u = decodeIG(item.title);
              rawStats.postLikesMap[u] = (rawStats.postLikesMap[u] || 0) + 1;
            });
          }

          if (path.includes('comments/')) {
            rawStats.totalComments += Array.isArray(data) ? data.length : 0;
          }

          if (path.includes('media/stories.json')) {
            rawStats.totalStoriesPosted += data.ig_stories?.length || 0;
          }
        } catch (e) {}
      }));

      addLog(`Analyzed ${Math.min(i + batchSize, jsonFiles.length)} blocks...`);
      await new Promise(r => setTimeout(r, 10));
    }

    addLog("Resolving user identity...");
    const myName = Object.entries(rawStats.msgFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || "User";

    let totalSent = 0;
    Object.values(rawStats.dmMap).forEach(dm => {
      dm.sent = dm.senderMap[myName] || 0;
      totalSent += dm.sent;
    });

    setStats({
      totalMessages: rawStats.totalMessages,
      totalSent: totalSent,
      time: formatTimeSpent(rawStats.totalMessages),
      topDMs: Object.entries(rawStats.dmMap).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.count - a.count).slice(0, 5),
      storyLikes: { total: rawStats.totalStoryLikes, top: getTopFromMap(rawStats.storyLikesMap) },
      postLikes: { total: rawStats.totalPostLikes, top: getTopFromMap(rawStats.postLikesMap) },
      comments: rawStats.totalComments,
      storiesPosted: rawStats.totalStoriesPosted,
      myName
    });

    addLog("Extraction complete.");
    setTimeout(() => setStep('story'), 800);
  };

  // We wrap the slides in useMemo to prevent the "toLocaleString" crash on empty stats
  const slides = useMemo(() => {
    if (!stats) return [];
    return [
      {
        content: (
          <div className="space-y-8 px-6 text-center">
            <div className="inline-block border border-emerald-500 text-emerald-500 font-mono text-[10px] px-3 py-1 uppercase tracking-[0.2em]">
              [ IDENTITY: {stats.myName} ]
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              Recap <br />
              <span className="text-emerald-500 italic">Initiated.</span>
            </h1>
            <p className="font-mono text-sm text-white/40 max-w-sm mx-auto uppercase tracking-widest leading-relaxed">
              Decryption successful. Social footprint for 2025 is now visible.
            </p>
          </div>
        )
      },
      {
        content: (
          <div className="px-10 space-y-12">
            <div>
              <p className="font-mono text-xs text-emerald-500 uppercase mb-4 tracking-widest flex items-center gap-2">
                <Activity size={14} /> Data Throughput
              </p>
              <div className="text-8xl font-black tracking-tighter italic leading-none">
                <RollingNumber value={stats.totalMessages} />
              </div>
              <p className="text-white/40 font-mono text-[10px] uppercase mt-4 tracking-[0.3em]">Total Packets Exchanged</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 backdrop-blur-xl">
              <p className="text-2xl font-bold leading-tight">You were active for <span className="text-emerald-500">{stats.time?.h}h {stats.time?.m}m</span> this year.</p>
              <p className="text-[10px] font-mono text-white/30 uppercase mt-4 italic">Estimated processing: 5.0s/msg</p>
            </div>
          </div>
        )
      },
      {
        content: (
          <div className="px-10 space-y-8">
            <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3 italic">
              <Target className="text-emerald-500" /> Top Messages
            </h2>
            <div className="space-y-4">
              {stats.topDMs?.map((dm, i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="font-mono text-white/20 text-xs">0{i+1}</span>
                  <span className="font-bold uppercase truncate flex-1 ml-4 tracking-tight">{dm.name}</span>
                  <span className="font-mono font-bold text-emerald-500">{dm.count}</span>
                </div>
              ))}
            </div>
          </div>
        )
      },
      {
        content: (
          <div className="px-10 space-y-12">
            <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10 shadow-2xl">
              <div className="bg-black p-6">
                <Heart className="text-pink-500 mb-4" size={20} />
                <div className="text-4xl font-black">{stats.postLikes?.total || 0}</div>
                <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Media Likes</p>
              </div>
              <div className="bg-black p-6">
                <Zap className="text-yellow-500 mb-4" size={20} />
                <div className="text-4xl font-black">{stats.storyLikes?.total || 0}</div>
                <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Story Likes</p>
              </div>
              <div className="bg-black p-6">
                <MessageCircle className="text-blue-500 mb-4" size={20} />
                <div className="text-4xl font-black">{stats.comments || 0}</div>
                <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Comments</p>
              </div>
              <div className="bg-black p-6">
                <Camera className="text-emerald-500 mb-4" size={20} />
                <div className="text-4xl font-black">{stats.storiesPosted || 0}</div>
                <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Stories</p>
              </div>
            </div>
            <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest leading-relaxed">
              PRIORITY INTEREST: Most story likes given to <span className="text-emerald-500 font-bold">@{stats.storyLikes?.top[0]}</span>.
            </p>
          </div>
        )
      },
      {
        content: (
          <div className="px-6 flex flex-col items-center">
            {/* 9:16 Instagram Story Card */}
            <div
              ref={shareCardRef}
              className="w-[340px] h-[644px] bg-black border border-white/20 p-8 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                   style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-12">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-500 flex items-center justify-center">
                      <Zap size={14} className="text-black fill-current" />
                    </div>
                    <span className="text-lg font-black tracking-tighter uppercase italic">iWrap // 2025</span>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <p className="text-6xl font-black tracking-tighter">{(stats.totalMessages || 0).toLocaleString()}</p>
                    <p className="text-[9px] font-mono text-emerald-500 uppercase tracking-[0.4em] mt-1">Total Interactions</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-4">
                    <div>
                      <p className="text-2xl font-black">{(stats.totalSent || 0).toLocaleString()}</p>
                      <p className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Messages Sent</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black">{stats.time?.h}H {stats.time?.m}M</p>
                      <p className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Time Invested</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black">{stats.storyLikes?.total || 0}</p>
                      <p className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Story Likes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black">{stats.storiesPosted || 0}</p>
                      <p className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Stories Posted</p>
                    </div>
                  </div>

                  <div className="pt-8">
                    <p className="text-[9px] font-mono text-white/30 uppercase tracking-[0.3em] mb-2">MVP Connection</p>
                    <p className="text-2xl font-black italic border-l-4 border-emerald-500 pl-4">{stats.topDMs[0]?.name}</p>
                    <p className="text-[8px] font-mono text-white/40 uppercase tracking-widest mt-1">with {(stats.topDMs[0]?.count || 0).toLocaleString()} messages</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-white/10 flex justify-between items-center">
                 <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Node 2.0.4 - Secure</div>
                 <div className="text-[9px] font-black italic text-emerald-500 tracking-tighter text-right leading-none">
                    iWrap <br /> <span className="text-emerald-500 font-black italic text-[17px] uppercase tracking-widest">by @axmed.bl</span>
                 </div>
              </div>
            </div>

            <button
              onClick={() => html2canvas(shareCardRef.current, { backgroundColor: '#000', scale: 3 }).then(canvas => {
                const link = document.createElement('a');
                link.download = `iWrap_2025.png`;
                link.href = canvas.toDataURL();
                link.click();
              })}
              className="mt-8 bg-emerald-500 text-black px-10 py-5 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
            >
              Export Story Protocol <Download size={14} />
            </button>
          </div>
        )
      }
    ];
  }, [stats]);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Tech Grid */}
      <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none"
           style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

      {/* Nav */}
      <nav className="relative z-50 border-b border-white/10 bg-black/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
          <Zap className="text-emerald-500 fill-current" size={20} />
          <span className="text-xl font-black tracking-tighter uppercase italic">iWrap</span>
        </div>
        <div className="text-[10px] font-mono tracking-widest uppercase opacity-50 hidden sm:block">Rasail Framework v2.0.4</div>
      </nav>

      <main className="relative z-10">
        {step === 'landing' && (
          <div className="max-w-6xl mx-auto min-h-[calc(100vh-100px)] flex flex-col justify-center p-8 lg:p-20">
            <div className="inline-block border border-emerald-500 text-emerald-500 font-mono text-[10px] px-2 py-0.5 mb-8 uppercase tracking-[0.2em]">
              [ 2025 PROTOCOL ]
            </div>
            <h1 className="text-8xl md:text-[11rem] font-black tracking-tighter leading-[0.75] uppercase mb-12">
              Deep<br />
              <span className="text-emerald-500 italic">Scan.</span>
            </h1>
            <div className="flex flex-col sm:flex-row gap-0 border border-white/20 w-fit">
              <label className="bg-emerald-500 text-black font-mono font-bold uppercase text-xs tracking-widest py-8 px-16 hover:bg-white transition-all flex items-center gap-3 cursor-pointer">
                Inject Archive <Upload size={18} />
                <input type="file" webkitdirectory="true" multiple className="hidden" onChange={handleUpload} />
              </label>
              <div className="bg-white/5 backdrop-blur-md text-white font-mono text-[10px] py-8 px-10 flex items-center gap-4 border-l border-white/20">
                <ShieldCheck className="text-emerald-500" size={18} />
                <span className="opacity-50 uppercase tracking-widest">Encrypted Local Tunnel</span>
              </div>
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="h-[80vh] flex flex-col items-center justify-center p-8">
            <div className="relative mb-12">
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-20 h-20 border border-emerald-500 border-t-transparent rounded-full" />
            </div>
            <div className="text-center space-y-4 w-full max-w-md">
              <h2 className="text-xl font-black uppercase tracking-widest">Parsing Archive Nodes</h2>
              <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded font-mono text-[10px] text-emerald-500 text-left h-40 overflow-hidden shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]">
                <div className="flex items-center gap-2 mb-2 border-b border-emerald-500/20 pb-2">
                   <Terminal size={12} /> <span>TERMINAL_LOG</span>
                </div>
                {logs.map((log, i) => (
                  <div key={i} className="opacity-80 truncate">{log}</div>
                ))}
                <div className="mt-1 animate-pulse italic text-white/20">System processing...</div>
              </div>
              <p className="text-white/20 text-[10px] uppercase tracking-[0.4em] italic pt-4">
                {funnyQuotes[Math.floor(Date.now() / 1500) % funnyQuotes.length]}
              </p>
            </div>
          </div>
        )}

        {step === 'story' && stats && (
          <div className="max-w-4xl mx-auto min-h-[85vh] flex flex-col justify-center py-10 relative px-4">
            <div className="absolute top-0 left-6 right-6 flex gap-1.5 pt-10">
              {slides.map((_, i) => (
                <div key={i} className="h-0.5 flex-1 bg-white/10 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: i <= slideIndex ? "100%" : "0%" }} className="h-full bg-emerald-500" />
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={slideIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                {slides[slideIndex]?.content}
              </motion.div>
            </AnimatePresence>

            <div className="mt-16 flex items-center justify-between">
              <div className="flex gap-8">
                {slideIndex > 0 && (
                  <button onClick={() => setSlideIndex(slideIndex - 1)} className="text-white/40 font-mono text-[10px] uppercase tracking-widest hover:text-white">Previous</button>
                )}
                {slideIndex < slides.length - 1 && (
                  <button onClick={() => setSlideIndex(slideIndex + 1)} className="bg-white text-black font-mono font-bold uppercase text-[10px] tracking-widest px-8 py-3">Next Protocol</button>
                )}
              </div>
              <div className="flex flex-col items-end opacity-40">
                <p className="text-emerald-500 font-mono text-[9px] font-black italic uppercase">@axmed.bl</p>
                <p className="text-white font-mono text-[7px] uppercase tracking-tighter">iWrap v2.0</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

