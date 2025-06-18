import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    bland_key_exists: !!process.env.BLAND_AI_API_KEY,
    bland_key_length: process.env.BLAND_AI_API_KEY?.length || 0,
    all_env_keys: Object.keys(process.env).filter(key => 
      key.includes('BLAND') || key.includes('STRIPE')
    )
  })
}