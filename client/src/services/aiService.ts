/**
 * Client AI Service Client (Step 14 - Secure LLM Integration)
 *
 * Communicates with the secure server-side AI endpoint.
 * Zero API keys are stored or exposed in the frontend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export interface AnalogyItem {
  dsaConcept: string
  analogy: string
  description: string
}

export interface AnalogyMapping {
  domain: string
  summary: string
  items: AnalogyItem[]
}

export interface CorePrinciple {
  title: string
  detail: string
}

export interface TailoredCodeExample {
  language: string
  title: string
  code: string
  explanation: string
}

export interface AIExplanationData {
  topic: string
  topicTitle: string
  personalizedHook: string
  conceptOverview: string
  analogyMapping: AnalogyMapping
  corePrinciples: CorePrinciple[]
  stepByStepExplanation: string[]
  tailoredCodeExample: TailoredCodeExample
  commonPitfalls: string[]
  keyTakeaways: string[]
  adaptiveTipsForLearner: string
}

export interface AIExplanationResponse {
  success: boolean
  source?: 'llm' | 'adaptive_engine'
  provider?: string
  note?: string
  data?: AIExplanationData
  error?: string
}

export interface RequestExplanationParams {
  learnerLevel?: string
  subject?: string
  topic: string
  learnerInterests?: string[]
  preferredExplanation?: string
  recentPerformance?: string
  currentDifficulty?: string
  language?: 'cpp' | 'java'
}

/**
 * Fetch a deeply personalized concept explanation from the secure backend.
 */
export async function fetchPersonalizedExplanation(
  params: RequestExplanationParams
): Promise<AIExplanationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const errJson = await response.json().catch(() => null)
      return {
        success: false,
        error: errJson?.error || `Server responded with HTTP ${response.status}`,
      }
    }

    const data: AIExplanationResponse = await response.json()
    return data
  } catch (err: any) {
    console.error('[AI Service Client] Network error fetching explanation:', err)
    return {
      success: false,
      error: 'Unable to connect to AI server. Please verify the backend is running on port 5000.',
    }
  }
}

/**
 * Check backend AI service health and LLM status.
 */
export async function checkAIStatus(): Promise<{
  liveLlmEnabled: boolean
  model: string
  fallbackEngine: string
} | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ai/status`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
