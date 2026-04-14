/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Star, Zap, ShoppingBag, Map as MapIcon, Trophy, Settings } from 'lucide-react';
import { IslandMap } from './components/IslandMap';
import { LessonPlayer } from './components/LessonPlayer';
import { ISLANDS, INITIAL_USER_STATE } from './constants';
import { UserState, Lesson } from './types';
import { cn, formatXP } from './lib/utils';
import { ReviewSession } from './components/ReviewSession';
import { SettingsModal } from './components/SettingsModal';
import { Toast } from './components/Toast';

export default function App() {
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem('limite-quest-user');
    return saved ? JSON.parse(saved) : INITIAL_USER_STATE;
  });

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'shop' | 'leaderboard'>('map');
  const [showReview, setShowReview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<{ message: string, visible: boolean }>({ message: '', visible: false });

  // Check for daily review
  useEffect(() => {
    const today = new Date().toDateString();
    if (userState.lastPlayed !== today && userState.completedLessons.length > 0) {
      setShowReview(true);
    } else if (userState.completedLessons.length === 0) {
      setToast({ message: "Bem-vindo, Aproximador! Sua missão é reconstruir a Ponte do Infinito resolvendo os mistérios dos limites. Comece pela Ilha 1!", visible: true });
    }
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setUserState(prev => {
        if (prev.hearts < 5) {
          return { ...prev, hearts: prev.hearts + 1 };
        }
        return prev;
      });
    }, 15 * 60 * 1000); // 15 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('limite-quest-user', JSON.stringify(userState));
  }, [userState]);

  const handleCompleteLesson = (xpReward: number) => {
    if (!activeLesson) return;

    setUserState(prev => {
      const isNew = !prev.completedLessons.includes(activeLesson.id);
      return {
        ...prev,
        xp: prev.xp + xpReward,
        completedLessons: [...new Set([...prev.completedLessons, activeLesson.id])],
        streak: isNew ? prev.streak + 1 : prev.streak,
        lastPlayed: new Date().toISOString(),
      };
    });
    setActiveLesson(null);
  };

  const handleLoseHeart = () => {
    setUserState(prev => ({
      ...prev,
      hearts: Math.max(0, prev.hearts - 1),
    }));
  };

  return (
    <div className="min-h-screen bg-v-bg font-sans text-v-text selection:bg-v-secondary-light flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b-2 border-v-line px-4 h-[72px] flex items-center shadow-sm">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <div className="font-black text-2xl text-v-primary hidden sm:block">LIMITE QUEST</div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-lg">
              <Heart className="w-6 h-6 text-v-danger fill-current" />
              <span className="text-v-text">{userState.hearts}</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-lg">
              <Star className="w-6 h-6 text-[#FF9600] fill-current" />
              <span className="text-v-text">{formatXP(userState.xp)}</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-lg">
              <Zap className="w-6 h-6 text-v-secondary fill-current" />
              <span className="text-v-text">{userState.streak}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 bg-slate-100 rounded-full border-2 border-v-line flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <Settings className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 max-w-5xl mx-auto w-full overflow-hidden">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex w-[280px] bg-white border-r-2 border-v-line p-6 flex-col gap-3">
          <NavButton active={activeTab === 'map'} onClick={() => setActiveTab('map')} icon={<MapIcon />} label="Trilha" />
          <NavButton active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} icon={<ShoppingBag />} label="Loja Delta" />
          <NavButton active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} icon={<Trophy />} label="Ranking" />
          
          <div className="mt-auto p-5 bg-v-accent rounded-2xl text-[#7F5A00] font-bold text-sm border-b-4 border-v-accent-dark">
            LIMITE QUEST PLUS<br/>
            <small className="font-normal">Energia infinita e temas dark.</small>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto pb-24 md:pb-8">
          <AnimatePresence mode="wait">
            {activeTab === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <IslandMap 
                  islands={ISLANDS}
                  completedLessons={userState.completedLessons}
                  unlockedIslands={userState.unlockedIslands}
                  onStartLesson={setActiveLesson}
                  onBossClick={(id) => {
                    setToast({ message: `Chefão da ${id} derrotado! Próxima ilha desbloqueada!`, visible: true });
                    const currentIndex = ISLANDS.findIndex(i => i.id === id);
                    if (currentIndex !== -1 && currentIndex < ISLANDS.length - 1) {
                      const nextIslandId = ISLANDS[currentIndex + 1].id;
                      if (!userState.unlockedIslands.includes(nextIslandId)) {
                        setUserState(prev => ({
                          ...prev,
                          unlockedIslands: [...prev.unlockedIslands, nextIslandId]
                        }));
                      }
                    }
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'shop' && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 max-w-2xl mx-auto mt-10"
              >
                <div className="v-card space-y-8">
                  <div className="text-center space-y-2">
                    <ShoppingBag className="w-20 h-20 mx-auto text-v-secondary" />
                    <h2 className="text-3xl font-black text-v-text">Loja Delta</h2>
                    <p className="text-slate-500 font-bold">Troque suas moedas por itens épicos!</p>
                  </div>

                  <div className="grid gap-4">
                    {[
                      { id: 'skin-neon', name: 'Skin Neon', price: 500, icon: '🌈', desc: 'Gráficos com brilho neon!' },
                      { id: 'dark-mode', name: 'Tema Escuro', price: 1000, icon: '🌙', desc: 'Para os Aproximadores noturnos.' },
                      { id: 'skip-boss', name: 'Pular Boss', price: 2000, icon: '🏰', desc: 'Pule o desafio final de uma ilha.' },
                    ].map(item => (
                      <div key={item.id} className="bg-white p-4 rounded-2xl border-2 border-v-line border-b-4 flex items-center gap-4">
                        <div className="w-16 h-16 bg-v-bg rounded-xl flex items-center justify-center text-3xl">{item.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-v-text text-lg">{item.name}</h4>
                          <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                        </div>
                        <button className="v-btn-primary !py-3 !px-6 !text-sm">
                          {item.price} Δ
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6 max-w-2xl mx-auto mt-10"
              >
                <div className="v-card space-y-8">
                  <div className="text-center space-y-2">
                    <Trophy className="w-20 h-20 mx-auto text-v-accent" />
                    <h2 className="text-3xl font-black text-v-text">Liga Delta</h2>
                    <p className="text-slate-500 font-bold">Os maiores Aproximadores do mundo.</p>
                  </div>

                  <div className="border-2 border-v-line rounded-2xl overflow-hidden">
                    {[
                      { name: 'Newton', xp: 15400, rank: 1, avatar: '🍎' },
                      { name: 'Leibniz', xp: 14200, rank: 2, avatar: '✍️' },
                      { name: 'Cauchy', xp: 12100, rank: 3, avatar: '📐' },
                      { name: 'Você', xp: userState.xp, rank: 42, avatar: '👤', isUser: true },
                    ].map((user, i) => (
                      <div key={i} className={cn(
                        "p-5 flex items-center gap-4 border-b-2 border-v-line last:border-0",
                        user.isUser ? "bg-v-secondary-light" : "bg-white"
                      )}>
                        <span className={cn("font-black text-xl w-8 text-center", user.rank <= 3 ? "text-v-accent" : "text-slate-400")}>{user.rank}</span>
                        <div className="w-12 h-12 bg-v-bg rounded-full flex items-center justify-center text-2xl border-2 border-v-line">{user.avatar}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-v-text text-lg">{user.name}</h4>
                          <p className="text-sm text-v-secondary font-bold">{formatXP(user.xp)} XP</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <SettingsModal 
            onClose={() => setShowSettings(false)}
            onReset={() => {
              setUserState(INITIAL_USER_STATE);
              setShowSettings(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Toast Overlay */}
      <Toast 
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-v-line px-4 py-3 z-40 flex justify-around">
        <MobileNavButton 
          active={activeTab === 'map'} 
          onClick={() => setActiveTab('map')}
          icon={<MapIcon className="w-7 h-7" />}
          label="Trilha"
        />
        <MobileNavButton 
          active={activeTab === 'shop'} 
          onClick={() => setActiveTab('shop')}
          icon={<ShoppingBag className="w-7 h-7" />}
          label="Loja"
        />
        <MobileNavButton 
          active={activeTab === 'leaderboard'} 
          onClick={() => setActiveTab('leaderboard')}
          icon={<Trophy className="w-7 h-7" />}
          label="Ranking"
        />
      </nav>

      {/* Review Overlay */}
      <AnimatePresence>
        {showReview && (
          <ReviewSession 
            questions={[]} // Stub for now
            onComplete={() => setShowReview(false)}
            onCancel={() => setShowReview(false)}
          />
        )}
      </AnimatePresence>

      {/* Lesson Overlay */}
      <AnimatePresence>
        {activeLesson && (
          <LessonPlayer 
            lesson={activeLesson}
            hearts={userState.hearts}
            onComplete={handleCompleteLesson}
            onLoseHeart={handleLoseHeart}
            onCancel={() => setActiveLesson(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "v-nav-item w-full",
        active ? "active" : "border-transparent text-slate-500 hover:bg-slate-100"
      )}
    >
      <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
      <span className="uppercase tracking-wide">{label}</span>
    </button>
  );
}

function MobileNavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all",
        active ? "text-v-secondary scale-110" : "text-slate-400 hover:text-slate-600"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
