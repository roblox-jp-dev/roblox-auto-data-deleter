import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import axios from "axios";
import { toast } from "react-toastify";

interface Rule {
  id: string;
  gameId: string;
  label: string;
  datastoreName: string;
  datastoreType: string;
  keyPattern: string;
  scope?: string;
  game: {
    label: string;
  };
}

interface RuleTabProps {
  rules: Rule[];
  games: Array<{ id: string; label: string }>;
  onUpdate: () => void;
}

export default function RuleTab({ rules, games, onUpdate }: RuleTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    gameId: "",
    label: "",
    datastoreName: "",
    datastoreType: "standard",
    keyPattern: "",
    scope: ""
  });

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
      onUpdate();
      toast.success("Rule added");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMsg =
          error.response.data.message || error.response.data.error ||
          "Failed to add rule";
        toast.error(errorMsg);
      } else {
        toast.error("Failed to add rule");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRule) return;
    setIsLoading(true);
    try {
      await axios.delete("/api/setting/rule", { data: { id: selectedRule } });
      setShowDeleteModal(false);
      onUpdate();
      toast.success("Rule deleted");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMsg =
          error.response.data.message || error.response.data.error ||
          "Failed to delete rule";
        toast.error(errorMsg);
      } else {
        toast.error("Failed to delete rule");
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
            Rules
          </h2>
        </Card.Header>
        <Card.Body>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors duration-200 border-0 mb-6 flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>

          <div className="space-y-4">
            {rules.map((rule) => (
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
                          Datastore
                        </p>
                        <p className="text-sm text-gray-900">{rule.datastoreName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Type
                        </p>
                        <p className="text-sm text-gray-900">
                          {rule.datastoreType === "standard" ? "Standard" : "Ordered"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Key Pattern
                        </p>
                        <p className="text-sm text-gray-900 font-mono">{rule.keyPattern}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Scope
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
            ))}
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowModal(false)}
          ></div>
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md mx-4 rounded-lg shadow-2xl transform transition-all animate-modal-in modal-fade-in"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Add Rule
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="relative">
                <select
                  autoFocus
                  value={formData.gameId}
                  onChange={(e) =>
                    setFormData({ ...formData, gameId: e.target.value })
                  }
                  className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-md text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all peer"
                  id="game-select"
                >
                  <option value="">Select Game</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.label}
                    </option>
                  ))}
                </select>
                <label
                  htmlFor="game-select"
                  className="absolute text-sm font-medium text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
                >
                  Game
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-md text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all peer"
                  placeholder=" "
                  id="label-input"
                />
                <label
                  htmlFor="label-input"
                  className="absolute text-sm font-medium text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
                >
                  Label
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={formData.datastoreName}
                  onChange={(e) =>
                    setFormData({ ...formData, datastoreName: e.target.value })
                  }
                  className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-md text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all peer"
                  placeholder=" "
                  id="datastore-name-input"
                />
                <label
                  htmlFor="datastore-name-input"
                  className="absolute text-sm font-medium text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
                >
                  Datastore Name
                </label>
              </div>

              <div className="relative">
                <select
                  value={formData.datastoreType}
                  onChange={(e) =>
                    setFormData({ ...formData, datastoreType: e.target.value })
                  }
                  className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-md text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all peer"
                  id="datastore-type-select"
                >
                  <option value="standard">
                    Standard
                  </option>
                  <option value="ordered">
                    Ordered
                  </option>
                </select>
                <label
                  htmlFor="datastore-type-select"
                  className="absolute text-sm font-medium text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
                >
                  Type
                </label>
              </div>

              <div className="relative">
                <Tippy
                  content="Replace the player ID in the key with {playerId}"
                  placement="top"
                  trigger="mouseenter focus"
                >
                  <input
                    type="text"
                    value={formData.keyPattern}
                    onChange={(e) =>
                      setFormData({ ...formData, keyPattern: e.target.value })
                    }
                    className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-md text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all peer"
                    placeholder=" "
                    id="key-pattern-input"
                  />
                </Tippy>
                <label
                  htmlFor="key-pattern-input"
                  className="absolute text-sm font-medium text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
                >
                  Key Pattern
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={formData.scope}
                  onChange={(e) =>
                    setFormData({ ...formData, scope: e.target.value })
                  }
                  className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-md text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all peer"
                  placeholder=" "
                  id="scope-input"
                />
                <label
                  htmlFor="scope-input"
                  className="absolute text-sm font-medium text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
                >
                  Scope
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                {isLoading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md mx-4 rounded-lg shadow-2xl transform transition-all animate-modal-in modal-fade-in"
          >
            <div className="px-6 py-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Delete Rule
              </h3>
              <p className="text-gray-600">
                Are you sure you want to delete this rule?
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
