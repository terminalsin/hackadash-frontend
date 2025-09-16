import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { IssueCreate } from '@/types';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const hackathonId = parseInt(params.id);
        const issues = await DataStore.getIssues();

        const hackathonIssues = issues.filter(i => i.hackathon_id === hackathonId);
        return NextResponse.json(hackathonIssues);
    } catch (error) {
        console.error('Error fetching issues:', error);
        return NextResponse.json(
            { error: 'Failed to fetch issues' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const hackathonId = parseInt(params.id);
        const body: IssueCreate = await request.json();

        const issues = await DataStore.getIssues();
        const id = await DataStore.generateId();

        const newIssue = {
            id,
            title: body.title,
            description: body.description,
            reporter_user_id: "current-user", // In a real app, this would come from auth
            status: "open" as const,
            hackathon_id: hackathonId,
            created_at: new Date(),
            updated_at: new Date(),
        };

        issues.push(newIssue);
        await DataStore.saveIssues(issues);

        return NextResponse.json(newIssue, { status: 201 });
    } catch (error) {
        console.error('Error creating issue:', error);
        return NextResponse.json(
            { error: 'Failed to create issue' },
            { status: 500 }
        );
    }
}
