def calculate_risk(record: dict):
    score = 0

    reason = record["failure_reason"]
    amount = record["amount"]
    attempts = record["attempts"]
    status = record["status"]

    if reason == "card_expired":
        score += 40

    elif reason == "bank_timeout":
        score += 20

    elif reason == "invoice_overdue":
        score += 30

    elif reason == "checkout_exit":
        score += 15

    if attempts > 0:
        score += attempts * 5

    if amount > 5000:
        score += 15

    elif amount > 2000:
        score += 8

    if status == "overdue":
        score += 10

    score = min(score, 100)

    if score >= 70:
        priority = "Critical"

    elif score >= 50:
        priority = "High"

    elif score >= 30:
        priority = "Medium"

    else:
        priority = "Low"

    return score, priority