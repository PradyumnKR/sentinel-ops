from typing import TypedDict, Optional

class IncidentState(TypedDict):
    title: str
    description: str
    category: Optional[str]
    ai_severity: Optional[str]
    ai_summary: Optional[str]
    ai_recommended_action: Optional[str]