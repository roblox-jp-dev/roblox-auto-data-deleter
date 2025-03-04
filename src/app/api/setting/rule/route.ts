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
            { error: "Failed to retrieve rules list" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        const { gameId, label, datastoreName, datastoreType, keyPattern, scope } = data;

        const validationErrors = [];
        if (!gameId) validationErrors.push("gameId");
        if (!label) validationErrors.push("label");
        if (!datastoreName) validationErrors.push("datastoreName");
        if (!datastoreType) validationErrors.push("datastoreType");
        if (!keyPattern) validationErrors.push("keyPattern");

        if (validationErrors.length > 0) {
            return NextResponse.json(
                {
                    error: "Required parameters are missing",
                    missing: validationErrors
                },
                { status: 400 }
            );
        }

        const normalizedScope = !scope || scope.trim() === "" ? "global" : scope;

        const rule = await createRule({
            gameId,
            label,
            datastoreName,
            datastoreType,
            keyPattern,
            scope: normalizedScope
        });
        return NextResponse.json(rule);
    } catch (err: unknown) {
        const error = err as Error;
        console.error("Rule creation error:", error);
        return NextResponse.json(
            { error: "Failed to create rule" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const data = await request.json();

        if (!data.id) {
            return NextResponse.json(
                { error: "ID is not specified" },
                { status: 400 }
            );
        }

        await deleteRule(data.id);
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const error = err as Error;
        console.error("Rule deletion error:", error);
        return NextResponse.json(
            { error: "Failed to delete rule" },
            { status: 500 }
        );
    }
}