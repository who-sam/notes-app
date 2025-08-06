import os
import uuid
import sqlite3
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# SQLite database configuration
DATABASE_PATH = os.getenv('DATABASE_PATH', 'notes.db')

# Create database and table if not exists
with sqlite3.connect(DATABASE_PATH) as conn:
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            title TEXT,
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    # Add trigger for automatic updated_at (since SQLite doesn't support ON UPDATE)
    cursor.execute('''
        CREATE TRIGGER IF NOT EXISTS update_notes_timestamp
        AFTER UPDATE ON notes
        BEGIN
            UPDATE notes SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
        END;
    ''')
    conn.commit()

# Database connection helper
def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # Enable dictionary-like row access
    return conn

@app.route('/api/notes', methods=['GET'])
def get_notes():
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, title, content, "
                "strftime('%Y-%m-%dT%H:%M:%SZ', created_at) as created_at, "
                "strftime('%Y-%m-%dT%H:%M:%SZ', updated_at) as updated_at "
                "FROM notes ORDER BY updated_at DESC"
            )
            notes = cursor.fetchall()
            return jsonify([{
                'id': n['id'],
                'title': n['title'],
                'content': n['content'],
                'createdAt': n['created_at'],
                'updatedAt': n['updated_at']
            } for n in notes])
    except Exception as e:
        app.logger.error(f"Database error: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@app.route('/api/notes', methods=['POST'])
def create_note():
    try:
        data = request.get_json()
        note_id = str(uuid.uuid4())

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO notes (id, title, content) "
                "VALUES (?, ?, ?)",
                (note_id, data['title'], data['content'])
            )
            conn.commit()

            cursor.execute(
                "SELECT id, title, content, "
                "strftime('%Y-%m-%dT%H:%M:%SZ', created_at) as created_at, "
                "strftime('%Y-%m-%dT%H:%M:%SZ', updated_at) as updated_at "
                "FROM notes WHERE id = ?",
                (note_id,)
            )
            note = cursor.fetchone()

            return jsonify({
                'id': note['id'],
                'title': note['title'],
                'content': note['content'],
                'createdAt': note['created_at'],
                'updatedAt': note['updated_at']
            }), 201
    except Exception as e:
        app.logger.error(f"Create error: {str(e)}")
        return jsonify({'error': 'Failed to create note'}), 500

@app.route('/api/notes/<string:note_id>', methods=['PUT'])
def update_note(note_id):
    try:
        data = request.get_json()

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE notes SET title = ?, content = ? "
                "WHERE id = ?",
                (data['title'], data['content'], note_id)
            )
            if cursor.rowcount == 0:
                return jsonify({'error': 'Note not found'}), 404
            conn.commit()

            cursor.execute(
                "SELECT id, title, content, "
                "strftime('%Y-%m-%dT%H:%M:%SZ', created_at) as created_at, "
                "strftime('%Y-%m-%dT%H:%M:%SZ', updated_at) as updated_at "
                "FROM notes WHERE id = ?",
                (note_id,)
            )
            note = cursor.fetchone()

            return jsonify({
                'id': note['id'],
                'title': note['title'],
                'content': note['content'],
                'createdAt': note['created_at'],
                'updatedAt': note['updated_at']
            })
    except Exception as e:
        app.logger.error(f"Update error: {str(e)}")
        return jsonify({'error': 'Failed to update note'}), 500

@app.route('/api/notes/<string:note_id>', methods=['DELETE'])
def delete_note(note_id):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "DELETE FROM notes WHERE id = ?",
                (note_id,)
            )
            if cursor.rowcount == 0:
                return jsonify({'error': 'Note not found'}), 404
            conn.commit()
            return jsonify({'message': 'Note deleted successfully'})
    except Exception as e:
        app.logger.error(f"Delete error: {str(e)}")
        return jsonify({'error': 'Failed to delete note'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
