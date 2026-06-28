# backend/app/services/ai_service.py
from app.ai.graph import incident_graph

def run_triage(title: str, description: str, category: str = None) -> dict:
    initial_state = {
        "title": title,
        "description": description,
        "category": category,
    }

    result = incident_graph.invoke(initial_state)

    return {
        "ai_severity": result.get("ai_severity"),
        "ai_summary": result.get("ai_summary"),
        "ai_recommended_action": result.get("ai_recommended_action"),
    }