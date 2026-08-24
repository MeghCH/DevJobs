from fastapi import FastAPI
from pydantic import BaseModel
from llama_cpp import Llama
from fastapi.middleware.cors import CORSMiddleware
import re

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "./models/qwen2.5-0.5b-instruct-q5_0.gguf"

try:
    llm = Llama(
        model_path=MODEL_PATH,
        n_ctx=1024,
        n_threads=4,
        verbose=False
    )
    print("Agent chargé avec succès !")

except Exception as e:
    print(f"Erreur lors du chargement : {e}")

class JobData(BaseModel):
    description: str


def clean_text(text: str):
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()[:700]


def safe_response(text: str):
    text = text.strip()

    # Supprime caractères bizarres
    text = re.sub(r"[\n\r\t]", " ", text)

    # Supprime répétitions
    text = re.sub(r"\s+", " ", text)

    return text


@app.post("/analyze")
async def analyze(data: JobData):
    desc = clean_text(data.description)
    

    prompt = (
        f"<|im_start|>system\nTu es un extracteur de données techniques. Extraits toutes les technologies, langages et frameworks mentionnés. Réponds uniquement par une liste séparée par des virgules.<|im_end|>\n"
        f"<|im_start|>user\nOffre : {desc}\nExtraire toutes les technos :<|im_end|>\n"
        f"<|im_start|>assistant\n"
    )

    output = llm(
        prompt,
        max_tokens=60, 
        temperature=0,
        repeat_penalty=1.2,
   
        stop=["<|im_end|>", "\n\n", "Offre:"] 
    )

    res = safe_response(output["choices"][0]["text"])
    
  
    raw_list = res.split(",")
    technos = [t.strip().capitalize() for t in raw_list if len(t.strip()) > 1]
    
   
    unique_technos = list(dict.fromkeys(technos))

    return {"analysis": unique_technos if unique_technos else ["Non détecté"]}


@app.post("/summarize")
async def summarize(data: JobData):
    desc = clean_text(data.description)

    prompt = (
        f"<|im_start|>system\n"
        f"You MUST output EXACTLY this format:\n"
        f"[Role]. Tech: [stack]. Domain: [sector]. [Location].\n"
        f"Example: Data Analyst. Tech: Python, SQL. Domain: Énergie. Paris, TÉLÉTRAVAIL.\n\n"
        f"FORBIDDEN OUTPUT (will be rejected):\n"
        f"- 'Ce poste consiste à'\n"
        f"- 'Référence :'\n"
        f"- 'Job Title:'\n"
        f"- 'Non spécifié'\n"
        f"- 'Offre d'emploi'\n"
        f"- Any line starting with a JSON key name\n\n"
        f"You are a technical recruiter. Be concise (max 30 words).\n"
        f"<|im_end|>\n"
        f"<|im_start|>user\n"
        f"Summarize this job (respond ONLY in the format above, nothing else):\n{desc}<|im_end|>\n"
        f"<|im_start|>assistant\n"
    )
    output = llm(
        prompt,
        max_tokens=50,
        temperature=0.2,
        stop=["<|im_end|>", "\n"]
    )

    res = safe_response(output["choices"][0]["text"])


    if "." in res:
        res = res[:res.rfind(".")+1]
        
    return {"summary": "Ce poste consiste à " + res}