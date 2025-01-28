import { NextResponse } from 'next/server'
import { getRules } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')

    const rules = await getRules(gameId || undefined)
    const rulesList = rules.map(rule => ({
      id: rule.id,
      label: rule.label,
      game: rule.game.label
    }))

    return NextResponse.json({
      success: true,
      rules: rulesList
    })

  } catch (error) {
    console.error('ルール一覧取得エラー:', error)
    return NextResponse.json(
      { success: false, error: 'ルール一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}