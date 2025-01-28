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
            { error: "履歴の取得に失敗しました" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { userId, gameId, ruleIds } = data;

        // バリデーション
        if (!userId || !gameId || !ruleIds || !Array.isArray(ruleIds)) {
            return NextResponse.json(
                { error: "必須パラメータが不足しています" },
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
            { error: "履歴の作成に失敗しました" },
            { status: 500 }
        );
    }
}