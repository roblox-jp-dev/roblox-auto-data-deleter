"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { GeneralTab } from "@/components/Setting/GeneralTab";
import { DataStoreKeyCard } from "@/components/Setting/DataStoreTab";
import { GameTab } from "@/components/Setting/GameTab";
import RuleTab from "@/components/Setting/RuleTab";
import HistoryTab from "@/components/History/HistoryTab";
import ErrorLogTab from "@/components/Error/ErrorLogTab";

interface DataStoreApiKey {
  id: string;
  label: string;
  apiKey: string;
}

interface Game {
  id: string;
  label: string;
  universeId: number;
  startPlaceId: number;
  dataStoreApiKey: {
    id: string;
    label: string;
  };
}

interface Rule {
  id: string;
  gameId: string;
  label: string;
  datastoreName: string;
  datastoreType: string;
  keyPattern: string;
  scope: string;
  game: {
    label: string;
  };
}

interface PageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function Page({ searchParams }: PageProps) {
  const [language, setLanguage] = useState("ja");
  const [activeTab, setActiveTab] = useState("main");
  const [apiKeys, setApiKeys] = useState<DataStoreApiKey[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const router = useRouter();

  // initialize language from searchParams
  useEffect(() => {
    const initializeLanguage = async () => {
      const resolvedParams = await searchParams;
      const lang = Array.isArray(resolvedParams.language)
        ? resolvedParams.language[0]
        : resolvedParams.language || "ja";
      setLanguage(lang);
    };
    initializeLanguage();
  }, [searchParams]);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/setting/datastore");
      const data = await response.json();
      setApiKeys(data);
    } catch (error) {
      console.error("APIキーの取得に失敗しました:", error);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await fetch("/api/setting/game");
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error("ゲーム一覧の取得に失敗しました:", error);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await fetch("/api/setting/rule");
      const data = await response.json();
      setRules(data);
    } catch (error) {
      console.error("ルール一覧の取得に失敗しました:", error);
    }
  };

  useEffect(() => {
    fetchApiKeys();
    fetchGames();
    fetchRules();
  }, []);

  const tabs = [
    { id: "main", labelEn: "Settings", labelJa: "設定" },
    { id: "history", labelEn: "Delete History", labelJa: "削除履歴" },
    { id: "errorLog", labelEn: "Error Log", labelJa: "ログ" },
  ];

  return (
    <div className="container mx-auto p-4 bg-slate-50/50">
      <div className="flex justify-between backdrop-blur-sm bg-white/70 p-2 rounded-lg mb-4 shadow-sm">
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "px-4 py-2 rounded-md transition-all duration-200 font-medium",
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                  : "bg-white/80 text-gray-700 hover:bg-gray-50 hover:shadow-sm border border-gray-200"
              )}
            >
              {language === "en" ? tab.labelEn : tab.labelJa}
            </button>
          ))}
        </div>
        <button
          onClick={() => router.push("/logout")}
          className="px-4 py-2 rounded-md transition-all duration-200 font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:shadow-sm"
        >
          {language === "en" ? "Logout" : "ログアウト"}
        </button>
      </div>

      <div className="mt-4 space-y-6">
        {activeTab === "main" && (
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-sm">
              <GeneralTab language={language} />
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-sm">
              <DataStoreKeyCard language={language} apiKeys={apiKeys} onUpdate={fetchApiKeys} />
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-sm">
              <GameTab language={language} games={games} apiKeys={apiKeys} onUpdate={fetchGames} />
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-sm">
              <RuleTab language={language} rules={rules} games={games} onUpdate={fetchRules} />
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-sm">
            <HistoryTab language={language} />
          </div>
        )}

        {activeTab === "errorLog" && (
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-sm">
            <ErrorLogTab language={language} />
          </div>
        )}
      </div>
    </div>
  );
}