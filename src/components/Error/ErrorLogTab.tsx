import { useState, useEffect } from "react";
import { Card, Form, Pagination } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

interface Game {
  id: string;
  label: string;
}

interface ErrorLog {
  id: string;
  gameId: string;
  error: string;
  timestamp: string;
}

export default function ErrorLogTab() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchErrorLogs();
    fetchGames();
  }, []);

  const fetchErrorLogs = async () => {
    try {
      const response = await axios.get("/api/error");
      setLogs(response.data);
    } catch (error) {
      console.error("Failed to fetch error logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await axios.get("/api/setting/game");
      setGames(response.data);
    } catch (error) {
      console.error("Failed to fetch games:", error);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const logDate = new Date(log.timestamp);
    const matchesDateRange =
      (!startDate || logDate >= startDate) &&
      (!endDate || logDate <= endDate);
    return matchesDateRange;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mb-4">
      <Card>
        <Card.Header className="py-4">
          <h2 className="text-blue-600 text-xl font-bold">
            Log
          </h2>
        </Card.Header>
        <Card.Body>
          <div className="mb-6 p-8 border border-gray-200 rounded-xl bg-white shadow-sm">
            <div>
              <Form.Label className="text-sm font-medium text-gray-700 mb-2 block">
                Data Range
              </Form.Label>
              <div className="mt-3 flex gap-6 mb-6">
                <div className="relative flex-1">
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 py-2.5"
                    placeholderText="Start date"
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
                    placeholderText="End date"
                    isClearable
                    dateFormat="yyyy/MM/dd"
                    popperPlacement="bottom-start"
                    popperClassName="z-[100]"
                    wrapperClassName="w-full"
                  />
                </div>
              </div>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm animate-pulse"
                    >
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {paginatedLogs.map((log) => {
                      const game = games.find((g) => g.id === log.gameId);
                      return (
                        <div
                          key={log.id}
                          className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="space-y-1">
                              <div className="text-sm text-gray-900">
                                {new Date(log.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="font-medium text-gray-900 mb-2">
                              Game
                              {game?.label || "Unknown Game" }
                            </div>
                            <div className="text-sm text-gray-900 whitespace-pre-wrap break-all">
                              {log.error}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <Pagination.First
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  />
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}