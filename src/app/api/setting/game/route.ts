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
    const { id } = await request.json();
    
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "有効なIDを指定してください" },
        { status: 400 }
      );
    }

    await deleteGame(id);
    return NextResponse.json({ message: "ゲームを削除しました" });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Game deletion error:", error.message);
    return NextResponse.json(
      { error: "ゲームの削除に失敗しました" },
      { status: 500 }
    );
  }
}