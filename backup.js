const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database backup utility
class DatabaseBackup {
    constructor() {
        this.dbPath = path.join(__dirname, 'circle.db');
        this.backupPath = path.join(__dirname, 'backups');
        
        // Create backups directory if it doesn't exist
        if (!fs.existsSync(this.backupPath)) {
            fs.mkdirSync(this.backupPath, { recursive: true });
        }
    }

    // Create a backup of the database
    async createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(this.backupPath, `backup-${timestamp}.db`);
        
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            const backup = new sqlite3.Database(backupFile);
            
            db.backup(backup, (err) => {
                if (err) {
                    console.error('Backup failed:', err);
                    reject(err);
                } else {
                    console.log(`Backup created: ${backupFile}`);
                    resolve(backupFile);
                }
                
                db.close();
                backup.close();
            });
        });
    }

    // Export database as SQL
    async exportAsSQL() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const sqlFile = path.join(this.backupPath, `export-${timestamp}.sql`);
        
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            
            // Get all tables
            db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                let sqlContent = '';
                
                // Export each table
                tables.forEach((table, index) => {
                    db.all(`SELECT * FROM ${table.name}`, (err, rows) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        
                        sqlContent += `-- Table: ${table.name}\n`;
                        rows.forEach(row => {
                            const columns = Object.keys(row);
                            const values = Object.values(row).map(val => 
                                typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val
                            );
                            sqlContent += `INSERT INTO ${table.name} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
                        });
                        sqlContent += '\n';
                        
                        // Write file when all tables are processed
                        if (index === tables.length - 1) {
                            fs.writeFileSync(sqlFile, sqlContent);
                            console.log(`SQL export created: ${sqlFile}`);
                            resolve(sqlFile);
                            db.close();
                        }
                    });
                });
            });
        });
    }

    // List all backups
    listBackups() {
        const files = fs.readdirSync(this.backupPath);
        const backups = files.filter(file => file.endsWith('.db') || file.endsWith('.sql'));
        
        console.log('Available backups:');
        backups.forEach(backup => {
            const filePath = path.join(this.backupPath, backup);
            const stats = fs.statSync(filePath);
            console.log(`- ${backup} (${new Date(stats.mtime).toLocaleString()})`);
        });
        
        return backups;
    }

    // Restore from backup
    async restoreFromBackup(backupFile) {
        const backupPath = path.join(this.backupPath, backupFile);
        
        if (!fs.existsSync(backupPath)) {
            throw new Error(`Backup file not found: ${backupFile}`);
        }
        
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            const backup = new sqlite3.Database(backupPath);
            
            backup.backup(db, (err) => {
                if (err) {
                    console.error('Restore failed:', err);
                    reject(err);
                } else {
                    console.log(`Database restored from: ${backupFile}`);
                    resolve();
                }
                
                db.close();
                backup.close();
            });
        });
    }
}

// CLI interface
if (require.main === module) {
    const backup = new DatabaseBackup();
    const command = process.argv[2];
    
    switch (command) {
        case 'backup':
            backup.createBackup()
                .then(() => console.log('Backup completed successfully'))
                .catch(err => console.error('Backup failed:', err));
            break;
            
        case 'export':
            backup.exportAsSQL()
                .then(() => console.log('SQL export completed successfully'))
                .catch(err => console.error('Export failed:', err));
            break;
            
        case 'list':
            backup.listBackups();
            break;
            
        case 'restore':
            const backupFile = process.argv[3];
            if (!backupFile) {
                console.error('Please specify backup file: node backup.js restore <filename>');
                process.exit(1);
            }
            backup.restoreFromBackup(backupFile)
                .then(() => console.log('Restore completed successfully'))
                .catch(err => console.error('Restore failed:', err));
            break;
            
        default:
            console.log(`
Database Backup Utility

Usage:
  node backup.js backup     - Create a database backup
  node backup.js export     - Export database as SQL
  node backup.js list       - List all backups
  node backup.js restore <file> - Restore from backup

Examples:
  node backup.js backup
  node backup.js export
  node backup.js list
  node backup.js restore backup-2024-12-15T10-30-00-000Z.db
            `);
    }
}

module.exports = DatabaseBackup;
