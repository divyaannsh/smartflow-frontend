const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use the same database path as the main app
const dbPath = process.env.DB_FILE
  ? process.env.DB_FILE
  : (process.env.NODE_ENV === 'production'
      ? '/tmp/project_manager.db'
      : path.join(__dirname, 'database/project_manager.db'));

console.log('🗄️  Database path:', dbPath);

function cleanupDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err.message);
        reject(err);
        return;
      }
      
      console.log('✅ Database opened successfully');
      
      db.serialize(() => {
        // Start transaction
        db.run('BEGIN TRANSACTION');
        
        console.log('🗑️  Deleting all tasks...');
        db.run('DELETE FROM tasks', [], function(err) {
          if (err) {
            console.error('❌ Error deleting tasks:', err.message);
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          console.log(`✅ Deleted ${this.changes} tasks`);
          
          console.log('🗑️  Deleting all projects...');
          db.run('DELETE FROM projects', [], function(err) {
            if (err) {
              console.error('❌ Error deleting projects:', err.message);
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            console.log(`✅ Deleted ${this.changes} projects`);
            
            console.log('🗑️  Deleting all notifications...');
            db.run('DELETE FROM notifications', [], function(err) {
              if (err) {
                console.error('❌ Error deleting notifications:', err.message);
                db.run('ROLLBACK');
                reject(err);
                return;
              }
              console.log(`✅ Deleted ${this.changes} notifications`);
              
              console.log('🗑️  Deleting all comments...');
              db.run('DELETE FROM comments', [], function(err) {
                if (err) {
                  console.error('❌ Error deleting comments:', err.message);
                  db.run('ROLLBACK');
                  reject(err);
                  return;
                }
                console.log(`✅ Deleted ${this.changes} comments`);
                
                console.log('🗑️  Deleting all project members...');
                db.run('DELETE FROM project_members', [], function(err) {
                  if (err) {
                    console.error('❌ Error deleting project members:', err.message);
                    db.run('ROLLBACK');
                    reject(err);
                    return;
                  }
                  console.log(`✅ Deleted ${this.changes} project members`);
                  
                  // Reset auto-increment counters
                  console.log('🔄 Resetting auto-increment counters...');
                  db.run('DELETE FROM sqlite_sequence WHERE name IN ("projects", "tasks", "notifications", "comments", "project_members")', [], function(err) {
                    if (err) {
                      console.error('❌ Error resetting auto-increment:', err.message);
                      db.run('ROLLBACK');
                      reject(err);
                      return;
                    }
                    console.log('✅ Reset auto-increment counters');
                    
                    // Commit transaction
                    db.run('COMMIT', function(err) {
                      if (err) {
                        console.error('❌ Error committing transaction:', err.message);
                        reject(err);
                        return;
                      }
                      console.log('✅ Database cleanup completed successfully!');
                      
                      // Close database
                      db.close((err) => {
                        if (err) {
                          console.error('❌ Error closing database:', err.message);
                        } else {
                          console.log('✅ Database closed');
                        }
                        resolve();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

// Run cleanup
cleanupDatabase()
  .then(() => {
    console.log('🎉 Cleanup finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });
