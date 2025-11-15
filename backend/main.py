from fastapi import FastAPI
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

app = FastAPI()

@app.get("/api/v1/")
def read_root():
    return {"Hello": "World", "Project": "S.I.P.C.O."}

@app.get("/api/v1/racks")
def get_racks():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT nome, coordenada_x, coordenada_y FROM Racks"))
            racks = [row._asdict() for row in result]
            return {"racks": racks}
    except Exception as e:
        return {"error": str(e)}
