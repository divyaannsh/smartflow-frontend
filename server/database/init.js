const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'project_manager.db');
const db = new sqlite3.Database(dbPath);

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          full_name TEXT NOT NULL,
          role TEXT DEFAULT 'member',
          avatar TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create projects table
      db.run(`
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'active',
          priority TEXT DEFAULT 'medium',
          deadline DATE,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `);

      // Create tasks table
      db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'todo',
          priority TEXT DEFAULT 'medium',
          deadline DATE,
          estimated_hours REAL,
          actual_hours REAL,
          project_id INTEGER,
          assigned_to INTEGER,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects (id),
          FOREIGN KEY (assigned_to) REFERENCES users (id),
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `);

      // Create comments table
      db.run(`
        CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT NOT NULL,
          task_id INTEGER,
          user_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks (id),
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Create project_members table
      db.run(`
        CREATE TABLE IF NOT EXISTS project_members (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER,
          user_id INTEGER,
          role TEXT DEFAULT 'member',
          joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects (id),
          FOREIGN KEY (user_id) REFERENCES users (id),
          UNIQUE(project_id, user_id)
        )
      `);

      // Insert default admin user
      const adminPassword = bcrypt.hashSync('admin123', 10);
      db.run(`
        INSERT OR IGNORE INTO users (username, email, password, full_name, role)
        VALUES ('admin', 'admin@example.com', ?, 'Administrator', 'admin')
      `, [adminPassword]);

      // Insert default user account
      const userPassword = bcrypt.hashSync('user123', 10);
      db.run(`
        INSERT OR IGNORE INTO users (username, email, password, full_name, role)
        VALUES ('user', 'user@example.com', ?, 'Regular User', 'member')
      `, [userPassword]);

      // Insert sample team members
      const teamMembers = [
        {
          username: 'john.doe',
          email: 'john.doe@example.com',
          password: 'john123',
          full_name: 'John Doe',
          role: 'manager'
        },
        {
          username: 'jane.smith',
          email: 'jane.smith@example.com',
          password: 'jane123',
          full_name: 'Jane Smith',
          role: 'member'
        },
        {
          username: 'mike.wilson',
          email: 'mike.wilson@example.com',
          password: 'mike123',
          full_name: 'Mike Wilson',
          role: 'member'
        },
        {
          username: 'sarah.jones',
          email: 'sarah.jones@example.com',
          password: 'sarah123',
          full_name: 'Sarah Jones',
          role: 'member'
        }
      ];

      teamMembers.forEach(member => {
        const hashedPassword = bcrypt.hashSync(member.password, 10);
        db.run(`
          INSERT OR IGNORE INTO users (username, email, password, full_name, role)
          VALUES (?, ?, ?, ?, ?)
        `, [member.username, member.email, hashedPassword, member.full_name, member.role]);
      });

      // Insert sample projects
      db.run(`
        INSERT OR IGNORE INTO projects (name, description, status, priority, deadline, created_by)
        VALUES ('Website Redesign', 'Complete redesign of company website', 'active', 'high', '2024-12-31', 1)
      `);

      db.run(`
        INSERT OR IGNORE INTO projects (name, description, status, priority, deadline, created_by)
        VALUES ('Mobile App Development', 'Develop new mobile application', 'active', 'critical', '2024-11-30', 1)
      `);

      db.run(`
        INSERT OR IGNORE INTO projects (name, description, status, priority, deadline, created_by)
        VALUES ('Database Migration', 'Migrate to new database system', 'active', 'medium', '2024-10-15', 1)
      `);

      // Insert sample tasks
      db.run(`
        INSERT OR IGNORE INTO tasks (title, description, status, priority, deadline, project_id, assigned_to, created_by, estimated_hours)
        VALUES ('Design Homepage', 'Create new homepage design', 'todo', 'high', '2024-09-15', 1, 2, 1, 8.0)
      `);

      db.run(`
        INSERT OR IGNORE INTO tasks (title, description, status, priority, deadline, project_id, assigned_to, created_by, estimated_hours)
        VALUES ('Implement User Authentication', 'Add login and registration features', 'in_progress', 'critical', '2024-09-20', 2, 3, 1, 12.0)
      `);

      db.run(`
        INSERT OR IGNORE INTO tasks (title, description, status, priority, deadline, project_id, assigned_to, created_by, estimated_hours)
        VALUES ('Database Schema Design', 'Design new database schema', 'review', 'medium', '2024-09-10', 3, 4, 1, 6.0)
      `);

      db.run(`
        INSERT OR IGNORE INTO tasks (title, description, status, priority, deadline, project_id, assigned_to, created_by, estimated_hours)
        VALUES ('API Development', 'Develop REST API endpoints', 'todo', 'high', '2024-09-25', 2, 2, 1, 16.0)
      `);

      db.run(`
        INSERT OR IGNORE INTO tasks (title, description, status, priority, deadline, project_id, assigned_to, created_by, estimated_hours)
        VALUES ('Testing and QA', 'Perform comprehensive testing', 'todo', 'medium', '2024-10-05', 1, 5, 1, 10.0)
      `);

      // Insert project members
      db.run(`
        INSERT OR IGNORE INTO project_members (project_id, user_id, role)
        VALUES (1, 1, 'admin')
      `);

      db.run(`
        INSERT OR IGNORE INTO project_members (project_id, user_id, role)
        VALUES (1, 2, 'manager')
      `);

      db.run(`
        INSERT OR IGNORE INTO project_members (project_id, user_id, role)
        VALUES (1, 3, 'member')
      `);

      db.run(`
        INSERT OR IGNORE INTO project_members (project_id, user_id, role)
        VALUES (2, 1, 'admin')
      `);

      db.run(`
        INSERT OR IGNORE INTO project_members (project_id, user_id, role)
        VALUES (2, 2, 'manager')
      `);

      db.run(`
        INSERT OR IGNORE INTO project_members (project_id, user_id, role)
        VALUES (2, 4, 'member')
      `);

      db.run(`
        INSERT OR IGNORE INTO project_members (project_id, user_id, role)
        VALUES (3, 1, 'admin')
      `);

      db.run(`
        INSERT OR IGNORE INTO project_members (project_id, user_id, role)
        VALUES (3, 5, 'member')
      `);

      db.run('PRAGMA foreign_keys = ON');
      
      resolve();
    });
  });
}

function getDatabase() {
  return db;
}

module.exports = {
  initializeDatabase,
  getDatabase
}; 