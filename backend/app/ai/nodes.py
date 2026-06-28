from langchain_groq import ChatGroq
from app.core.config import settings
from app.ai.state import IncidentState
from app.ai.schema import IncidentAnalysis
import json

llm = ChatGroq(api_key=settings.GROQ_API_KEY, model="llama-3.3-70b-versatile")
structured_llm = llm.with_structured_output(IncidentAnalysis, method="json_mode")

def classify_and_analyze(state: IncidentState) -> IncidentState:
    prompt = f"""
    You are an expert incident response analyst. Respond ONLY with a valid JSON object, no extra text.

    Incident Title: {state['title']}
    Description: {state['description']}
    Category: {state.get('category', 'Unknown')}

    Return this exact JSON structure:
    {{
        "severity": "One of: Critical, High, Medium, Low",
        "summary": "3-4 sentences. Business impact, likely cause, and end with why you chose this severity rating.",
        "action": "1. First step\\n2. Second step\\n3. Third step"
    }}
    """
    result = structured_llm.invoke(prompt)

    state['ai_severity'] = result.severity
    state['ai_summary'] = result.summary
    state['ai_recommended_action'] = result.action
    return state