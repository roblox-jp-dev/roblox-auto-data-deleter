import { NextResponse } from "next/server";
import { getGames, createGame, deleteGame } from "@/lib/db";

export async function GET() {
  try {
    const games = await getGames();
    return NextResponse.json(games);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Games fetch error:", error.message);
    return NextResponse.json(
      { error: "ゲーム一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { label, universeId, startPlaceId, apiKeyId } = await request.json();
    
    if (!label || !universeId || !startPlaceId || !apiKeyId) {
      return NextResponse.json(
        { error: "必須パラメータが不足しています" },
        { status: 400 }
      );
    }

    const newGame = await createGame({
      label,
      universeId,
      startPlaceId,
      apiKeyId
    });
    return NextResponse.json(newGame);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Game creation error:", error.message);
    return NextResponse.json(
      { error: "ゲームの作成に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const idStr = url.searchParams.get("id");

    if (!idStr) {
      return NextResponse.json(
        { error: "IDが指定されていません" },
        { status: 400 }
      );
    }

    const result = await deleteGame(idStr);

    if (result.error) {
      if (result.error === "RULE_EXISTS") {
        return NextResponse.json(
          { error: "ルールが存在しているためゲームを削除できません" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "エラーが発生しました";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
