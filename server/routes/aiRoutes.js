import express from 'express'
import { generatePersonalizedExplanation } from '../services/aiService.js'

const router = express.Router()

/**
 * GET /api/ai/status
 * Returns LLM service configuration status without leaking API credentials.
 */
router.get('/status', (req, res) => {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || ''
  const isConfigured =
    Boolean(apiKey) &&
    !apiKey.includes('your_llm_api_key') &&
    !apiKey.includes('placeholder')

  res.json({
    status: 'ok',
    liveLlmEnabled: isConfigured,
    model: process.env.AI_MODEL_NAME || 'gemini-1.5-flash',
    fallbackEngine: 'active',
  })
})

/**
 * POST /api/ai/explain
 * Generates a deeply personalized explanation for a DSA concept.
 *
 * Payload:
 * {
 *   learnerLevel: string,
 *   subject: string,
 *   topic: string,
 *   learnerInterests: string[],
 *   preferredExplanation: string,
 *   recentPerformance: string,
 *   currentDifficulty: string,
 *   language: 'cpp' | 'java'
 * }
 */
router.post('/explain', async (req, res) => {
  try {
    const {
      learnerLevel,
      subject,
      topic,
      learnerInterests,
      preferredExplanation,
      recentPerformance,
      currentDifficulty,
      language,
    } = req.body || {}

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "topic" parameter.',
      })
    }

    const result = await generatePersonalizedExplanation({
      learnerLevel,
      subject,
      topic,
      learnerInterests,
      preferredExplanation,
      recentPerformance,
      currentDifficulty,
      language,
    })

    return res.status(200).json(result)
  } catch (error) {
    console.error('[AI Routes] Error in /explain:', error)
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while generating the explanation.',
    })
  }
})

export default router
