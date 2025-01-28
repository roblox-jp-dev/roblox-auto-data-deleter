import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getGlobalSettings, getGames, getRules, createHistory } from "@/lib/db";
import axios from "axios";

interface WebhookPayload {
  embeds: [{
    title: string;
    description: string;
    footer: {
      icon_url: string;
      text: string;
    };
  }];
}

export async function POST(request: Request) {
  try {
    const payload: WebhookPayload = await request.json();
    
    const footerText = payload.embeds[0].footer.text;
    const signatureMatch = footerText.match(/Roblox-Signature: ([^,]+)/);
    const signature = signatureMatch ? signatureMatch[1] : null;
    
    const settings = await getGlobalSettings();
    const webhookAuthKey = settings?.webhookAuthKey;

    if (!webhookAuthKey && !signature) {
    } else if (webhookAuthKey && signature) {
      const hmac = createHmac('sha256', webhookAuthKey);
      const calculatedSignature = hmac.update(JSON.stringify(payload)).digest('hex');
      
      if (calculatedSignature !== signature) {
        return NextResponse.json(
          { error: "署名が無効です" },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "認証設定が不正です" },
        { status: 401 }
      );
    }

    const description = payload.embeds[0].description;
    const userIdMatch = description.match(/User Id: ([^in]+)/);
    const gameIdMatch = description.match(/game\(s\) with Ids: ([^\s]+)/);

    if (!userIdMatch || !gameIdMatch) {
      return NextResponse.json(
        { error: "必要な情報が見つかりません" },
        { status: 400 }
      );
    }

    const userId = userIdMatch[1].trim();
    const gameIds = gameIdMatch[1].split(',').map(id => id.trim());

    const games = await getGames();
    for (const gameId of gameIds) {
      const game = games.find(g => g.startPlaceId.toString() === gameId);
      if (!game) continue;

      const rules = await getRules(game.id);
      
      for (const rule of rules) {
        try {
          const processedDatastoreName = rule.datastoreName
            .replace("{userId}", userId)
            .replace("{playerId}", userId);
          
          const processedKeyPattern = rule.keyPattern
            .replace("{userId}", userId)
            .replace("{playerId}", userId);

          await axios.post(
            `https://apis.roblox.com/datastores/v1/universes/${game.universeId}/standard-datastores/datastore/entries/entry/delete`,
            {
              datastoreName: processedDatastoreName,
              scope: rule.scope,
              key: processedKeyPattern
            },
            {
              headers: {
                "x-api-key": game.dataStoreApiKey.apiKey,
                "Content-Type": "application/json"
              }
            }
          );

          await createHistory({
            userId,
            gameId: game.id,
            tableName: processedDatastoreName,
            ruleIds: [rule.id]
          });

        } catch (error) {
          console.error(`Delete operation failed for game ${game.label}:`, error);
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhookの処理に失敗しました" },
      { status: 500 }
    );
  }
}