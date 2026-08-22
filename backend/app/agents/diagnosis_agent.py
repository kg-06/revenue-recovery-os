from app.models.diagnosis import Diagnosis
from app.prompts.diagnosis import DIAGNOSIS_PROMPT
from app.services.gemini import generate_structured


async def generate_batch_diagnosis(records):
    prompt = f"""
{DIAGNOSIS_PROMPT}

Analyze each payment record.

Return one diagnosis for every record.

Payment Records:

{records}
"""

    diagnoses = await generate_structured(
        prompt,
        list[Diagnosis],
    )

    return [d.model_dump() for d in diagnoses]