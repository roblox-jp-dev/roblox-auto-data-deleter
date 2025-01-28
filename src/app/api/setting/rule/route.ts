import { NextResponse } from "next/server";
import { getRules, createRule, deleteRule } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const gameId = searchParams.get("gameId");

        const rules = await getRules(gameId || "");
        return NextResponse.json(rules);
    } catch (err: unknown) {
        const error = err as Error;
        console.error("Rules fetch error:", error);
        return NextResponse.json(
            { error: "ルール一覧の取得に失敗しました" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        const { gameId, label, datastoreName, datastoreType, keyPattern, scope } = data;
        
        // より詳細なバリデーション
        const validationErrors = [];
        if (!gameId) validationErrors.push("gameId");
        if (!label) validationErrors.push("label");
        if (!datastoreName) validationErrors.push("datastoreName");
        if (!datastoreType) validationErrors.push("datastoreType");
        if (!keyPattern) validationErrors.push("keyPattern");
        if (!scope) validationErrors.push("scope");

        if (validationErrors.length > 0) {
            return NextResponse.json(
                { 
                    error: "必須パラメータが不足しています",
                    missing: validationErrors
                },
                { status: 400 }
            );
        }

        const rule = await createRule({
            gameId,
            label,
            datastoreName,
            datastoreType,
            keyPattern,
            scope
        });
        return NextResponse.json(rule);
    } catch (err: unknown) {
        const error = err as Error;
        console.error("Rule creation error:", error);
        return NextResponse.json(
            { error: "ルールの作成に失敗しました" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const data = await request.json();

        if (!data.id) {
            return NextResponse.json(
                { error: "IDが指定されていません" },
                { status: 400 }
            );
        }

        await deleteRule(data.id);
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const error = err as Error;
        console.error("Rule deletion error:", error);
        return NextResponse.json(
            { error: "ルールの削除に失敗しました" },
            { status: 500 }
        );
    }
}