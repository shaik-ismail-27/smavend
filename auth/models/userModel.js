const { Pool } = require("pg");

const pool = new Pool({
    user: "ismail_role",
    host: "localhost",
    database: "auth_db",
    password: "role",
    port: 5432,
});
const pool1 = new Pool({
    user: "ismail_role",
    host: "localhost",
    database: "app_db",
    password: "role",
    port: 5432,
});
module.exports = {
    async createUser(username, hashedPassword) {
        const query = "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id;";
        const values = [username, hashedPassword];
        const result = await pool.query(query, values);
        return result.rows[0].id;
    },

    async findUserByUsername(username) {
        const query = "SELECT * FROM users WHERE username = $1;";
        const values = [username];
        const result = await pool.query(query, values);
        return result.rows[0];
    },
    async delete(rollno){
        const deleteResult = await pool1.query("DELETE FROM myTable WHERE rollno = $1;", [rollno]);
        return deleteResult;

    },
    async getData() {
        try {
            const result = await pool1.query("SELECT name, rollno FROM myTable;");
            console.log(result.rows); // Logs rows to the console
            return result.rows;      // Return the rows
        } catch (error) {
            console.error("Error executing query:", error);
            throw error; // Re-throw the error to be handled by the caller
        }
    }
};
