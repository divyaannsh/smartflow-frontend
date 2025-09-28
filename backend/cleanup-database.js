const { getDatabase } = require('./database/init');

async function cleanupDatabase() {
  try {
    console.log('🔄 Starting database cleanup...');
    const db = getDatabase();
    
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // Start transaction
        db.run('BEGIN TRANSACTION');
        
        console.log('🗑️  Deleting all tasks...');
        db.run('DELETE FROM tasks', [], function(err) {
          if (err) {
            console.error('❌ Error deleting tasks:', err);
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          console.log(`✅ Deleted ${this.changes} tasks`);
          
          console.log('🗑️  Deleting all projects...');
          db.run('DELETE FROM projects', [], function(err) {
            if (err) {
              console.error('❌ Error deleting projects:', err);
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            console.log(`✅ Deleted ${this.changes} projects`);
            
            console.log('🗑️  Deleting all notifications...');
            db.run('DELETE FROM notifications', [], function(err) {
              if (err) {
                console.error('❌ Error deleting notifications:', err);
                db.run('ROLLBACK');
                reject(err);
                return;
              }
              console.log(`✅ Deleted ${this.changes} notifications`);
              
              console.log('🗑️  Deleting all comments...');
              db.run('DELETE FROM comments', [], function(err) {
                if (err) {
                  console.error('❌ Error deleting comments:', err);
                  db.run('ROLLBACK');
                  reject(err);
                  return;
                }
                console.log(`✅ Deleted ${this.changes} comments`);
                
                console.log('🗑️  Deleting all project members...');
                db.run('DELETE FROM project_members', [], function(err) {
                  if (err) {
                    console.error('❌ Error deleting project members:', err);
                    db.run('ROLLBACK');
                    reject(err);
                    return;
                  }
                  console.log(`✅ Deleted ${this.changes} project members`);
                  
                  // Reset auto-increment counters
                  console.log('🔄 Resetting auto-increment counters...');
                  db.run('DELETE FROM sqlite_sequence WHERE name IN ("projects", "tasks", "notifications", "comments", "project_members")', [], function(err) {
                    if (err) {
                      console.error('❌ Error resetting auto-increment:', err);
                      db.run('ROLLBACK');
                      reject(err);
                      return;
                    }
                    console.log('✅ Reset auto-increment counters');
                    
                    // Commit transaction
                    db.run('COMMIT', function(err) {
                      if (err) {
                        console.error('❌ Error committing transaction:', err);
                        reject(err);
                        return;
                      }
                      console.log('✅ Database cleanup completed successfully!');
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
  } catch (error) {
    console.error('❌ Error in cleanup:', error);
    throw error;
  }
}

// Run cleanup if this file is executed directly
if (require.main === module) {
  cleanupDatabase()
    .then(() => {
      console.log('🎉 Cleanup finished!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupDatabase };
