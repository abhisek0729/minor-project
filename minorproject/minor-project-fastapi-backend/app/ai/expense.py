from app.services.expense_service import list_expenses, summarize
from app.schemas.ai import ExpenseInsightResponse

async def expense_insights(db, user_id, days):
    expenses = await list_expenses(db, user_id, days)
    total, by_type, daily = summarize(expenses)
    insights = []
    if by_type:
        top = max(by_type, key=by_type.get)
        insights.append(f"Your largest expense category is {top}.")
    if total:
        insights.append(f"You spent {total} in the last {days} days.")
    if daily:
        insights.append(f"Average spending is about {daily:.2f} per active spending day.")
    return ExpenseInsightResponse(total_spend=total, by_type=by_type, daily_average=daily, budget_warning=None, insights=insights)
