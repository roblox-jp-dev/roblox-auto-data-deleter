import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getGlobalSettings, getGames, getRules, createHistory, createErrorLog } from "@/lib/db";
import axios, { AxiosError } from "axios";

interface WebhookPayload {
  NotificationId: string;
  EventType: string;
  EventTime: string;
  EventPayload: {
    UserId: number;
    GameIds: number[];
  };
}

export async function POST(request: Request) {
  try {
    console.log("===== WEBHOOK REQUEST HEADERS =====");
    const headerObj: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headerObj[key] = value;
    });
    console.log(JSON.stringify(headerObj, null, 2));
    
    const requestClone = request.clone();
    const rawBody = await requestClone.text();
    console.log("===== WEBHOOK RAW BODY =====");
    console.log(rawBody);
    
    let payload: WebhookPayload;
    try {
      payload = JSON.parse(rawBody) as WebhookPayload;
    } catch (e) {
      console.error("JSON解析エラー:", e);
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }
    
    console.log("===== WEBHOOK PARSED PAYLOAD =====");
    console.log(JSON.stringify(payload, null, 2));

    if (payload.EventType !== 'RightToErasureRequest' || 
        !payload.EventPayload || 
        typeof payload.EventPayload.UserId !== 'number' ||
        !Array.isArray(payload.EventPayload.GameIds)) {
      console.log("非削除リクエストのWebhook:", payload);
      return NextResponse.json({ success: false, error: "非削除リクエスト" }, { status: 400 });
    }
    
    const userId = payload.EventPayload.UserId.toString();
    const gameIds = payload.EventPayload.GameIds.map(id => id.toString());
    const gameIdForLog = gameIds[0] || "";

    const signatureHeader = request.headers.get('roblox-signature') || null;
    const timestamp = signatureHeader ? signatureHeader.split(',')[0].replace('t=', '') : null;
    const signature = signatureHeader ? signatureHeader.split(',')[1].replace('v1=', '') : null;

    const settings = await getGlobalSettings();
    const webhookAuthKey = settings?.webhookAuthKey;

    try {
      const logMessage = `
===== WEBHOOK RECEIVED =====
HEADERS:
${JSON.stringify(headerObj, null, 2)}

BODY:
${rawBody}`;
      
      await createErrorLog(logMessage, gameIdForLog);
    } catch (logError) {
      console.error("Failed to log webhook details:", logError);
    }

    if (webhookAuthKey && signature && timestamp) {
      const hmac = createHmac('sha256', webhookAuthKey);
      const calculatedSignature = hmac.update(`${timestamp}.${rawBody}`).digest('base64');
      
      if (calculatedSignature !== signature) {
        console.error(`署名検証失敗: expected=${signature}, calculated=${calculatedSignature}`);
        await createErrorLog(`署名検証失敗: ${signature} vs ${calculatedSignature}`, gameIdForLog);
        return NextResponse.json({ error: "署名が無効です" }, { status: 401 });
      }
    }

    const games = await getGames();
    for (const gameId of gameIds) {
      const game = games.find(g => g.startPlaceId.toString() === gameId);
      if (!game) {
        console.log(`Game not found for startPlaceId: ${gameId}`);
        await createErrorLog(`Game not found for startPlaceId: ${gameId}`, gameId);
        continue;
      }
      
      const rules = await getRules(game.id);
      if (rules.length === 0) {
        console.log(`No rules found for game: ${game.label} (ID: ${game.id})`);
        await createErrorLog(`No rules found for game: ${game.label} (ID: ${game.id})`, game.startPlaceId.toString());
        continue;
      }
      
      for (const rule of rules) {
        try {
          const processedDatastoreName = rule.datastoreName
            .replace("{userId}", userId)
            .replace("{playerId}", userId);
        
          const processedKeyPattern = rule.keyPattern
            .replace("{userId}", userId)
            .replace("{playerId}", userId);
          
          console.log('Deleting data:', {
            universeId: game.universeId,
            datastoreName: processedDatastoreName,
            scope: rule.scope || "global",
            entryKey: processedKeyPattern
          });
        
          try {
            await axios.delete(
              `https://apis.roblox.com/datastores/v1/universes/${game.universeId}/standard-datastores/datastore/entries/entry`,
              {
                headers: {
                  "x-api-key": game.dataStoreApiKey.apiKey,
                  "Content-Type": "application/json"
                },
                params: {
                  datastoreName: processedDatastoreName,
                  scope: rule.scope || "global",
                  entryKey: processedKeyPattern
                }
              }
            );
            
            console.log(`データ削除成功: ゲーム=${game.label}, データストア=${processedDatastoreName}, キー=${processedKeyPattern}`);
            await createErrorLog(
              `データ削除成功: ユーザーID=${userId}, ゲーム=${game.label}, データストア=${processedDatastoreName}, キー=${processedKeyPattern}`,
              game.startPlaceId.toString()
            );
          } catch (deleteError) {
            const axiosError = deleteError as AxiosError;
            
            if (axiosError.response?.status === 404) {
              console.log(`データ既に削除済み/存在せず: ゲーム=${game.label}, データストア=${processedDatastoreName}, キー=${processedKeyPattern}`);
              await createErrorLog(
                `データ既に削除済み/存在せず: ユーザーID=${userId}, ゲーム=${game.label}, データストア=${processedDatastoreName}, キー=${processedKeyPattern}`,
                game.startPlaceId.toString()
              );
            } else {
              const errorMessage = `Delete operation failed for game ${game.label}: ${axiosError.message}`;
              console.error(errorMessage);
          
              const errorDetails = {
                status: axiosError.response?.status,
                statusText: axiosError.response?.statusText,
                data: axiosError.response?.data
              };
          
              await createErrorLog(
                `${errorMessage}\nDetails: ${JSON.stringify(errorDetails)}`,
                game.startPlaceId.toString()
              );
              continue;
            }
          }
          
          try {
            await createHistory({
              userId,
              gameId: game.id,
              ruleIds: [rule.id]
            });
            console.log(`履歴作成成功: ユーザー=${userId}, ゲーム=${game.label}`);
          } catch (historyError) {
            console.error(`履歴作成エラー:`, historyError);
            await createErrorLog(
              `履歴作成失敗: ${historyError instanceof Error ? historyError.message : '不明なエラー'}`,
              game.startPlaceId.toString()
            );
          }
        } catch (ruleProcessError) {
          console.error(`ルール処理エラー:`, ruleProcessError);
          await createErrorLog(
            `ルール処理エラー: ${ruleProcessError instanceof Error ? ruleProcessError.message : '不明なエラー'}`,
            game.startPlaceId.toString()
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing error" },
      { status: 500 }
    );
  }
}