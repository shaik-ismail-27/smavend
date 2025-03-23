const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async create({ username, password, email, role = 'user' }) {
        try {
            // Validate input
            if (!username || !password || !email) {
                throw new Error('Missing required fields');
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user
            const query = `
                INSERT INTO users (username, password, email, role, created_at)
                VALUES ($1, $2, $3, $4, NOW())
                RETURNING id, username, email, role, created_at;
            `;
            const values = [username, hashedPassword, email, role];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                throw new Error('Username or email already exists');
            }
            throw error;
        }
    }

    static async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1;';
        const result = await pool.query(query, [username]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = 'SELECT id, username, email, role, created_at FROM users WHERE id = $1;';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async updateProfile(id, { username, email }) {
        const query = `
            UPDATE users
            SET username = COALESCE($1, username),
                email = COALESCE($2, email),
                updated_at = NOW()
            WHERE id = $3
            RETURNING id, username, email, role, created_at, updated_at;
        `;
        const result = await pool.query(query, [username, email, id]);
        return result.rows[0];
    }

    static async changePassword(id, newPassword) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        const query = `
            UPDATE users
            SET password = $1,
                updated_at = NOW()
            WHERE id = $2;
        `;
        await pool.query(query, [hashedPassword, id]);
    }
}

module.exports = User; 