import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { SubmissionUpdate } from '@/types';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const submissionId = parseInt(params.id);
        const body: SubmissionUpdate = await request.json();

        const submissions = await DataStore.getSubmissions();
        const index = submissions.findIndex(s => s.id === submissionId);

        if (index === -1) {
            return NextResponse.json(
                { error: 'Submission not found' },
                { status: 404 }
            );
        }

        const updates: any = {
            updated_at: new Date(),
        };

        if (body.title) updates.title = body.title;
        if (body.description) updates.description = body.description;
        if (body.github_link) updates.github_link = body.github_link;
        if (body.presentation_link) updates.presentation_link = body.presentation_link;
        if (body.state) updates.state = body.state;

        if (body.sponsor_ids) {
            const sponsors = await DataStore.getSponsors();
            updates.sponsor_ids = body.sponsor_ids;
            updates.sponsors_used = sponsors.filter(s => body.sponsor_ids!.includes(s.id));
        }

        submissions[index] = {
            ...submissions[index],
            ...updates,
        };

        await DataStore.saveSubmissions(submissions);
        return NextResponse.json(submissions[index]);
    } catch (error) {
        console.error('Error updating submission:', error);
        return NextResponse.json(
            { error: 'Failed to update submission' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const submissionId = parseInt(params.id);

        const submissions = await DataStore.getSubmissions();
        const index = submissions.findIndex(s => s.id === submissionId);

        if (index === -1) {
            return NextResponse.json(
                { error: 'Submission not found' },
                { status: 404 }
            );
        }

        // Remove the submission
        submissions.splice(index, 1);
        await DataStore.saveSubmissions(submissions);

        return NextResponse.json(
            { message: 'Submission deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting submission:', error);
        return NextResponse.json(
            { error: 'Failed to delete submission' },
            { status: 500 }
        );
    }
}
