from app.services.gemini import generate_text
from app.agents.recovery_decision_agent import choose_recovery_strategy


PLAYBOOKS = {
    "retry_card": {
        "subject": "Let's complete your payment",
        "cta": "Retry your payment",
    },
    "offer_upi": {
        "subject": "A quicker way to complete your payment",
        "cta": "Pay instantly with Razorpay",
    },
    "resume_checkout": {
        "subject": "Your checkout is waiting",
        "cta": "Resume your checkout",
    },
    "subscription_update": {
        "subject": "Keep your subscription active",
        "cta": "Update your payment",
    },
    "invoice_reminder": {
        "subject": "Invoice payment reminder",
        "cta": "Pay your invoice",
    },
    "voice_followup": {
        "subject": "Let's complete your payment today",
        "cta": "Complete payment now",
    },
}


async def generate_recovery_email(payment: dict):
    decision = await choose_recovery_strategy(payment)

    playbook = PLAYBOOKS.get(
        decision["selected_playbook"],
        PLAYBOOKS["offer_upi"],
    )

    prompt = f"""
You are an AI Revenue Recovery Specialist.

The Recovery Decision Agent has already selected the recovery strategy.

Decision:
- Playbook: {decision["selected_playbook"]}
- Reasoning: {decision["reasoning"]}
- Tone: {decision["tone"]}
- Urgency: {decision["urgency"]}

Customer:
- Name: {payment["customer_name"]}
- Amount: ₹{payment["amount"]}
- Payment Type: {payment["payment_type"]}
- Root Cause: {payment["root_cause"]}

Checkout URL:
{payment["checkout_url"]}

Instructions:
- Follow the selected playbook.
- Maintain the requested tone.
- Personalize the explanation.
- Keep it concise.
- Return ONLY HTML.

Include this exact button:

<a href="{payment["checkout_url"]}" style="display:inline-block;padding:14px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">{playbook["cta"]}</a>
"""

    html = await generate_text(prompt)

    return {
        "subject": playbook["subject"],
        "html": html,
        "decision": decision,
    }