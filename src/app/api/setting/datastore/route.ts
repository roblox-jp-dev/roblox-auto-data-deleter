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
      { error: "APIキーの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { label, apiKey } = await request.json();
    
    if (typeof label !== "string" || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "ラベルとAPIキーは文字列である必要があります" },
        { status: 400 }
      );
    }

    try {
      const newApiKey = await createDataStoreApiKey({label, apiKey});
      return NextResponse.json(newApiKey);
    } catch (prismaError: unknown) {
      if (prismaError instanceof PrismaClientKnownRequestError && prismaError.code === 'P2002') {
        return NextResponse.json(
          { error: "このラベルは既に使用されています" },
          { status: 400 }
        );
      }
      throw prismaError;
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error("DataStore API Key creation error:", error.message);
    return NextResponse.json(
      { error: "APIキーの作成に失敗しました" },
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
        { error: "IDが指定されていません" },
        { status: 400 }
      );
    }

    const result = await deleteDataStoreApiKey(id);
    if (!result.success) {
      if (result.error === "GAME_EXISTS") {
        return NextResponse.json(
          { error: "このゲームは既に存在しています" },
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
    const message = error instanceof Error ? error.message : "エラーが発生しました";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}