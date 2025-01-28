import { NextResponse } from "next/server";
import { createErrorLog } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { historyId, error } = await req.json();

    if (!historyId || !error) {
      return NextResponse.json(
        { error: "必要なパラメータが不足しています (historyId, error)" },
        { status: 400 }
      );
    }

    const log = await createErrorLog(historyId, error);
    return NextResponse.json({
      success: true,
      data: log
    });

  } catch (error) {
    console.error("エラーログの作成中にエラーが発生:", error);
    return NextResponse.json(
      { error: "エラーログの作成に失敗しました" },
      { status: 500 }
    );
  }
}