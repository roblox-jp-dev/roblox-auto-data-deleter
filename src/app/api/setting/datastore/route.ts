import { NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { 
  getDataStoreApiKeys, 
  createDataStoreApiKey, 
  deleteDataStoreApiKey 
} from "@/lib/db";

export async function GET() {
  try {
    const apiKeys = await getDataStoreApiKeys();
    return NextResponse.json(apiKeys);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("DataStore API Keys fetch error:", error.message);
    return NextResponse.json(
      { error: "Failed to retrieve API keys" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { label, apiKey } = await request.json();
    
    if (typeof label !== "string" || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "Label and API key must be strings" },
        { status: 400 }
      );
    }

    try {
      const newApiKey = await createDataStoreApiKey({label, apiKey});
      return NextResponse.json(newApiKey);
    } catch (prismaError: unknown) {
      if (prismaError instanceof PrismaClientKnownRequestError && prismaError.code === 'P2002') {
        return NextResponse.json(
          { error: "This label is already in use" },
          { status: 400 }
        );
      }
      throw prismaError;
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error("DataStore API Key creation error:", error.message);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "ID is not specified" },
        { status: 400 }
      );
    }

    const result = await deleteDataStoreApiKey(id);
    if (!result.success) {
      if (result.error === "GAME_EXISTS") {
        return NextResponse.json(
          { error: "This game already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}