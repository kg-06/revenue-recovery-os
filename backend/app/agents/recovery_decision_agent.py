import json

from app.services.gemini import generate_text


async def choose_recovery_strategy(payment: dict):
    """
    AI decides which recovery intervention should be used.

    Returns:
    {
        "selected_playbook": "...",
        "reasoning": "...",
        "tone": "...",
        "urgency": "..."
    }
    """

    prompt = f"""
You are an AI Revenue Recovery Decision Agent.

Your ONLY job is to choose the best recovery intervention.

Customer Details:
- Name: {payment["customer_name"]}
- Amount: ₹{payment["amount"]}
- Payment Type: {payment["payment_type"]}
- Root Cause: {payment["root_cause"]}
- Customer Behavior: {payment["customer_behavior"]}
- Recommended Strategy: {payment["recommended_strategy"]}
- Risk Score: {payment["risk_score"]}
- Attempts: {payment["attempts"]}

Available Playbooks:

1. retry_card
   - Temporary card failures.
   - Encourage another attempt.

2. offer_upi
   - Card friction.
   - Encourage UPI payment.

3. resume_checkout
   - Checkout abandoned.
   - Resume purchase.

4. subscription_update
   - Subscription payment failed.
   - Update payment method.

5. invoice_reminder
   - B2B overdue invoice.

6. voice_followup
   - High-value repeated failures requiring escalation.

Return ONLY valid JSON.

Required format:

{{
  "selected_playbook": "...",
  "reasoning": "...",
  "tone": "friendly | reassuring | professional | urgent",
  "urgency": "low | medium | high"
}}
"""

    response = await generate_text(prompt)

    # Remove markdown if Gemini wraps JSON.
    cleaned = response.strip().replace("```json", "").replace("```", "").strip()

    return json.loads(cleaned)