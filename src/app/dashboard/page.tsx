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

export default function Page() {
  const [activeTab, setActiveTab] = useState("main");
  const [apiKeys, setApiKeys] = useState<DataStoreApiKey[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const router = useRouter();

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/setting/datastore");
      const data = await response.json();
      setApiKeys(data);
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await fetch("/api/setting/game");
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error("Failed to fetch games list:", error);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await fetch("/api/setting/rule");
      const data = await response.json();
      setRules(data);
    } catch (error) {
      console.error("Failed to fetch rules list:", error);
    }
  };

  useEffect(() => {
    fetchApiKeys();
    fetchGames();
    fetchRules();
  }, []);

  const tabs = [
    { id: "main", label: "Settings"},
    { id: "history", label: "Delete History"},
    { id: "errorLog", label: "Error Log"},
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
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => router.push("/logout")}
          className="px-4 py-2 rounded-md transition-all duration-200 font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:shadow-sm"
        >
          Logout
        </button>
      </div>

      <div className="mt-4 space-y-6">
        {activeTab === "main" && (
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-sm">
              <GeneralTab/>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-sm">
              <DataStoreKeyCard apiKeys={apiKeys} onUpdate={fetchApiKeys} />
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-sm">
              <GameTab games={games} apiKeys={apiKeys} onUpdate={fetchGames} />
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-sm">
              <RuleTab rules={rules} games={games} onUpdate={fetchRules} />
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-sm">
            <HistoryTab/>
          </div>
        )}

        {activeTab === "errorLog" && (
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-sm">
            <ErrorLogTab/>
          </div>
        )}
      </div>
    </div>
  );
}