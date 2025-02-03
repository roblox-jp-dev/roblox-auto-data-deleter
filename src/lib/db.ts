import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GlobalSettings
export async function getGlobalSettings() {
  return prisma.globalSettings.findFirst()
}

export async function updateGlobalSettings(webhookAuthKey: string) {
  const settings = await prisma.globalSettings.findFirst()
  if (settings) {
    return prisma.globalSettings.update({
      where: { id: settings.id },
      data: { webhookAuthKey }
    })
  } else {
    return prisma.globalSettings.create({
      data: { webhookAuthKey }
    })
  }
}

// DataStoreApiKey
export async function getDataStoreApiKeys() {
  return prisma.dataStoreApiKey.findMany({
    include: { games: true }
  })
}

export async function createDataStoreApiKey(data: {
  label: string
  apiKey: string  
}) {
  return prisma.dataStoreApiKey.create({ data })
}

export async function deleteDataStoreApiKey(id: string): Promise<{ success: boolean; error: string | null }> {
  if (!id) {
    throw new Error('ID is required');
  }

  try {
    const transactionResult = await prisma.$transaction(async (tx) => {
      const gameCount = await tx.game.count({
        where: { apiKeyId: id }
      });

      if (gameCount > 0) {
        return { success: false, error: 'APIキーを使用しているゲームが存在するため削除できません' };
      }

      await tx.dataStoreApiKey.delete({
        where: { id }
      });
      return { success: true, error: null };
    });

    return transactionResult;
  } catch (error) {
    console.error('DataStore API Key deletion error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw new Error('Failed to delete DataStore API Key');
  }
}

// Game
export async function getGames() {
  return prisma.game.findMany({
    include: {
      dataStoreApiKey: true,
      rules: true
    }
  })
}

export async function createGame(data: {
  label: string
  universeId: number
  startPlaceId: number
  apiKeyId: string
}) {
  return prisma.game.create({ data })
}

export async function deleteGame(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const rules = await tx.rule.findMany({
        where: { gameId: id }
      });

      if (rules.length > 0) {
        return { success: false, error: "ゲームに関連するルールが存在するため削除できません" };
      }

      await tx.game.delete({
        where: { id }
      });

      return { success: true, error: null };
    });

    return result;
  } catch (error) {
    console.error("Game deletion error:", error instanceof Error ? error.message : error);
    return { success: false, error: "ゲームの削除に失敗しました" };
  }
}

// Rule
export async function getRules(gameId?: string) {
  try {
    const where = gameId ? { gameId } : {};
    const rules = await prisma.rule.findMany({
      where,
      include: {
        game: {
          select: {
            label: true
          }
        }
      }
    });
    return rules;
  } catch (error) {
    console.error("DB Query Error:", error);
    throw error;
  }
}

export async function createRule(data: {
  gameId: string
  label: string
  datastoreName: string
  datastoreType: string
  keyPattern: string
  scope: string
}) {
  return prisma.rule.create({ data })
}

export async function deleteRule(id: string) {
  return prisma.rule.delete({
    where: { id }
  })
}

// History
export async function createHistory(data: {
  userId: string
  gameId: string
  ruleIds: string[]
}) {
  try {
    const universeId = parseInt(data.gameId, 10);
    if (isNaN(universeId)) {
      throw new Error(`無効なUniverseID: ${data.gameId}`);
    }

    const game = await prisma.game.findFirst({
      where: { universeId }
    });
    
    console.log('検索されたゲーム:', game);

    if (!game) {
      throw new Error(`ゲームが見つかりません: ${universeId}`);
    }

    const existingRules = await prisma.rule.findMany({
      where: {
        id: {
          in: data.ruleIds
        }
      }
    });

    console.log('検索されたルール:', existingRules);
    console.log('要求されたルールIDs:', data.ruleIds);

    const foundRuleIds = existingRules.map(rule => rule.id);
    const missingRuleIds = data.ruleIds.filter(id => !foundRuleIds.includes(id));

    if (missingRuleIds.length > 0) {
      throw new Error(`見つからないルールIDs: ${missingRuleIds.join(', ')}`);
    }

    return await prisma.$transaction(async (tx) => {
      const history = await tx.history.create({
        data: {
          gameId: game.id,
          userId: data.userId
        }
      });

      for (const ruleId of data.ruleIds) {
        await tx.historyRules.create({
          data: {
            historyId: history.id,
            ruleId: ruleId
          }
        });
      }

      return await tx.history.findUnique({
        where: { id: history.id },
        include: {
          rules: {
            include: { rule: true }
          }
        }
      });
    });

  } catch (error) {
    console.error('履歴作成エラー:', error);
    throw error;
  }
}

export async function getHistories(gameId?: string) {
  const where = gameId ? { gameId } : {};
  return prisma.history.findMany({
    where,
    include: {
      game: true,
      rules: {
        include: {
          rule: true
        }
      },
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getHistoryById(id: string) {
  return prisma.history.findUnique({
    where: { id },
    include: {
      game: true,
      rules: {
        include: {
          rule: true
        }
      },
    }
  })
}

export async function getHistoryRules(historyId: string) {
  return prisma.historyRules.findMany({
    where: { historyId },
    include: {
      rule: true
    }
  })
}

export async function getHistoriesByUserId(userId: string) {
  return prisma.history.findMany({
    where: { userId },
    include: {
      game: true,
      rules: {
        include: {
          rule: true
        }
      },
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

// ErrorLog
export async function getErrorLogs() {
  return prisma.errorLog.findMany({
    include: {
      game: true
    },
    orderBy: {
      timestamp: 'desc'
    }
  })
}

export async function createErrorLog(error: string, gameId: string) {
  return prisma.errorLog.create({
    data: {
      error,
      game: {
        connect: { id: gameId }
      }
    }
  })
}

export default prisma