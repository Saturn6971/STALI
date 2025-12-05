import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vdwvxblucazuopjhsejg.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkd3Z4Ymx1Y2F6dW9wamhzZWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MjQ5OTAsImV4cCI6MjA3NTUwMDk5MH0.EPMdiQLcro9aKUvBE2sQzUp8wg9M78VKd4-xwUNC98E';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: Request) {
  try {
    // Validate environment variables
    if (!supabaseAnonKey) {
      console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
      return NextResponse.json(
        { error: 'Server configuration error: Anon key missing' },
        { status: 500 }
      );
    }

    if (!supabaseServiceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
      return NextResponse.json(
        { error: 'Server configuration error: Service role key missing. Please add SUPABASE_SERVICE_ROLE_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // Get the access token from the request body or Authorization header
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get('authorization');
    const accessToken = body.accessToken || authHeader?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized - No access token provided' }, { status: 401 });
    }

    // Create a client to verify the user
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the user is authenticated using the access token
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    const userId = user.id;

    // Create admin client with service role key for admin operations
    let adminClient;
    try {
      adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } catch (clientError) {
      console.error('Error creating admin client:', clientError);
      return NextResponse.json(
        { error: 'Server configuration error: Invalid service role key. Please check SUPABASE_SERVICE_ROLE_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Delete related records first
    console.log(`Deleting related records for user ${userId}`);

    // Delete systems
    const { error: systemsError } = await adminClient
      .from('systems')
      .delete()
      .eq('seller_id', userId);
    
    if (systemsError) {
      console.warn('Error deleting systems:', systemsError);
    }

    // Delete CPU listings
    const { error: cpuError } = await adminClient
      .from('cpu_listings')
      .delete()
      .eq('seller_id', userId);
    
    if (cpuError) {
      console.warn('Error deleting CPU listings:', cpuError);
    }

    // Delete GPU listings
    const { error: gpuError } = await adminClient
      .from('gpu_listings')
      .delete()
      .eq('seller_id', userId);
    
    if (gpuError) {
      console.warn('Error deleting GPU listings:', gpuError);
    }

    // Delete conversations
    const { error: conversationsError } = await adminClient
      .from('conversations')
      .delete()
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
    
    if (conversationsError) {
      console.warn('Error deleting conversations:', conversationsError);
    }

    // Delete user profile from public.users table
    const { error: profileError } = await adminClient
      .from('users')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting user profile:', profileError);
      return NextResponse.json(
        { error: profileError.message || 'Failed to delete user profile' },
        { status: 500 }
      );
    }

    // Delete auth user (requires admin privileges)
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError);
      return NextResponse.json(
        { error: deleteAuthError.message || 'Failed to delete account' },
        { status: 500 }
      );
    }

    console.log(`Successfully deleted account for user ${userId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error deleting account:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

