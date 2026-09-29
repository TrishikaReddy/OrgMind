from app.database import get_connection


def save_memory(question: str, answer: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO memories(question, answer)
        VALUES (?, ?)
        """,
        (question, answer),
    )

    conn.commit()
    conn.close()


def get_recent_memories(limit=5):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT question, answer
        FROM memories
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,),
    )

    rows = cursor.fetchall()
    conn.close()

    return rows