import os
import math
import re
import hashlib
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np
from app.config import settings

# Attempt ChromaDB import
try:
    import chromadb
    from chromadb.api.types import EmbeddingFunction
    CHROMA_AVAILABLE = True
except Exception:
    CHROMA_AVAILABLE = False
    class EmbeddingFunction:
        pass


class LocalFastEmbeddingFunction(EmbeddingFunction):
    """
    Fast, deterministic, zero-network embedding function compatible with ChromaDB.
    Eliminates external model downloads from HuggingFace and guarantees instant response.
    """
    def __init__(self, dim: int = 128):
        self.dim = dim

    def name(self) -> str:
        return "LocalFastEmbeddingFunction"

    def __call__(self, input: List[str]) -> List[List[float]]:
        embeddings = []
        for text in input:
            vec = np.zeros(self.dim, dtype=np.float32)
            words = re.findall(r"\b[a-zA-Z0-9_\-\.]{2,}\b", text.lower())
            for w in words:
                h = int(hashlib.md5(w.encode("utf-8")).hexdigest(), 16) % self.dim
                vec[h] += 1.0
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            embeddings.append(vec.tolist())
        return embeddings


class FallbackVectorIndex:
    """
    Lightweight, deterministic local in-memory vector index based on TF-IDF
    and cosine similarity.
    """
    def __init__(self):
        self.documents: Dict[str, Dict[str, Any]] = {}
        self.vocabulary: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}

    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r"\b[a-zA-Z0-9_\-\.]{2,}\b", text.lower())
        return words

    def add_document(self, doc_id: str, text: str, metadata: Dict[str, Any]):
        tokens = self._tokenize(text)
        self.documents[doc_id] = {
            "id": doc_id,
            "text": text,
            "metadata": metadata,
            "tokens": tokens
        }
        self._recompute_idf()

    def _recompute_idf(self):
        total_docs = len(self.documents)
        if total_docs == 0:
            return
        doc_freq: Dict[str, int] = {}
        for doc in self.documents.values():
            unique_tokens = set(doc["tokens"])
            for t in unique_tokens:
                doc_freq[t] = doc_freq.get(t, 0) + 1

        self.idf = {t: math.log((total_docs + 1) / (df + 1)) + 1.0 for t, df in doc_freq.items()}

    def _vectorize(self, tokens: List[str]) -> Dict[str, float]:
        tf: Dict[str, float] = {}
        for t in tokens:
            tf[t] = tf.get(t, 0.0) + 1.0
        
        vec: Dict[str, float] = {}
        norm_sq = 0.0
        for t, count in tf.items():
            val = (1.0 + math.log(count)) * self.idf.get(t, 1.0)
            vec[t] = val
            norm_sq += val * val
        
        norm = math.sqrt(norm_sq) if norm_sq > 0 else 1.0
        return {k: v / norm for k, v in vec.items()}

    def query(self, query_text: str, n_results: int = 5) -> List[Dict[str, Any]]:
        q_tokens = self._tokenize(query_text)
        if not q_tokens or not self.documents:
            return []
        
        q_vec = self._vectorize(q_tokens)
        scored: List[tuple[float, Dict[str, Any]]] = []

        for doc_id, doc in self.documents.items():
            d_vec = self._vectorize(doc["tokens"])
            score = sum(q_vec.get(term, 0.0) * d_weight for term, d_weight in d_vec.items())
            
            subsystem = doc["metadata"].get("subsystem", "").lower()
            if subsystem and subsystem in query_text.lower():
                score += 0.25
            
            scored.append((score, doc))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, doc in scored[:n_results]:
            normalized_score = min(0.98, max(0.45, score if score > 0 else 0.50))
            results.append({
                "id": doc["id"],
                "text": doc["text"],
                "metadata": doc["metadata"],
                "similarity": round(normalized_score, 3)
            })
        return results


class RAGService:
    def __init__(self):
        self.chroma_client = None
        self.collection = None
        self.embedding_fn = LocalFastEmbeddingFunction()
        self.fallback_index = FallbackVectorIndex()
        self._init_vector_store()

    def _init_vector_store(self):
        os.makedirs(settings.VECTOR_DB_PATH, exist_ok=True)
        if CHROMA_AVAILABLE:
            try:
                self.chroma_client = chromadb.PersistentClient(path=settings.VECTOR_DB_PATH)
                self.collection = self.chroma_client.get_or_create_collection(
                    name=settings.CHROMA_COLLECTION_NAME,
                    embedding_function=self.embedding_fn,
                    metadata={"hnsw:space": "cosine"}
                )
            except Exception as e:
                print(f"[RAGService] ChromaDB initialization notice: {e}. Utilizing built-in resilient vector store.")
                self.chroma_client = None
                self.collection = None

    def index_document(self, doc_id: str, text: str, metadata: Dict[str, Any]):
        self.fallback_index.add_document(doc_id, text, metadata)

        if self.collection is not None:
            try:
                clean_meta = {}
                for k, v in metadata.items():
                    if isinstance(v, (str, int, float, bool)):
                        clean_meta[k] = v
                    elif isinstance(v, list):
                        clean_meta[k] = ", ".join(str(i) for i in v)
                    else:
                        clean_meta[k] = str(v)

                self.collection.upsert(
                    ids=[doc_id],
                    documents=[text],
                    metadatas=[clean_meta]
                )
            except Exception as e:
                print(f"[RAGService] ChromaDB upsert warning for {doc_id}: {e}")

    def query(self, query_text: str, n_results: int = 5, doc_type_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        if self.collection is not None:
            try:
                where_filter = None
                if doc_type_filter:
                    where_filter = {"doc_type": doc_type_filter}

                results = self.collection.query(
                    query_texts=[query_text],
                    n_results=n_results,
                    where=where_filter
                )
                
                out = []
                if results and "ids" in results and results["ids"] and len(results["ids"][0]) > 0:
                    ids = results["ids"][0]
                    docs = results["documents"][0] if "documents" in results else [""] * len(ids)
                    metas = results["metadatas"][0] if "metadatas" in results else [{}] * len(ids)
                    distances = results["distances"][0] if "distances" in results and results["distances"] else [0.2] * len(ids)

                    for i in range(len(ids)):
                        dist = distances[i] if i < len(distances) else 0.2
                        similarity = max(0.50, min(0.99, 1.0 - (dist / 2.0)))
                        out.append({
                            "id": ids[i],
                            "text": docs[i],
                            "metadata": metas[i],
                            "similarity": round(similarity, 3)
                        })
                    return out
            except Exception as e:
                print(f"[RAGService] ChromaDB query error: {e}. Falling back to resilient vector index.")

        res = self.fallback_index.query(query_text, n_results=n_results)
        if doc_type_filter:
            res = [r for r in res if r["metadata"].get("doc_type") == doc_type_filter]
        return res

rag_service = RAGService()
