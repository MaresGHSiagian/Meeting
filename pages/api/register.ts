import type { NextApiRequest, NextApiResponse } from "next"
import mysql from "mysql2/promise"

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "", // ganti jika password root Anda berbeda
  database: "meetdb",
}

const pool = mysql.createPool(dbConfig)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()

  const { name, email, password, initials } = req.body

  if (!name || !email || !password || !initials) {
    return res.status(400).json({ error: "Missing fields" })
  }

  let conn
  try {
    conn = await pool.getConnection()
    // Cek email sudah ada
    const [rows]: any = await conn.execute("SELECT id FROM users WHERE email = ?", [email])
    if (rows.length > 0) {
      conn.release()
      return res.status(409).json({ error: "Email already registered" })
    }
    // Simpan user baru
    await conn.execute(
      "INSERT INTO users (name, email, password, initials) VALUES (?, ?, ?, ?)",
      [name, email, password, initials]
    )
    conn.release()
    return res.status(201).json({ message: "User registered" })
  } catch (err) {
    if (conn) conn.release()
    // console.error(err) // opsional: log error
    return res.status(500).json({ error: "Database error" })
  }
}

// Salah (jangan lakukan di luar event handler!)
// const userId = `user_${Date.now()}`;

// Benar (hanya di dalam handleSubmit)
const user = {
  id: `user_${Date.now()}`,
  // ...existing code...
}
