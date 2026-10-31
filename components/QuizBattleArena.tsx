"use client";

import React, { useState, useEffect } from "react";
import { QuizStartResponse, QuizSubmitResponse, apiFetch } from "@/lib/api";
import { Swords, Clock, CheckCircle2, XCircle, RotateCcw, Award, BookOpen, AlertCircle } from "lucide-react";

export const QuizBattleArena: React.FC = () => {
  const [battle, setBattle] = useState<QuizStartResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [battleState, setBattleState] = useState<"lobby" | "active" | "submitting" | "scorecard">("lobby");
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (battleState === "active" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [battleState, timeLeft]);

  const handleStartBattle = async () => {
    setError(null);
    try {
      const res = await apiFetch<QuizStartResponse>("/api/quiz/start", {
        method: "POST",
        body: JSON.stringify({ subject_id: 1 }),
      });
      setBattle(res);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setTimeLeft(res.time_limit_seconds || 60);
      setBattleState("active");
    } catch (err: any) {
      setError(err.message || "Failed to start quiz battle. Check daily limits.");
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!battle) return;
    const currentQ = battle.questions[currentIndex];
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));

    // Auto-advance to next question or submit if last
    if (currentIndex < battle.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleAutoSubmit = async () => {
    if (!battle || battleState !== "active") return;
    setBattleState("submitting");

    const submissionPayload = battle.questions.map((q) => ({
      question_id: q.id,
      selected_option: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
    }));

    try {
      const timeTaken = (battle.time_limit_seconds || 60) - timeLeft;
      const res = await apiFetch<QuizSubmitResponse>("/api/quiz/submit", {
        method: "POST",
        body: JSON.stringify({
          battle_id: battle.battle_id,
          answers: submissionPayload,
          time_taken_seconds: timeTaken > 0 ? timeTaken : 60,
        }),
      });
      setResult(res);
      setBattleState("scorecard");
    } catch (err: any) {
      setError(err.message || "Failed to submit battle.");
      setBattleState("lobby");
    }
  };

  if (battleState === "lobby") {
    return (
      <div className="flex flex-col h-full bg-slate-950 p-6 items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20 mb-4 animate-bounce">
          <Swords className="w-9 h-9 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Solo Quiz Battle Arena</h2>
        <p className="text-xs text-slate-400 max-w-xs mb-6">
          10 Multiple-Choice Questions strictly extracted from your <span className="text-sky-400 font-semibold">CS101</span> lecture notes. 60-second score attack!
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2 max-w-xs text-left">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 w-full max-w-xs text-xs text-slate-300 space-y-2 mb-6 text-left">
          <div className="flex justify-between">
            <span className="text-slate-400">Target Subject:</span>
            <span className="text-sky-300 font-semibold">CS101 (Data Structures)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Questions:</span>
            <span className="font-semibold text-white">10 MCQs</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Time Limit:</span>
            <span className="font-semibold text-amber-300">60 Seconds</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Daily Limit:</span>
            <span className="font-semibold text-emerald-400">Max 3 Battles / Day</span>
          </div>
        </div>

        <button
          onClick={handleStartBattle}
          className="w-full max-w-xs py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-rose-500/25 transition-all flex items-center justify-center gap-2"
        >
          <Swords className="w-5 h-5" />
          <span>Launch Solo Battle</span>
        </button>
      </div>
    );
  }

  if (battleState === "active" && battle) {
    const currentQ = battle.questions[currentIndex];
    const isAnswered = selectedAnswers[currentQ.id] !== undefined;

    return (
      <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-4">
        {/* Battle Top Bar */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-white font-bold">{currentIndex + 1}</span> / 10
          </div>
          <div className={`flex items-center gap-1 text-xs font-mono font-bold px-3 py-1 rounded-full ${
            timeLeft <= 15 ? "bg-red-950 text-red-400 animate-pulse border border-red-800" : "bg-slate-800 text-amber-300"
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md mb-4">
            <div className="flex items-center gap-1.5 text-[10px] text-sky-400 font-semibold uppercase tracking-wider mb-2">
              <BookOpen className="w-3 h-3" />
              Sourced from: {currentQ.source_citation}
            </div>
            <h3 className="text-sm font-semibold text-white leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentQ.id] === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-3.5 rounded-xl text-xs font-medium transition-all flex items-center gap-3 border ${
                    isSelected
                      ? "bg-sky-950/80 border-sky-500 text-sky-200 shadow-md shadow-sky-500/20"
                      : "bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    isSelected ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400"
                  }`}>
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="flex-1">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center mt-2">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            className="text-xs text-slate-400 hover:text-white disabled:opacity-30"
          >
            ← Previous
          </button>

          {currentIndex === battle.questions.length - 1 ? (
            <button
              onClick={handleAutoSubmit}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              Submit Score
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    );
  }

  // Scorecard View
  if (battleState === "scorecard" && result) {
    return (
      <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-4 overflow-y-auto">
        <div className="text-center py-4 border-b border-slate-800">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 shadow-lg shadow-amber-500/20 mb-2">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Battle Finished!</h2>
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400 my-1">
            {result.score} / {result.total}
          </div>
          <p className="text-xs text-slate-400">
            Accuracy: <span className="text-emerald-400 font-semibold">{result.accuracy_percentage}%</span> • Time: <span className="text-amber-300 font-mono font-medium">{result.time_taken_seconds}s</span>
          </p>
        </div>

        {/* Question Review List */}
        <div className="py-4 space-y-3 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Battle Review:</p>
          {result.review.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                item.is_correct
                  ? "bg-emerald-950/20 border-emerald-800/40"
                  : "bg-rose-950/20 border-rose-800/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-slate-200">
                  {idx + 1}. {item.question}
                </span>
                {item.is_correct ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
              </div>
              <p className="text-slate-400 text-[11px]">
                Explanation: {item.explanation}
              </p>
              <p className="text-sky-400 text-[10px] flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {item.source_citation}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setBattleState("lobby")}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shrink-0 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Return to Arena Lobby</span>
        </button>
      </div>
    );
  }

  return null;
};
