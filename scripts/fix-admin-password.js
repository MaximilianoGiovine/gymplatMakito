
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function updateAdminPassword() {
    console.log('Updating admin password...');

    // Find the user by email first to get ID
    const { data: { users }, error: findError } = await supabase.auth.admin.listUsers();

    if (findError) {
        console.error('Error finding users:', findError);
        return;
    }

    const adminUser = users.find(u => u.email === 'admin@gymplat.com');

    if (!adminUser) {
        console.error('Admin user not found!');
        return;
    }

    const { data, error } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        { password: 'admin123' }
    );

    if (error) {
        console.error('Error updating password:', error);
    } else {
        console.log('Password updated successfully for:', data.user.email);
    }
}

updateAdminPassword();
