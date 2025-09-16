import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const issueId = parseInt(params.id);
        const body = await request.json();
        const { status } = body;

        // Validate status
        if (!status || !['open', 'in_progress', 'resolved'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status. Must be one of: open, in_progress, resolved' },
                { status: 400 }
            );
        }

        const issues = await DataStore.getIssues();
        const index = issues.findIndex(i => i.id === issueId);

        if (index === -1) {
            return NextResponse.json(
                { error: 'Issue not found' },
                { status: 404 }
            );
        }

        // Update the issue status and timestamp
        issues[index] = {
            ...issues[index],
            status: status as "open" | "in_progress" | "resolved",
            updated_at: new Date(),
        };

        await DataStore.saveIssues(issues);

        return NextResponse.json(issues[index]);
    } catch (error) {
        console.error('Error updating issue status:', error);
        return NextResponse.json(
            { error: 'Failed to update issue status' },
            { status: 500 }
        );
    }
}
