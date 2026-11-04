import os
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from kube import start_job, JobConflict
from mediamtx import MediamtxUnavailable, path_status

log = logging.getLogger("control")
app = FastAPI()
ENV = os.getenv("ENV", "unknown")


class CreateStream(BaseModel):
    source: str
    destination: str


@app.post("/streams", status_code=201)
def create(req: CreateStream):
    try:
        job = start_job(req.source, req.destination)
    except JobConflict:
        raise HTTPException(409, "stream already running")
    return {"id": job.id}


@app.get("/streams/{id}")
def get(id: str):
    try:
        status = path_status(id)
    except MediamtxUnavailable as e:
        log.error("mediamtx unreachable: %s", e)
        raise HTTPException(503, "mediamtx unavailable")
    if status is None:
        raise HTTPException(404, "no such stream")
    return status
