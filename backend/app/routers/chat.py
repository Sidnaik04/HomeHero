from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

from app.core.database import get_db
from app.models.chatHistory import ChatHistory
from app.models.user import User
from app.core.dependencies import get_current_user
from app.services.gemini_service import GeminiService
from app.utils.query_parser import QueryParser
import logging

logger = logging.getLogger(__name__)
from app.models.provider import Provider
from sqlalchemy import select
from uuid import UUID

router = APIRouter(prefix="/api/chat", tags=["Chat"])


class ChatQueryRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatMessage(BaseModel):
    message: str
    sender: str
    timestamp: str


class ChatQueryResponse(BaseModel):
    session_id: str
    intent: str
    message: str
    extracted_data: Optional[dict] = None
    suggested_providers: Optional[List[dict]] = None
    next_action: str
    conversation: List[ChatMessage]


@router.post("/query", response_model=ChatQueryResponse)
def chat_query(
    request: ChatQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        # generate or use existing session ID
        session_id = request.session_id or str(uuid.uuid4())

        # save user message
        user_chat = ChatHistory(
            user_id=current_user.id,
            session_id=session_id,
            message=request.message,
            sender="user",
        )
        db.add(user_chat)
        db.commit()

        # Get conversation history
        history = (
            db.query(ChatHistory)
            .filter(
                ChatHistory.user_id == current_user.id,
                ChatHistory.session_id == session_id,
            )
            .order_by(ChatHistory.created_at.asc())
            .all()
        )

        conversation_history = [
            {"sender": h.sender, "message": h.message} for h in history
        ]

        # Step 1: Extract intent using basic parsing
        detected_service = QueryParser.detect_service(request.message)
        detected_location = QueryParser.detect_location(request.message)
        detected_budget = QueryParser.detect_budget(request.message)
        detected_urgency = QueryParser.detect_urgency(request.message)

        # Step 2: Search providers based on extracted data
        providers_data = QueryParser.search_providers(
            db=db,
            service_type=detected_service,
            location=detected_location,
            max_budget=detected_budget,
            min_rating=3.0 if detected_urgency == "urgent" else 0.0,
        )

        # Step 3: Use Gemini to generate intelligent response
        ai_result = GeminiService.extract_intent_and_data(
            user_message=request.message, providers_data=providers_data
        )

        if ai_result["success"]:
            ai_data = ai_result["data"]
        else:
            # Use fallback
            ai_data = ai_result.get(
                "fallback",
                {
                    "intent": "general_query",
                    "message": "I'm here to help you find services. What do you need?",
                    "next_action": "ask_details",
                },
            )

        # Extract structured data
        extracted_data = ai_data.get("extracted_data", {})
        if detected_service:
            extracted_data["service_type"] = detected_service
        if detected_location:
            extracted_data["location"] = detected_location
        if detected_budget:
            extracted_data["budget"] = detected_budget

        # Prepare bot response message
        bot_message = ai_data.get("message", "How can I assist you today?")

        # If providers found, enhance message
        if providers_data:
            if len(providers_data) == 1:
                bot_message += f"\n\nI found {len(providers_data)} provider matching your requirements."
            else:
                bot_message += f"\n\nI found {len(providers_data)} providers matching your requirements."

        # Log provider search results for debugging
        try:
            logger.info(
                "Provider search results",
                extra={
                    "count": len(providers_data),
                    "sample": providers_data[0] if providers_data else None,
                },
            )
        except Exception:
            logger.debug("Provider search logging failed")

        # Save bot response
        bot_chat = ChatHistory(
            user_id=current_user.id,
            session_id=session_id,
            message=bot_message,
            sender="bot",
            intent=ai_data.get("intent"),
            extracted_data=extracted_data,
        )
        db.add(bot_chat)
        db.commit()

        # Prepare conversation for response
        updated_history = (
            db.query(ChatHistory)
            .filter(
                ChatHistory.user_id == current_user.id,
                ChatHistory.session_id == session_id,
            )
            .order_by(ChatHistory.created_at.asc())
            .all()
        )

        conversation = [
            ChatMessage(
                message=h.message, sender=h.sender, timestamp=h.created_at.isoformat()
            )
            for h in updated_history
        ]

        # Prefer AI-provided suggestions if AI returned explicit provider IDs or names
        ai_suggestions = (
            ai_data.get("suggested_providers") if isinstance(ai_data, dict) else None
        )
        chosen = (
            ai_suggestions
            if ai_suggestions
            else (providers_data[:5] if providers_data else None)
        )

        # Normalize suggestions to list of dicts expected by response model
        normalized_suggestions = None
        if chosen:
            normalized = []
            for item in chosen:
                try:
                    # If model already returned a dict, use it
                    if isinstance(item, dict):
                        normalized.append(item)
                        continue

                    # If it's a string, try to match known providers (from providers_data)
                    if isinstance(item, str):
                        matched = None
                        for p in providers_data:
                            # match by provider_id or name (case-insensitive contains)
                            if p.get("provider_id") == item:
                                matched = p
                                break
                            if p.get("name") and (
                                item.lower() == p.get("name").lower()
                                or item.lower() in p.get("name").lower()
                            ):
                                matched = p
                                break

                        if matched:
                            normalized.append(matched)
                            continue

                        # attempt DB lookup by UUID
                        try:
                            uid = UUID(item)
                            stmt = select(Provider).where(Provider.provider_id == uid)
                            db_provider = db.execute(stmt).scalars().first()
                            if db_provider:
                                normalized.append(
                                    {
                                        "provider_id": str(db_provider.provider_id),
                                        "name": (
                                            db_provider.user.name
                                            if db_provider.user
                                            else None
                                        ),
                                        "location": (
                                            db_provider.user.location
                                            if db_provider.user
                                            else None
                                        ),
                                        "services": db_provider.services,
                                        "pricing": float(db_provider.pricing),
                                        "rating": float(db_provider.rating),
                                    }
                                )
                                continue
                        except Exception:
                            # not a UUID or DB lookup failed
                            pass

                        # fallback: present as name-only dict
                        normalized.append({"name": item})
                    else:
                        # unknown type: string-ify
                        normalized.append({"name": str(item)})
                except Exception:
                    # keep processing even if one item fails
                    try:
                        normalized.append({"name": str(item)})
                    except Exception:
                        continue

            normalized_suggestions = normalized if normalized else None

        # Determine next action: prefer AI's decision if present
        final_next_action = (
            ai_data.get("next_action")
            if ai_data.get("next_action")
            else ("show_providers" if providers_data else "ask_details")
        )

        return ChatQueryResponse(
            session_id=session_id,
            intent=ai_data.get("intent", "general_query"),
            message=bot_message,
            extracted_data=extracted_data if extracted_data else None,
            suggested_providers=normalized_suggestions,
            next_action=final_next_action,
            conversation=conversation,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat processing failed: {str(e)}",
        )


@router.get("/history/{session_id}")
def get_chat_history(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    history = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.user_id == current_user.id,
            ChatHistory.session_id == session_id,
        )
        .order_by(ChatHistory.created_at.asc())
        .all()
    )

    return {
        "session_id": session_id,
        "conversation": [
            {
                "message": h.message,
                "sender": h.sender,
                "timestamp": h.created_at.isoformat(),
                "intent": h.intent,
                "extracted_data": h.extracted_data,
            }
            for h in history
        ],
    }


@router.get("/sessions")
def get_user_sessions(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):

    from sqlalchemy import func

    sessions = (
        db.query(
            ChatHistory.session_id,
            func.min(ChatHistory.created_at).label("started_at"),
            func.max(ChatHistory.created_at).label("last_message_at"),
            func.count(ChatHistory.chat_id).label("message_count"),
        )
        .filter(ChatHistory.user_id == current_user.id)
        .group_by(ChatHistory.session_id)
        .order_by(func.max(ChatHistory.created_at).desc())
        .all()
    )

    return {
        "sessions": [
            {
                "session_id": s.session_id,
                "started_at": s.started_at.isoformat(),
                "last_message_at": s.last_message_at.isoformat(),
                "message_count": s.message_count,
            }
            for s in sessions
        ]
    }
