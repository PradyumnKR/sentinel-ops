from pydantic import BaseModel, Field

class IncidentAnalysis(BaseModel):
    severity: str = Field(description="One of: Critical, High, Medium, Low")
    summary: str = Field(description="A concise 3-4 sentence summary of the incident")
    action: str = Field(description="Recommended immediate remediation action")