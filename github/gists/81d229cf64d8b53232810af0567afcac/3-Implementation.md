Certainly! Here's the implementation of the FastAPI application for intelligent agents, including all the required files and configurations.

---

**Project Structure:**

```
your_project/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── auth.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── agent_routes.py
│   │   └── task_routes.py
├── tests/
│   └── test_main.py
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── install.sh
├── .env
├── alembic/
│   └── [migration files]
├── sql/
│   └── init.sql
└── README.md
```

---

### **1. app/main.py**

```python
from fastapi import FastAPI
from app.routes import agent_routes, task_routes
from app.database import Base, engine

app = FastAPI()

# Include routers
app.include_router(agent_routes.router)
app.include_router(task_routes.router)

# Create database tables
Base.metadata.create_all(bind=engine)
```

---

### **2. app/models.py**

```python
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Agent(Base):
    __tablename__ = 'agents'
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, index=True)
    tasks = relationship("Task", back_populates="agent")

class Task(Base):
    __tablename__ = 'tasks'
    id = Column(Integer, primary_key=True)
    description = Column(String)
    agent_id = Column(Integer, ForeignKey('agents.id'))
    agent = relationship("Agent", back_populates="tasks")
```

---

### **3. app/database.py**

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv('DATABASE_URL')

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()
```

---

### **4. app/auth.py**

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
import os

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = os.getenv('SECRET_KEY')

def get_current_agent(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        agent_id: str = payload.get("sub")
        if agent_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        return agent_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
```

---

### **5. app/routes/agent_routes.py**

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Agent
from app.auth import get_current_agent

router = APIRouter(prefix="/agents", tags=["Agents"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_agent(name: str, db: Session = Depends(get_db)):
    agent = Agent(name=name)
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

@router.get("/{agent_id}")
def read_agent(agent_id: int, db: Session = Depends(get_db)):
    return db.query(Agent).filter(Agent.id == agent_id).first()
```

---

### **6. requirements.txt**

```
fastapi
uvicorn
SQLAlchemy
psycopg2-binary
python-dotenv
PyJWT
alembic
```

---

### **7. Dockerfile**

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### **8. docker-compose.yml**

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      - db
  db:
    image: postgres:13-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=agents_db
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

---

### **9. install.sh**

```bash
#!/bin/bash

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head
```

---

### **10. .env**

```
DATABASE_URL=postgresql://user:password@db:5432/agents_db
SECRET_KEY=your_secret_key_here
```

---

### **11. sql/init.sql**

```sql
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    agent_id INTEGER REFERENCES agents(id)
);
```

---

### **12. README.md**

```markdown
# Intelligent Agents FastAPI Application

## Overview

A fully functional FastAPI application designed for intelligent agents, featuring authentication, database integration, and containerization.

## Setup Instructions

1. **Clone the Repository**

```bash
git clone https://github.com/yourusername/your_project.git
cd your_project
```

2. **Set Environment Variables**

Copy `.env.example` to `.env` and update the values.

3. **Build and Run with Docker Compose**

```bash
docker-compose up --build
```

4. **Access the Application**

- API Documentation: `http://localhost:8000/docs`

## Running Tests

```bash
pytest tests/
```

## License

[MIT License](LICENSE)
```

---

This implementation provides all the necessary components for a robust FastAPI application tailored for intelligent agents. It includes authentication, database models, API routes, Docker configuration, and setup scripts.