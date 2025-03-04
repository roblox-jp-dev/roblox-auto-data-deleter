import { NextResponse } from "next/server";
import { createHistory, getHistories, getHistoriesByUserId, getHistoryRules } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const gameId = searchParams.get("gameId");
        const historyId = searchParams.get("historyId");

        if (historyId) {
            const historyRules = await getHistoryRules(historyId);
            return NextResponse.json(historyRules);
        }

        if (userId) {
            const histories = await getHistoriesByUserId(userId);
            return NextResponse.json(histories);
        }

        const histories = await getHistories(gameId || undefined);
        return NextResponse.json(histories);
    } catch (err: unknown) {
        const error = err as Error;
        console.error("History fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch history" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { userId, gameId, ruleIds } = data;

        if (!userId || !gameId || !ruleIds || !Array.isArray(ruleIds)) {
            return NextResponse.json(
                { error: "Required parameters are missing" },
                { status: 400 }
            );
        }

        const history = await createHistory({
            userId,
            gameId,
            ruleIds
        });

        return NextResponse.json(history);
    } catch (err: unknown) {
        const error = err as Error;
        console.error("History creation error:", error);
        return NextResponse.json(
            { error: "Failed to create history" },
            { status: 500 }
        );
    }
}