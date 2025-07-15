import os
import uuid
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
from pymysql.cursors import DictCursor

app = Flask(__name__)
CORS(app)

# Database connection
def get_db():
    return pymysql.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME'),
        charset='utf8mb4',
        cursorclass=DictCursor
    )

@app.route('/api/notes', methods=['GET'])
def get_notes():
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT id, title, content, created_at, updated_at "
                    "FROM notes ORDER BY updated_at DESC"
                )
                notes = cursor.fetchall()
                # Convert to camelCase for frontend
                return jsonify([{
                    'id': n['id'],
                    'title': n['title'],
                    'content': n['content'],
                    'createdAt': n['created_at'].isoformat(),
                    'updatedAt': n['updated_at'].isoformat()
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
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO notes (id, title, content) "
                    "VALUES (%s, %s, %s)",
                    (note_id, data['title'], data['content'])
                )
                conn.commit()
                
                # Fetch created note
                cursor.execute(
                    "SELECT id, title, content, created_at, updated_at "
                    "FROM notes WHERE id = %s", 
                    (note_id,)
                )
                note = cursor.fetchone()
                
                return jsonify({
                    'id': note['id'],
                    'title': note['title'],
                    'content': note['content'],
                    'createdAt': note['created_at'].isoformat(),
                    'updatedAt': note['updated_at'].isoformat()
                }), 201
    except Exception as e:
        app.logger.error(f"Create error: {str(e)}")
        return jsonify({'error': 'Failed to create note'}), 500

@app.route('/api/notes/<string:note_id>', methods=['PUT'])
def update_note(note_id):
    try:
        data = request.get_json()
        
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "UPDATE notes SET title = %s, content = %s "
                    "WHERE id = %s",
                    (data['title'], data['content'], note_id)
                )
                if cursor.rowcount == 0:
                    return jsonify({'error': 'Note not found'}), 404
                conn.commit()
                
                # Fetch updated note
                cursor.execute(
                    "SELECT id, title, content, created_at, updated_at "
                    "FROM notes WHERE id = %s", 
                    (note_id,)
                )
                note = cursor.fetchone()
                
                return jsonify({
                    'id': note['id'],
                    'title': note['title'],
                    'content': note['content'],
                    'createdAt': note['created_at'].isoformat(),
                    'updatedAt': note['updated_at'].isoformat()
                })
    except Exception as e:
        app.logger.error(f"Update error: {str(e)}")
        return jsonify({'error': 'Failed to update note'}), 500

@app.route('/api/notes/<string:note_id>', methods=['DELETE'])
def delete_note(note_id):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "DELETE FROM notes WHERE id = %s", 
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
