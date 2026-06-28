from langgraph.graph import StateGraph, START, END
from app.ai.state import IncidentState
from app.ai.nodes import classify_and_analyze

workflow = StateGraph(IncidentState)
workflow.add_node("analyze", classify_and_analyze)
workflow.add_edge(START, "analyze")
workflow.add_edge("analyze", END)

incident_graph = workflow.compile()