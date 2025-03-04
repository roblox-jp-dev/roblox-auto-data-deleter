import { NextResponse } from "next/server";
import { getErrorLogs, createErrorLog } from "@/lib/db";

export async function GET() {
  try {
    const logs = await getErrorLogs();
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error occurred while retrieving error logs:", error);
    return NextResponse.json(
      { error: "Failed to retrieve error logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { historyId, error } = await req.json();

    if (!historyId || !error) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const log = await createErrorLog(historyId, error);
    return NextResponse.json(log);
  } catch (error) {
    console.error("Error occurred while creating error log:", error);
    return NextResponse.json(
      { error: "Failed to create error log" },
      { status: 500 }
    );
  }
}