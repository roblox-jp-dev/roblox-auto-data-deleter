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
      { error: "Failed to retrieve game list" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { label, universeId, startPlaceId, apiKeyId } = await request.json();
    
    if (!label || !universeId || !startPlaceId || !apiKeyId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
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
      { error: "Failed to create game" },
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
        { error: "ID not specified" },
        { status: 400 }
      );
    }

    const result = await deleteGame(idStr);

    if (result.error) {
      if (result.error === "RULE_EXISTS") {
        return NextResponse.json(
          { error: "Cannot delete game because rules exist" },
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
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
