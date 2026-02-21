import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
    }

    try {
        const { buyer_id, type } = await req.json()

        if (!buyer_id || !type) {
            throw new Error('buyer_id and type are required')
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Fetch buyer data
        const { data: buyer, error: buyerError } = await supabase
            .from('Outreach_Raw_Messy_Data')
            .select('*')
            .eq('buyer_id', buyer_id)
            .single()

        if (buyerError || !buyer) {
            throw new Error(`Buyer not found: ${buyerError?.message}`)
        }

        // Construct the context for Claude
        const context = {
            buyer_name: `Buyer ${buyer_id.split('_')[1]}`, // Mocking name since table only has ID
            industry: buyer.industry,
            signals: {
                promotion: buyer.job_promotion_flag === '1.0' ? 'Recently Promoted' : 'No recent promotion',
                hiring: buyer.hiring_increase_flag === '1' ? 'Company Hiring Increase' : 'Stable headcount',
                linkedin_engagement: `${(buyer.linkedin_post_engagement * 100).toFixed(0)}%`,
                groups: buyer.group_memberships || 'Professional communities'
            },
            channel: type,
            previous_response: buyer.previous_channel_response
        }

        // Claude System Prompt
        const systemPrompt = `You are an expert sales development representative specializing in hyper-personalized, high-value outreach.
Your goal is to convert a "Cold" intent signal into a discovery call by referencing specific, real-life professional triggers.

CORE PRINCIPLES:
1. NO GENERIC FLUFF: Avoid "I hope you're well" or "As a leader in...".
2. TRIGGER-FIRST: Start the message by referencing the primary intent signal.
3. VALUE-LINK: Pivot from the signal to how our solution solves a specific problem related to that signal.
4. BREVITY: Keep messages under 100 words (WhatsApp under 40).`

        const userPrompt = `Generate a highly personalized ${type} message for ${context.buyer_name} in the ${context.industry} industry.
Context:
- Primary Signals: ${context.signals.promotion}, ${context.signals.hiring}
- LinkedIn Activity: ${context.signals.linkedin_engagement} engagement
- Community Presence: ${context.signals.groups}
- Preferred Channel History: ${context.previous_response}

The message should be optimized for ${type}.`

        // Call Anthropic
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: 1024,
                system: systemPrompt,
                messages: [{ role: 'user', content: userPrompt }],
            }),
        })

        const result = await response.json()
        const content = result.content[0].text

        return new Response(JSON.stringify({ content }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
    }
})
