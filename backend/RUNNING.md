# Running the ASTRA backend

    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt

    # run the API (Swagger UI at http://127.0.0.1:8000/docs)
    uvicorn backend.main:app --reload

    # run the tests
    python -m pytest backend/tests -v

    # mutation testing (macOS/Linux only)
    mutmut run --paths-to-mutate=backend/rules/alt_text.py --tests-dir=backend/tests/
    mutmut results

Not implemented yet: React frontend, PostgreSQL persistence (scan history).
