from fastapi import FastAPI, HTTPException
from models import TimetableGenerationRequest, TimetableGenerationResponse
from solver import solve_timetable

app = FastAPI(
    title="Cameroon School Timetable Generator Engine",
    version="1.0.0",
    description="CP-SAT Constraint Satisfaction Microservice powered by Google OR-Tools",
)


@app.get("/health")
def health_check():
    return {"status": "ONLINE", "engine": "Google OR-Tools CP-SAT"}


@app.post("/api/v1/generate-timetable", response_model=TimetableGenerationResponse)
def generate_timetable(request: TimetableGenerationRequest):
    try:
        response = solve_timetable(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
