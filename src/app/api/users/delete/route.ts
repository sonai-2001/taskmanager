import { supabaseAdmin } from '@/supabase/supaClient';
import { NextRequest, NextResponse } from 'next/server';


interface DeleteRequestBody {
  userId: string;
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId }: DeleteRequestBody = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 1. Delete user from 'taskusers' table
    const { error: taskUserError } = await supabaseAdmin
      .from('taskusers')
      .delete()
      .match({ id: userId });
    
    if (taskUserError) {
      console.error('Error deleting user from taskusers:', taskUserError);
      throw new Error('Failed to delete user from taskusers table');
    }

    // 2. Delete user from 'users' table
    const { error: userError } = await supabaseAdmin
      .from('users')
      .delete()
      .match({ id: userId });

    if (userError) {
      console.error('Error deleting user from users:', userError);
      throw new Error('Failed to delete user from users table');
    }

    // 3. Remove user from Supabase authentication
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Error deleting user from authentication:', authError);
      throw new Error('Failed to remove user from Supabase authentication');
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error during user deletion process:', error.message);
      return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
    
    // Handle the case where error is not of type Error
    console.error('Unknown error during user deletion process');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

