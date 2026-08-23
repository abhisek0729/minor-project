from datetime import datetime, timedelta
from collections import defaultdict
from sqlalchemy import select
from app.models.base import Expense

async def list_expenses(db, user_id: int, days: int = 30):
    since = datetime.utcnow() - timedelta(days=days)
    q = select(Expense).where(Expense.user_id == user_id, Expense.created_at >= since).order_by(Expense.created_at.desc())
    return list((await db.scalars(q)).all())

def summarize(expenses):
    by_type = defaultdict(int)
    total = 0
    active_days = set()
    for e in expenses:
        total += e.amount
        by_type[e.type] += e.amount
        if e.created_at:
            active_days.add(e.created_at.date())
    daily = total / max(1, len(active_days))
    return total, dict(by_type), daily
