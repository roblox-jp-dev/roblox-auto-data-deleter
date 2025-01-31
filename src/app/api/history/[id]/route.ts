import { NextResponse } from "next/server";
import { getHistoryById } from "@/lib/db";

export async function GET(
    _: Request,
    { params }: { params: { id: string } }
) {
    try {
        const historyId = (await params).id;
        
        if (!historyId) {
            return NextResponse.json(
                { error: "履歴IDが指定されていません" },
                { status: 400 }
            );
        }

        const history = await getHistoryById(historyId);

        if (!history) {
            return NextResponse.json(
                { error: "指定された履歴が見つかりません" },
                { status: 404 }
            );
        }

        return NextResponse.json(history);
    } catch (err: unknown) {
        const error = err as Error;
        console.error("History fetch error:", error);
        return NextResponse.json(
            { error: "履歴の取得に失敗しました" },
            { status: 500 }
        );
    }
}