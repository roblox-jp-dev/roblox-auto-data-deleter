import { NextResponse } from "next/server";
import { createErrorLog } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const gameId = url.searchParams.get('gameId');
    const error = url.searchParams.get('error');

    if (!gameId || !error) {
      return NextResponse.json(
        { error: "必要なパラメータが不足しています (gameId, error)" },
        { status: 400 }
      );
    }

    const log = await createErrorLog(error, gameId);
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