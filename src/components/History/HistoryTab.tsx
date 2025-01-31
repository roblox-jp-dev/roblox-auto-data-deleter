import { useState, useEffect } from "react";
import { Card, Form, Pagination } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

interface HistoryTabProps {
  language: string;
}

interface History {
  id: string;
  userId: string;
  gameId: string;
  tableName: string;
  createdAt: string;
  game: {
    label: string;
  };
  rules: {
    rule: {
      label: string;
      keyPattern: string;
    };
  }[];
}

export default function HistoryTab({ language }: HistoryTabProps) {
  const [histories, setHistories] = useState<History[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchHistories();
  }, []);

  const fetchHistories = async () => {
    try {
      const response = await axios.get("/api/history");
      setHistories(response.data);
    } catch (error) {
      console.error("Failed to fetch histories:", error);
    } finally {
      setIsLoading(false);
    }
  };

    const filteredHistories = histories.filter(history => {
        const matchesUserId = userIdFilter
            ? history.userId === userIdFilter
            : true;
        const historyDate = new Date(history.createdAt);
        const matchesDateRange = (!startDate || historyDate >= startDate) &&
            (!endDate || historyDate <= endDate);
        return matchesUserId && matchesDateRange;
    });

  const totalPages = Math.ceil(filteredHistories.length / itemsPerPage);
  const paginatedHistories = filteredHistories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mb-4">
      <Card>
        <Card.Header className="py-4">
          <h2 className="text-blue-600 text-xl font-bold">
            {language === "en" ? "History" : "履歴"}
          </h2>
        </Card.Header>
        <Card.Body>
          <div className="mb-6 p-8 border border-gray-200 rounded-xl bg-white shadow-sm">
            <div className="space-y-8">
              <Form.Group>
                <Form.Label className="text-sm font-medium text-gray-700 mb-2 block">
                  {language === "en" ? "User ID" : "ユーザーID"}
                </Form.Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <Form.Control
                    type="text"
                    placeholder={language === "en" ? "Search by User ID..." : "ユーザーIDで検索..."}
                    value={userIdFilter}
                    onChange={(e) => setUserIdFilter(e.target.value)}
                    className="pl-10 w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 py-2.5"
                  />
                </div>
              </Form.Group>

              <div>
                <Form.Label className="text-sm font-medium text-gray-700 mb-2 block">
                  {language === "en" ? "Date Range" : "期間"}
                </Form.Label>
                <div className="mt-3 flex gap-6">
                  <div className="relative flex-1">
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 py-2.5"
                      placeholderText={language === "en" ? "Start date" : "開始日"}
                      isClearable
                      dateFormat="yyyy/MM/dd"
                      popperPlacement="bottom-start"
                      popperClassName="z-[100]"
                      wrapperClassName="w-full"
                    />
                  </div>
                  <div className="relative flex-1">
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate ?? undefined}
                      className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 py-2.5"
                      placeholderText={language === "en" ? "End date" : "終了日"}
                      isClearable
                      dateFormat="yyyy/MM/dd"
                      popperPlacement="bottom-start"
                      popperClassName="z-[100]"
                      wrapperClassName="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

            <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm animate-pulse">
                <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
              ))
            ) : (
              paginatedHistories.map((history) => (
              <div key={history.id} className="bg-white text-black rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="font-semibold text-lg">{history.userId}</div>
                  <div className="text-sm text-gray-600">
                  {new Date(history.createdAt).toLocaleString()}
                  </div>
                </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-700 mb-2">
                  {language === "en" ? "Game: " : "ゲーム: "}
                  {history.game.label}
                </div>
                <div className="space-y-2">
                  <div className="font-medium text-gray-700">
                    {language === "en" ? "Applied Rules:" : "適用されたルール:"}
                  </div>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {history.rules.map((historyRule, index) => {
                      const actualKey = historyRule.rule.keyPattern.replace('{playerId}', history.userId);
                      return (
                        <li key={index}>
                          {historyRule.rule.label}: {actualKey}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                </div>
              </div>
              ))
            )}
            </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} />
                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}