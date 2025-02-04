import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, Button, Modal } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

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

interface GameTabProps {
  language: string;
  games: Game[];
  apiKeys: Array<{
    id: string;
    label: string;
  }>;
  onUpdate: () => void;
}

export function GameTab({ language, games, apiKeys, onUpdate }: GameTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    universeId: "",
    startPlaceId: "",
    apiKeyId: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    setIsInitialLoading(false);
  }, [games]);

  const handleAdd = async () => {
    setIsLoading(true);
    try {
      await axios.post("/api/setting/game", {
        ...formData,
        universeId: parseInt(formData.universeId),
        startPlaceId: parseInt(formData.startPlaceId)
      });
      setShowModal(false);
      setFormData({ label: "", universeId: "", startPlaceId: "", apiKeyId: "" });
      onUpdate();
      toast.success(language === "en" ? "Game added" : "ゲームが追加されました");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        alert(error.response.data.error);
      } else {
        alert(language === "en" ? "Failed to add game" : "ゲームの追加に失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
      if (!selectedGame) return;
      setIsLoading(true);
      try {
        await axios.delete(`/api/setting/game?id=${selectedGame}`);
        setShowDeleteModal(false);
        onUpdate();
        toast.success(language === "en" ? "Game deleted" : "ゲームが削除されました");
      } catch (error: unknown) {
        console.error(error);
        if (axios.isAxiosError(error) && error.response) {
          alert(error.response.data.error);
        } else {
          alert(language === "en" ? "Failed to delete game" : "ゲームの削除に失敗しました");
        }
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className="mb-4">
      <Card>
        <Card.Header className="py-4">
          <h2 className="text-blue-600 text-xl font-bold">
            {language === "en" ? "Games" : "ゲーム"}
          </h2>
        </Card.Header>
        <Card.Body>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors duration-200 border-0 mb-6 flex items-center"
            disabled={isInitialLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            {language === "en" ? "Add Game" : "ゲームを追加"}
          </Button>

          <div className="space-y-4">
            {isInitialLoading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="bg-blue-50 rounded-xl p-5 border border-blue-100 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : (
              games.map((game) => (
                <div key={game.id} className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {game.label}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {language === "en" ? "Universe ID: " : "ユニバースID: "}{game.universeId}
                      </div>
                      <div className="text-sm text-gray-600">
                        {language === "en" ? "Start Place ID: " : "開始プレースID: "}{game.startPlaceId}
                      </div>
                      <div className="text-sm text-gray-600">
                        {language === "en" ? "API Key: " : "APIキー: "}{game.dataStoreApiKey.label}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedGame(game.id);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card.Body>
      </Card>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setShowModal(false)}
          ></div>
          <div
        className="bg-white w-full max-w-md mx-4 rounded-lg shadow-2xl transform transition-all animate-modal-in modal-fade-in"
        onClick={(e) => e.stopPropagation()}
          >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {language === "en" ? "Add Game" : "ゲームを追加"}
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="relative">
            <input
          autoFocus
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
          type="number"
          value={formData.universeId}
          onChange={(e) => setFormData({ ...formData, universeId: e.target.value })}
          className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-md text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all peer"
          placeholder=" "
          id="universe-id-input"
            />
            <label
          htmlFor="universe-id-input"
          className="absolute text-sm font-medium text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
            >
          {language === "en" ? "Universe ID" : "ユニバースID"}
            </label>
          </div>
          <div className="relative">
            <input
          type="number"
          value={formData.startPlaceId}
          onChange={(e) => setFormData({ ...formData, startPlaceId: e.target.value })}
          className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-md text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all peer"
          placeholder=" "
          id="start-place-id-input"
            />
            <label
          htmlFor="start-place-id-input"
          className="absolute text-sm font-medium text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
            >
          {language === "en" ? "Start Place ID" : "開始プレースID"}
            </label>
          </div>
          <div className="relative">
            <select
          value={formData.apiKeyId}
          onChange={(e) => setFormData({ ...formData, apiKeyId: e.target.value })}
          className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-md text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all peer"
          id="api-key-input"
            >
          <option value="">
            {language === "en" ? "Select API Key" : "APIキーを選択"}
          </option>
          {apiKeys.map((key) => (
            <option key={key.id} value={key.id}>
              {key.label}
            </option>
          ))}
            </select>
            <label
          htmlFor="api-key-input"
          className="absolute text-sm font-medium text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
            >
          {language === "en" ? "API Key" : "APIキー"}
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
      
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setShowDeleteModal(false)}
          ></div>
          <div
        className="bg-white w-full max-w-md mx-4 rounded-lg shadow-2xl transform transition-all animate-modal-in modal-fade-in"
        onClick={(e) => e.stopPropagation()}
          >
        <div className="px-6 py-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {language === "en" ? "Delete Game" : "ゲームを削除"}
          </h3>
          <p className="text-gray-600">
            {language === "en" 
          ? "Are you sure you want to delete this game?\nIf you delete this game, the rules that use this game will also be deleted\nThis operation cannot be undone" 
          : "このゲームを削除してもよろしいですか？\nこの操作は取り消せません"}
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