import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, Button } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import axios from "axios";
import { toast } from "react-toastify";

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

interface RuleTabProps {
  language: string;
  onUpdate: () => void;
}

export default function RuleTab({ language, onUpdate }: RuleTabProps) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [games, setGames] = useState<Array<{ id: string; label: string }>>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    gameId: "",
    label: "",
    datastoreName: "",
    datastoreType: "standard",
    keyPattern: "",
    scope: ""
  });

    const fetchRules = async () => {
        try {
            const response = await axios.get("/api/setting/rule");
            setRules(response.data);
        } catch (error) {
            console.error("ルール一覧の取得に失敗しました:", error);
            setRules([]);
        }
    };

  const fetchGames = async () => {
    try {
      const response = await axios.get("/api/setting/game");
      setGames(response.data);
    } catch (error) {
      console.error("ゲーム一覧の取得に失敗しました:", error);
      setGames([]);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchGames();
      await fetchRules();
      setIsInitialLoading(false);
    };
    initialize();
  }, []);

    const handleAdd = async () => {
        setIsLoading(true);
        try {
            await axios.post("/api/setting/rule", formData);
            setShowModal(false);
            setFormData({
                gameId: "",
                label: "",
                datastoreName: "",
                datastoreType: "standard",
                keyPattern: "",
                scope: ""
            });
            await fetchRules();
            onUpdate();
            toast.success(language === "en" ? "Rule added" : "ルールを追加しました");
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                alert(error.response.data.error);
            } else {
                alert(language === "en" ? "Failed to add rule" : "ルールの追加に失敗しました");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedRule) return;
        setIsLoading(true);
        try {
            await axios.delete("/api/setting/rule", {
                data: { id: selectedRule }
            });
            setShowDeleteModal(false);
            await fetchRules();
            onUpdate();
            toast.success(language === "en" ? "Rule deleted" : "ルールを削除しました");
        } catch (error) {
            console.error(error);
            alert(language === "en" ? "Failed to delete rule" : "ルールの削除に失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <div className="mb-4">
      <Card>
        <Card.Header className="py-4">
          <h2 className="text-blue-600 text-xl font-bold">
            {language === "en" ? "Rules" : "ルール"}
          </h2>
        </Card.Header>
        <Card.Body>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors duration-200 border-0 mb-6 flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            {language === "en" ? "Add Rule" : "ルールを追加"}
          </Button>

          <div className="space-y-4">
            {isInitialLoading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="h-10 w-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : (
              rules.map((rule) => (
                <div key={rule.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{rule.label}</h3>
                        <p className="text-blue-600 text-sm">{rule.game.label}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">
                            {language === "en" ? "Datastore" : "データストア"}
                          </p>
                          <p className="text-sm text-gray-900">{rule.datastoreName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            {language === "en" ? "Type" : "タイプ"}
                          </p>
                          <p className="text-sm text-gray-900">
                            {rule.datastoreType === "standard" 
                              ? (language === "en" ? "Standard" : "標準")
                              : (language === "en" ? "Ordered" : "順序付き")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            {language === "en" ? "Key Pattern" : "キーパターン"}
                          </p>
                          <p className="text-sm text-gray-900 font-mono">{rule.keyPattern}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            {language === "en" ? "Scope" : "スコープ"}
                          </p>
                          <p className="text-sm text-gray-900">{rule.scope}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setSelectedRule(rule.id);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowModal(false)}>
          </div>
          <div className="bg-white w-full max-w-md mx-4 rounded-lg shadow-2xl transform transition-all animate-modal-in modal-fade-in">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {language === "en" ? "Add Rule" : "ルールを追加"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="relative">
                <select
                  autoFocus
                  value={formData.gameId}
                  onChange={(e) => setFormData({ ...formData, gameId: e.target.value })}
                  className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-md text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all peer"
                  id="game-select"
                >
                  <option value="">{language === "en" ? "Select Game" : "ゲームを選択"}</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>{game.label}</option>
                  ))}
                </select>
                <label
                  htmlFor="game-select"
                  className="absolute text-sm font-medium text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
                >
                  {language === "en" ? "Game" : "ゲーム"}
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-md text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all peer"
                  placeholder=" "
                  id="label-input"
                />
                <label
                  htmlFor="label-input"
                  className="absolute text-sm font-medium text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
                >
                  {language === "en" ? "Label" : "ラベル"}
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={formData.datastoreName}
                  onChange={(e) => setFormData({ ...formData, datastoreName: e.target.value })}
                  className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-md text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all peer"
                  placeholder=" "
                  id="datastore-name-input"
                />
                <label
                  htmlFor="datastore-name-input"
                  className="absolute text-sm font-medium text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
                >
                  {language === "en" ? "Datastore Name" : "データストア名"}
                </label>
              </div>

              <div className="relative">
                <select
                  value={formData.datastoreType}
                  onChange={(e) => setFormData({ ...formData, datastoreType: e.target.value })}
                  className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-md text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all peer"
                  id="datastore-type-select"
                >
                  <option value="standard">{language === "en" ? "Standard" : "通常データストア"}</option>
                  <option value="ordered">{language === "en" ? "Ordered" : "並び替え済みデータストア"}</option>
                </select>
                <label
                  htmlFor="datastore-type-select"
                  className="absolute text-sm font-medium text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
                >
                  {language === "en" ? "Type" : "タイプ"}
                </label>
              </div>

              <div className="relative">
                <Tippy
                  content={language === "en"
                    ? "Replace the player ID in the key with {playerId}"
                    : "キーにあるプレイヤーIDの部分を{playerId}に置き変えてください"
                  }
                  placement="top"
                  trigger="mouseenter focus">
                  <input
                    type="text"
                    value={formData.keyPattern}
                    onChange={(e) => setFormData({ ...formData, keyPattern: e.target.value })}
                    className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-md text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all peer"
                    placeholder=" "
                    id="key-pattern-input"
                  />
                </Tippy>
                <label
                  htmlFor="key-pattern-input"
                  className="absolute text-sm font-medium text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
                >
                  {language === "en" ? "Key Pattern" : "キーパターン"}
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-md text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all peer"
                  placeholder=" "
                  id="scope-input"
                />
                <label
                  htmlFor="scope-input"
                  className="absolute text-sm font-medium text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
                >
                  {language === "en" ? "Scope" : "スコープ"}
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
              >
                {language === "en" ? "Cancel" : "キャンセル"}
              </button>
              <button
                onClick={handleAdd}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                {isLoading 
                  ? (language === "en" ? "Adding..." : "追加中...")
                  : (language === "en" ? "Add" : "追加")}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowDeleteModal(false)}>
          </div>
          <div className="bg-white w-full max-w-md mx-4 rounded-lg shadow-2xl transform transition-all animate-modal-in">
            <div className="px-6 py-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {language === "en" ? "Delete Rule" : "ルールを削除"}
              </h3>
              <p className="text-gray-600">
                {language === "en" 
                  ? "Are you sure you want to delete this rule?" 
                  : "このルールを削除してもよろしいですか？"}
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
              >
                {language === "en" ? "Cancel" : "キャンセル"}
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                {isLoading 
                  ? (language === "en" ? "Deleting..." : "削除中...")
                  : (language === "en" ? "Delete" : "削除")}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}