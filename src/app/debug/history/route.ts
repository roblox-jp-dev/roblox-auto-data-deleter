import { NextResponse } from "next/server";
import { createHistory } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const gameId = url.searchParams.get("gameId");
    const ruleIdsParam = url.searchParams.get("ruleIds");

    let ruleIds: string[] = [];
    try {
      ruleIds = JSON.parse(ruleIdsParam || "[]");
    } catch {
      return NextResponse.json({
        success: false,
        error: "ruleIdsの形式が正しくありません"
      }, { status: 400 });
    }

    if (!userId || !gameId || !Array.isArray(ruleIds)) {
      return NextResponse.json({
        success: false,
        error: "必要なパラメータが不足しています (userId, gameId, tableName, ruleIds[])"
      }, { status: 400 });
    }

    const history = await createHistory({
      userId,
      gameId,
      ruleIds
    });

    if (!history) {
      return NextResponse.json({
        success: false,
        error: "履歴の作成に失敗しました"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: history
    });
  } catch (err: unknown) {
    // errを文字列化してから出力
    console.error("履歴の作成中にエラーが発生:", String(err));
    return NextResponse.json({
      success: false,
      error: "履歴の作成に失敗しました"
    }, { status: 500 });
  }
}