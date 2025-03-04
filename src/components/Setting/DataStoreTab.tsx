import { useState, useEffect } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { Card, Button, Modal } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

interface DataStoreKeyCardProps {
  apiKeys: Array<{
    id: string;
    label: string;
    apiKey: string;
  }>;
  onUpdate: () => void;
}

export function DataStoreKeyCard({ apiKeys, onUpdate }: DataStoreKeyCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({ label: "", apiKey: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    setIsInitialLoading(false);
  }, [apiKeys]);
  
  const handleAdd = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/setting/datastore", formData);
      if (response.status === 200) {
        setShowModal(false);
        setFormData({ label: "", apiKey: "" });
        onUpdate();
        toast.success("API key added");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMsg =
          error.response.data.message || error.response.data.error || 
          "Failed to add API key";
        toast.error(errorMsg);
      } else {
        toast.error("Failed to add API key");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedKey) return;
    setIsLoading(true);
    try {
      await axios.delete(`/api/setting/datastore?id=${selectedKey}`);
      setShowDeleteModal(false);
      onUpdate();
      toast.success("API key deleted");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to delete API key");
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
            DataStore API Keys
          </h2>
        </Card.Header>
        <Card.Body>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors duration-200 border-0 mb-6 flex items-center"
            disabled={isInitialLoading}
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Add API Key
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isInitialLoading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-5 border border-gray-100 animate-pulse"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))
            ) : (
              apiKeys.map((key) => (
                <div key={key.id} className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-blue-700">{key.label}</h3>
                    <button
                      onClick={() => {
                        setSelectedKey(key.id);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-gray-700 flex items-center">
                    <span className="font-medium">API Key:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded ml-2">
                      ••••••••
                    </span>
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
            onClick={() => setShowModal(false)}
          ></div>
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md mx-4 rounded-lg shadow-2xl transform transition-all animate-modal-in modal-fade-in"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Add API Key
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="relative">
              <input
                autoFocus
                type="text"
                required
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
                Label
              </label>
              </div>
              <div className="relative">
              <input
                type="password"
                autoComplete="new-password"
                required
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-md text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all peer"
                placeholder=" "
                id="apikey-input"
              />
              <label
                htmlFor="apikey-input"
                className="absolute text-sm font-medium text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
              >
                API Key
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
                {isLoading
                  ? "Adding..."
                  : "Add"}
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
          <div className="bg-white w-full max-w-md mx-4 rounded-lg shadow-2xl transform transition-all animate-modal-in modal-fade-in">
            <div className="px-6 py-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Delete API Key
              </h3>
              <p className="text-gray-600">
                Are you sure you want to delete this API key?\nIf you delete it, the game and rules using it will also be deleted\nThis operation cannot be undone
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
                {isLoading
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
