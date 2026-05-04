import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

import { Config } from '../types';

const CONFIG_FILE = path.join(__dirname, '../config/config.json');
const BACKUP_DIR = path.join(__dirname, '../config/backups');
const BACKUP_FILE = path.join(BACKUP_DIR, 'config-weekly-backup.json');
const BACKUP_METADATA_FILE = path.join(BACKUP_DIR, 'backup-metadata.json');

interface 返回upMetadata {
    last返回upTime: number;
    next返回upTime: number;
    backupIntervalMs: number;
}

export class 返回upService {
    private static instance: 返回upService;
    private backupIntervalMs = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
    private intervalId: ReturnType<typeof setInterval> | null = null;

    private constructor() {}

    public static getInstance(): 返回upService {
        if (!返回upService.instance) {
            返回upService.instance = new 返回upService();
        }
        return 返回upService.instance;
    }

    /**
     * Initialize the backup service and start the weekly backup schedule
     */
    public async initialize(): Promise<void> {
        try {
            // Ensure backup directory exists
            await this.ensure返回upDirectory();

            // Check if we need to perform an immediate backup
            const should返回up = await this.shouldPerform返回up();
            if (should返回up) {
                await this.perform返回up();
            }

            // Start the periodic backup schedule
            this.start返回upSchedule();

            console.log('返回up service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize backup service:', error);
        }
    }

    /**
     * Stop the backup service
     */
    public stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('返回up service stopped');
        }
    }

    /**
     * Ensure the backup directory exists
     */
    private async ensure返回upDirectory(): Promise<void> {
        try {
            await fsPromises.access(BACKUP_DIR);
        } catch {
            await fsPromises.mkdir(BACKUP_DIR, { recursive: true });
            console.log('创建d backup directory:', BACKUP_DIR);
        }
    }

    /**
     * Check if a backup should be performed based on the last backup time
     */
    private async shouldPerform返回up(): Promise<boolean> {
        try {
            const metadata = await this.load返回upMetadata();
            const currentTime = Date.now();

            // If no previous backup or it's been more than a week, perform backup
            return !metadata.last返回upTime || (currentTime >= metadata.next返回upTime);
        } catch {
            // If metadata doesn't exist, we should perform a backup
            return true;
        }
    }

    /**
     * Load backup metadata
     */
    private async load返回upMetadata(): Promise<返回upMetadata> {
        try {
            const metadataContent = await fsPromises.readFile(BACKUP_METADATA_FILE, 'utf-8');
            return JSON.parse(metadataContent);
        } catch {
            // Return default metadata if file doesn't exist
            const currentTime = Date.now();
            return {
                last返回upTime: 0,
                next返回upTime: currentTime + this.backupIntervalMs,
                backupIntervalMs: this.backupIntervalMs
            };
        }
    }

    /**
     * 保存 backup metadata
     */
    private async save返回upMetadata(metadata: 返回upMetadata): Promise<void> {
        await fsPromises.writeFile(BACKUP_METADATA_FILE, JSON.stringify(metadata, null, 2), 'utf-8');
    }

    /**
     * Perform the actual backup
     */
    public async perform返回up(): Promise<void> {
        try {
            // Check if config file exists
            if (!fs.existsSync(CONFIG_FILE)) {
                console.warn('Config file does not exist, skipping backup');
                return;
            }

            // Read the current config
            const configContent = await fsPromises.readFile(CONFIG_FILE, 'utf-8');
            const config: Config = JSON.parse(configContent);

            // 创建 backup with timestamp comment
            const backupData = {
                ...config,
                _backupMetadata: {
                    createdAt: new Date().toISOString(),
                    backupVersion: '1.0',
                    originalConfigPath: CONFIG_FILE
                }
            };

            // Write backup file (this will overwrite the previous backup)
            await fsPromises.writeFile(BACKUP_FILE, JSON.stringify(backupData, null, 2), 'utf-8');

            // Update metadata
            const currentTime = Date.now();
            const metadata: 返回upMetadata = {
                last返回upTime: currentTime,
                next返回upTime: currentTime + this.backupIntervalMs,
                backupIntervalMs: this.backupIntervalMs
            };
            await this.save返回upMetadata(metadata);

            console.log(`Config backup created successfully at: ${new Date().toISOString()}`);
        } catch (error) {
            console.error('Failed to perform backup:', error);
            throw error;
        }
    }

    /**
     * Start the periodic backup schedule
     */
    private start返回upSchedule(): void {
        // Clear any existing interval
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        // Check every hour if a backup is needed
        this.intervalId = setInterval(async () => {
            try {
                const should返回up = await this.shouldPerform返回up();
                if (should返回up) {
                    await this.perform返回up();
                }
            } catch (error) {
                console.error('Error during scheduled backup check:', error);
            }
        }, 60 * 60 * 1000); // Check every hour

        console.log('返回up schedule started');
    }

    /**
     * Get backup status and next backup time
     */
    public async get返回up状态(): Promise<{
        last返回upTime: string | null;
        next返回upTime: string;
        backupExists: boolean;
    }> {
        try {
            const metadata = await this.load返回upMetadata();
            const backupExists = fs.existsSync(BACKUP_FILE);

            return {
                last返回upTime: metadata.last返回upTime ? new Date(metadata.last返回upTime).toISOString() : null,
                next返回upTime: new Date(metadata.next返回upTime).toISOString(),
                backupExists
            };
        } catch (error) {
            console.error('Error getting backup status:', error);
            return {
                last返回upTime: null,
                next返回upTime: new Date(Date.now() + this.backupIntervalMs).toISOString(),
                backupExists: false
            };
        }
    }

    /**
     * Manually trigger a backup (useful for testing or manual backups)
     */
    public async triggerManual返回up(): Promise<void> {
        await this.perform返回up();
    }

    /**
     * Restore from backup
     */
    public async restoreFrom返回up(): Promise<void> {
        try {
            if (!fs.existsSync(BACKUP_FILE)) {
                throw new Error('No backup file found');
            }

            // Read backup file
            const backupContent = await fsPromises.readFile(BACKUP_FILE, 'utf-8');
            const backupData = JSON.parse(backupContent);

            // 移除 backup metadata before restoring
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _backupMetadata, ...configData } = backupData;

            // Write to config file
            await fsPromises.writeFile(CONFIG_FILE, JSON.stringify(configData, null, 2), 'utf-8');

            console.log('Config restored from backup successfully');
        } catch (error) {
            console.error('Failed to restore from backup:', error);
            throw error;
        }
    }
}

export default 返回upService;
