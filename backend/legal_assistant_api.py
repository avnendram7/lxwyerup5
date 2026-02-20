
import os
import joblib
import ollama
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from transformers import pipeline

# --- CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LEGAL_ASSISTANT_DIR = os.path.join(BASE_DIR, '../Legal_Assistant-main')
DB_PATH = os.path.join(LEGAL_ASSISTANT_DIR, "chroma_db")
MODEL_PATH = os.path.join(LEGAL_ASSISTANT_DIR, "models")

print(f"--- ⚖️  INITIALIZING LEGAL ASSISTANT API ---")
print(f"📂 Base Dir: {BASE_DIR}")
print(f"📂 Models Dir: {MODEL_PATH}")

app = Flask(__name__)
CORS(app)

# Global Variables for Models
intent_model = None
intent_vec = None
sent_model = None
sent_vec = None
vector_db = None
safety_filter = None

def load_models():
    global intent_model, intent_vec, sent_model, sent_vec, vector_db, safety_filter
    
    # 1. Load Intent & Sentiment
    print("1️⃣  Loading Classifiers...")
    try:
        intent_model = joblib.load(os.path.join(MODEL_PATH, 'intent_model.pkl'))
        intent_vec = joblib.load(os.path.join(MODEL_PATH, 'intent_vectorizer.pkl'))
        sent_model = joblib.load(os.path.join(MODEL_PATH, 'sentiment_model.pkl')) # Changed from xgb to model
        sent_vec = joblib.load(os.path.join(MODEL_PATH, 'sentiment_vectorizer.pkl'))
    except FileNotFoundError as e:
        print(f"❌ Error: Models not found at {MODEL_PATH}. {e}")
        return False

    # 2. Load Vector DB
    print("2️⃣  Connecting to Legal Knowledge Base...")
    try:
        embed_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vector_db = Chroma(persist_directory=DB_PATH, embedding_function=embed_model)
    except Exception as e:
        print(f"❌ Error loading Vector DB: {e}")
        return False

    # 3. Load Safety Filter
    print("3️⃣  Activating Safety Protocols...")
    try:
        safety_filter = pipeline("text-classification", model="unitary/toxic-bert", top_k=None)
    except Exception as e:
         print(f"⚠️ Warning: Safety filter failed to load: {e}")

    print("✅ SYSTEM READY.")
    return True

# Initialize models on startup
if not load_models():
    print("CRITICAL ERROR: Failed to init models.")

# --- HELPER FUNCTIONS (Reused from main_assistant.py) ---

def get_recommendation(intent, sentiment):
    rec = "\n\n💡 **Next Steps:**"
    if sentiment == "URGENT 🚨":
        rec += "\n- Since this is urgent, please visit the nearest Police Station or Hospital immediately."
        rec += "\n- Call 100 (Police) or 1091 (Women Helpline) if you are in danger."
    if intent == "Criminal Law 👮":
        rec += "\n- Do not destroy any evidence (messages, recordings, documents)."
        rec += "\n- Consult a criminal defense lawyer before giving a written statement."
    elif intent == "Family/Civil 🏠":
        rec += "\n- Gather all property documents and marriage certificates."
    elif intent == "Corporate 💼":
        rec += "\n- Check the latest GST/MCA notifications on the official government portal."
        rec += "\n- Ensure all contracts are stamped and notarized."
    return rec

def _get_fallback_response(intent, query):
    """Provides a safe, rule-based fallback response when LLMs are unavailable."""
    if "Criminal" in intent:
        return f"**Basic Legal Information (Offline Mode):**\n\nRegarding **{query}**, under the Bharatiya Nyaya Sanhita (BNS) and CrPC, criminal matters are serious. \n\n1. **First Info Report (FIR):** This is the first step in criminal proceedings.\n2. **Bail:** Depending on the offense (bailable/non-bailable), bail may be a right or at court discretion.\n3. **Investigation:** Police have the power to investigate, and you have the right to counsel.\n\n*Note: This is a generated fallback response as the AI model is offline.*"
    elif "Family" in intent:
        return f"**Basic Legal Information (Offline Mode):**\n\nRegarding **{query}**, family laws in India are governed by personal laws (Hindu, Muslim, etc.) and secular laws.\n\n1. **Resolution:** Courts encourage mediation in family disputes.\n2. **Documentation:** Keep all relevant records (marriage certificates, property deeds).\n3. **Rights:** Both parties have specific rights regarding maintenance, custody, and property.\n\n*Note: This is a generated fallback response as the AI model is offline.*"
    else:
        return f"**Basic Legal Information (Offline Mode):**\n\nI've analyzed your query: **{query}**. \n\nWhile my advanced legal reasoning engine is currently offline, I can tell you that this area of law requires strict compliance with statutory timeframes and documentation. \n\nPlease consult a qualified advocate for specific advice."

@app.route('/api/chat/legal', methods=['POST'])
def chat_legal():
    data = request.json
    query = data.get('query', '')
    history = data.get('history', [])

    if not query:
        return jsonify({'error': 'No query provided'}), 400

    # --- STEP 1: INTENT CLASSIFICATION ---
    try:
        i_pred = intent_model.predict(intent_vec.transform([query]))[0]
        i_prob = intent_model.predict_proba(intent_vec.transform([query])).max()
        
        # Guardrails for Serious Keywords (Simplified from main_assistant)
        SERIOUS_ROOTS = {'kill', 'murder', 'rape', 'assault', 'theft', 'fraud', 'jail', 'arrest'}
        if any(root in query.lower() for root in SERIOUS_ROOTS):
            if i_pred == 3: # If classified as Greeting but has serious words
                i_pred = 0 # Force Criminal
        
        LABEL_MAP = {0: "Criminal Law 👮", 1: "Family/Civil 🏠", 2: "Corporate 💼", 3: "Greeting/Casual 💬"}
        intent_label = LABEL_MAP.get(i_pred, "General")

        # --- STEP 2: GREETING HANDLING ---
        if i_pred == 3:
            # Simple Greeting Response
            return jsonify({
                'response': "Hello! 👋 I'm your AI Legal Assistant. Ask me anything about Indian Law.",
                'intent': intent_label,
                'sentiment': 'Neutral 😐',
                'sources': []
            })

        # --- STEP 3: SENTIMENT ---
        s_pred = sent_model.predict(sent_vec.transform([query]))[0]
        SENTIMENT_MAP = {0: "Neutral 😐", 1: "URGENT 🚨", 2: "Positive 🟢"}
        sentiment_label = SENTIMENT_MAP.get(s_pred, "Neutral")

        # --- STEP 4: RAG SEARCH ---
        # Construct search query (simplified context rewrite for now)
        search_query = query 
        docs = vector_db.similarity_search(search_query, k=3)
        
        context_parts = []
        sources = []
        for doc in docs:
            context_parts.append(doc.page_content)
            src = doc.metadata.get('source', 'Legal Doc')
            if src not in sources:
                sources.append(os.path.basename(src))
        
        context = "\n\n---\n\n".join(context_parts) if context_parts else "No specific legal section found."

        # --- STEP 5: LLM GENERATION ---
        system_msg = {
            'role': 'system', 
            'content': """You are 'Advocate AI', a Senior Supreme Court Lawyer in India.
            - Answer based on the provided CONTEXT.
            - Cite specific Acts/Sections if in context.
            - Be professional and objective.
            - If context is missing, provide general legal knowledge but state it is general.
            - Format output with Markdown (bold, lists).
            """
        }
        user_msg = {'role': 'user', 'content': f"CONTEXT:\n{context}\n\nUSER QUESTION: {query}"}
        
        # Use history if provided (convert to ollama format)
        # simplified for this MVP: just send system + user
        
        try:
            response = ollama.chat(model='dolphin-llama3:8b', messages=[system_msg, user_msg])
            final_answer = response['message']['content']
        except Exception as e:
            # Fallback if Ollama fails (Simulates "working without it")
            final_answer = _get_fallback_response(intent_label, query)

        # --- STEP 6: RECOMMENDATION ---
        rec = get_recommendation(intent_label, sentiment_label)
        final_response = final_answer + rec

        return jsonify({
            'response': final_response,
            'intent': intent_label,
            'sentiment': sentiment_label,
            'sources': sources
        })

    except Exception as e:
        print(f"API Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
