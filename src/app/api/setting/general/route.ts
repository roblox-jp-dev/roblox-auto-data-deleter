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
      { error: "Failed to retrieve settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { webhookAuthKey } = await request.json();
    
    if (typeof webhookAuthKey !== "string") {
      return NextResponse.json(
        { error: "webhookAuthKey must be a string" },
        { status: 400 }
      );
    }

    const updatedSettings = await updateGlobalSettings(webhookAuthKey);
    return NextResponse.json(updatedSettings);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Settings update error:", error.message);
    return NextResponse.json(
      { error: "Failed to update settings" },
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