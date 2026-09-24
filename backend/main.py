from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.convert import router as convert_router

app = FastAPI(title="Currency Converter API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(convert_router)


@app.get("/")
async def root():
    return {"message": "Currency Converter API is running"}
