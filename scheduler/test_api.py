"""
FastAPI TestClient integration test for /health and /api/v1/generate-timetable endpoints.
"""
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    print("GET /health response:", response.status_code, response.json())
    assert response.status_code == 200
    assert response.json()["status"] == "ONLINE"


def test_generate_timetable_api():
    payload = {
        "schoolId": "school_mboa_college_01",
        "academicYearId": "year_2026",
        "days": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
        "periodSlots": [
            {"id": "p1", "periodNumber": 1, "startTime": "07:30", "endTime": "08:20"},
            {"id": "p2", "periodNumber": 2, "startTime": "08:20", "endTime": "09:10"},
            {"id": "p3", "periodNumber": 3, "startTime": "09:10", "endTime": "10:00"},
            {"id": "p4", "periodNumber": 4, "startTime": "10:20", "endTime": "11:10"},
            {"id": "p5", "periodNumber": 5, "startTime": "11:10", "endTime": "12:00"},
        ],
        "classSectionIds": ["class_form_5a"],
        "teachers": [
            {"teacherId": "t1", "unavailableSlots": [], "maxPerDay": 5},
            {"teacherId": "t2", "unavailableSlots": [], "maxPerDay": 5},
        ],
        "rooms": [
            {"id": "r1", "name": "Room 101", "isLab": False, "capacity": 50},
            {"id": "r2", "name": "Science Lab", "isLab": True, "capacity": 40},
        ],
        "assignments": [
            {
                "id": "a1",
                "teacherId": "t1",
                "classSectionId": "class_form_5a",
                "subjectId": "math",
                "periodsPerWeek": 5,
                "allowDoublePeriod": True,
                "timePreference": "MORNING",
                "isLabRequired": False,
            },
            {
                "id": "a2",
                "teacherId": "t2",
                "classSectionId": "class_form_5a",
                "subjectId": "biology",
                "periodsPerWeek": 3,
                "allowDoublePeriod": False,
                "timePreference": "ANY",
                "isLabRequired": True,
            },
        ],
        "lockedEntries": [],
    }

    response = client.post("/api/v1/generate-timetable", json=payload)
    print("POST /api/v1/generate-timetable status code:", response.status_code)
    data = response.json()
    print("Response status:", data.get("status"))
    print("Execution time:", data.get("executionTimeMs"), "ms")
    print("Entries count:", len(data.get("timetableEntries", [])))

    assert response.status_code == 200
    assert data["status"] == "SUCCESS"
    assert len(data["timetableEntries"]) == 8
    print("ALL API TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_health()
    test_generate_timetable_api()
