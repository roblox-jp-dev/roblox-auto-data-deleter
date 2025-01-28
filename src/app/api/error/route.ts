import { NextResponse } from "next/server";
import { getErrorLogs, createErrorLog } from "@/lib/db";

// エラーログの取得
export async function GET() {
  try {
    const logs = await getErrorLogs();
    return NextResponse.json(logs);
  } catch (error) {
    console.error("エラーログの取得中にエラーが発生:", error);
    return NextResponse.json(
      { error: "エラーログの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// エラーログの作成
export async function POST(req: Request) {
  try {
    const { historyId, error } = await req.json();

    if (!historyId || !error) {
      return NextResponse.json(
        { error: "必要なパラメータが不足しています" },
        { status: 400 }
      );
    }

    const log = await createErrorLog(historyId, error);
    return NextResponse.json(log);
  } catch (error) {
    console.error("エラーログの作成中にエラーが発生:", error);
    return NextResponse.json(
      { error: "エラーログの作成に失敗しました" },
      { status: 500 }
    );
  }
}