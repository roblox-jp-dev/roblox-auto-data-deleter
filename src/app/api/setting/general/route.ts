import { NextResponse } from "next/server";
import { getGlobalSettings, updateGlobalSettings } from "@/lib/db";

export async function GET() {
  try {
    let settings = await getGlobalSettings();
    if (!settings) {
      settings = await updateGlobalSettings("");
    }
    return NextResponse.json(settings);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Settings fetch error:", error.message);
    return NextResponse.json(
      { error: "設定の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { webhookAuthKey } = await request.json();
    
    if (typeof webhookAuthKey !== "string") {
      return NextResponse.json(
        { error: "webhookAuthKeyは文字列である必要があります" },
        { status: 400 }
      );
    }

    const updatedSettings = await updateGlobalSettings(webhookAuthKey);
    return NextResponse.json(updatedSettings);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Settings update error:", error.message);
    return NextResponse.json(
      { error: "設定の更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const updatedSettings = await updateGlobalSettings("");
    return NextResponse.json(updatedSettings);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Settings delete error:", error.message);
    return NextResponse.json(
      { error: "Failed to delete settings" },
      { status: 500 }
    );
  }
}