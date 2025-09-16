import fs from 'fs/promises';
import path from 'path';
import {
    Hackathon,
    Team,
    Submission,
    Sponsor,
    Prize,
    Issue,
    User
} from '@/types';

const DATA_DIR = path.join(process.cwd(), 'workspace', 'data');

// Utility function to ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Generic file operations
async function readJsonFile<T>(filename: string, defaultValue: T[] = [] as T[]): Promise<T[]> {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);

    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(data);

        // Convert date strings back to Date objects
        return reviveDates(parsed);
    } catch (error) {
        console.warn(`Failed to read ${filename}, using default:`, error);
        return defaultValue;
    }
}

async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);

    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Failed to write ${filename}:`, error);
        throw error;
    }
}

// Recursively convert date strings back to Date objects
function reviveDates(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
        // Check if string is a valid ISO date
        const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
        if (dateRegex.test(obj)) {
            return new Date(obj);
        }
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => reviveDates(item));
    }

    if (typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                result[key] = reviveDates(obj[key]);
            }
        }
        return result;
    }

    return obj;
}

// ID generation
async function getNextId(): Promise<number> {
    await ensureDataDir();
    const metadataPath = path.join(DATA_DIR, 'metadata.json');

    try {
        const data = await fs.readFile(metadataPath, 'utf-8');
        const metadata = JSON.parse(data);
        const nextId = metadata.nextId + 1;

        await fs.writeFile(metadataPath, JSON.stringify({ nextId }, null, 2));
        return metadata.nextId;
    } catch {
        // Initialize metadata if it doesn't exist
        const initialId = 1000;
        await fs.writeFile(metadataPath, JSON.stringify({ nextId: initialId + 1 }, null, 2));
        return initialId;
    }
}

// Data store operations for each entity
export const DataStore = {
    // Hackathons
    async getHackathons(): Promise<Hackathon[]> {
        return readJsonFile<Hackathon>('hackathons.json');
    },

    async saveHackathons(hackathons: Hackathon[]): Promise<void> {
        await writeJsonFile('hackathons.json', hackathons);
    },

    // Users
    async getUsers(): Promise<User[]> {
        return readJsonFile<User>('users.json');
    },

    async saveUsers(users: User[]): Promise<void> {
        await writeJsonFile('users.json', users);
    },

    // Teams
    async getTeams(): Promise<Team[]> {
        return readJsonFile<Team>('teams.json');
    },

    async saveTeams(teams: Team[]): Promise<void> {
        await writeJsonFile('teams.json', teams);
    },

    // Submissions
    async getSubmissions(): Promise<Submission[]> {
        return readJsonFile<Submission>('submissions.json');
    },

    async saveSubmissions(submissions: Submission[]): Promise<void> {
        await writeJsonFile('submissions.json', submissions);
    },

    // Sponsors
    async getSponsors(): Promise<Sponsor[]> {
        return readJsonFile<Sponsor>('sponsors.json');
    },

    async saveSponsors(sponsors: Sponsor[]): Promise<void> {
        await writeJsonFile('sponsors.json', sponsors);
    },

    // Prizes
    async getPrizes(): Promise<Prize[]> {
        return readJsonFile<Prize>('prizes.json');
    },

    async savePrizes(prizes: Prize[]): Promise<void> {
        await writeJsonFile('prizes.json', prizes);
    },

    // Issues
    async getIssues(): Promise<Issue[]> {
        return readJsonFile<Issue>('issues.json');
    },

    async saveIssues(issues: Issue[]): Promise<void> {
        await writeJsonFile('issues.json', issues);
    },

    // Utility
    async generateId(): Promise<number> {
        return getNextId();
    }
};

// Helper function to generate pin codes
export function generatePinCode(): string {
    return Math.random().toString().substring(2, 6).padStart(4, '0');
}

// Helper function to populate related data
export async function populateHackathonData(hackathon: Hackathon): Promise<Hackathon> {
    const [users, sponsors, teams, submissions, prizes, issues] = await Promise.all([
        DataStore.getUsers(),
        DataStore.getSponsors(),
        DataStore.getTeams(),
        DataStore.getSubmissions(),
        DataStore.getPrizes(),
        DataStore.getIssues()
    ]);

    return {
        ...hackathon,
        organisers: users.filter(u => u.role === 'ORGANISER'),
        sponsors: sponsors.filter(s => s.hackathon_id === hackathon.id),
        teams: teams.filter(t => t.hackathon_id === hackathon.id).map(team => ({
            ...team,
            members: users.filter(u => u.role === 'GUEST') // Simplified for now
        })),
        submissions: submissions.filter(s => {
            const team = teams.find(t => t.id === s.team_id);
            return team && team.hackathon_id === hackathon.id;
        }).map(submission => ({
            ...submission,
            sponsors_used: sponsors.filter(s =>
                submission.sponsor_ids && submission.sponsor_ids.includes(s.id)
            )
        })),
        prizes: prizes.filter(p => p.hackathon_id === hackathon.id),
        issues: issues.filter(i => i.hackathon_id === hackathon.id)
    };
}
