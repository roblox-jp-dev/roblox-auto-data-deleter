import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Key } from "lucide-react";
import { Modal, Card, Button } from "react-bootstrap";

interface SettingTabProps {
  language: string;
}

export function GeneralTab({ language }: SettingTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [authKey, setAuthKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [webhookAuthKey, setWebhookAuthKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  const fetchWebhookAuthKey = async () => {
    try {
      const response = await axios.get("/api/setting/general");
      setWebhookAuthKey(response.data.webhookAuthKey);
    } catch (error) {
      console.error("認証キーの取得に失敗:", error);
    }
  };

  useEffect(() => {
    fetchWebhookAuthKey();
    setWebhookUrl(`${window.location.origin}/webhooks/delete-request/`);
  }, []);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleSetWebhookKey = async () => {
    setIsLoading(true);
    try {
      await axios.post("/api/setting/general", {
        webhookAuthKey: authKey
      });
      await fetchWebhookAuthKey();
      setShowModal(false);
      setAuthKey("");
      toast.success(language === "en" ? "Webhook auth key set" : "Webhook認証キーを設定しました");
    } catch (error: unknown) {
      console.error("Error setting webhook key:", error);
      toast.error(language === "en" ? "Failed to set webhook auth key" : "Webhook認証キーの設定に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="mb-4">
        <Card.Header className="py-4">
          <h2 className="text-blue-600 text-2xl font-bold">
            {language === "en" ? "General Settings" : "全体設定"}
          </h2>
        </Card.Header>
        <Card.Body>
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={handleShow}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-md transition-colors duration-200 shadow flex items-center border-0"
              >
                <Key className="mr-2 h-4 w-4" />
                {language === "en" ? "Set Webhook Auth Key" : "Webhook認証キーを設定"}
              </Button>
              {webhookAuthKey ? (
                <span className="text-green-500 font-semibold">
                  {language === "en" ? "Set" : "設定済"}
                </span>
              ) : (
                <span className="text-red-500 font-semibold">
                  {language === "en" ? "Not Set" : "未設定"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">
                Webhook URL: {webhookUrl}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl);
                  const button = document.getElementById("copyButton");
                  if (button) {
                    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                    setTimeout(() => {
                      button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
                    }, 2000);
                  }
                }}
                id="copyButton"
                className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </Card.Body>
        </Card>

      <Modal show={showModal} onHide={handleClose} centered>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleClose}
          ></div>
            <div
            className="bg-white w-full max-w-md mx-4 rounded-lg shadow-2xl transform transition-all animate-modal-in modal-fade-in"
            onClick={(e) => e.stopPropagation()}
            >
            <div className="flex justify-between items-center border-b px-4 py-3">
              <h3 className="text-lg font-semibold text-gray-900">
              {language === "en" ? "Set Webhook Auth Key" : "Webhook認証キーを設定"}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-600 hover:text-gray-900 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="px-4 py-6">
              <div className="relative">
                <input
                  autoFocus
                  type="text"
                  value={authKey}
                  onChange={(e) => setAuthKey(e.target.value)}
                  className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-md text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all peer"
                  placeholder=" "
                  id="auth-key-input"
                />
                <label
                  htmlFor="auth-key-input"
                  className="absolute text-sm font-medium text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
                >
                  {language === "en" ? "Auth key" : "認証キー"}
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t px-4 py-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
              >
                {language === "en" ? "Cancel" : "キャンセル"}
              </button>
              <button
                onClick={handleSetWebhookKey}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                {isLoading
                  ? (language === "en" ? "Setting..." : "設定中...")
                  : (language === "en" ? "Set" : "設定")}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}