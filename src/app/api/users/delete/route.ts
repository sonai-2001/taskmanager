import { supabaseAdmin } from '@/supabase/supaClient';
import { NextRequest, NextResponse } from 'next/server';

// DELETE request handler
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 1. Delete user from 'taskusers' table
    const { error: taskUserError } = await supabaseAdmin.from('taskusers').delete().match({ id: userId });
    if (taskUserError) throw taskUserError;

    // 2. Delete user from 'users' table
    const { error: userError } = await supabaseAdmin.from('users').delete().match({ id: userId });
    if (userError) throw userError;

    // 3. Remove user from Supabase authentication
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
