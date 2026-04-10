import { supabaseAdmin } from '../config/supabase.js';

export const createStaff = async (req, res) => {
    try {
        const { email, password, fullName } = req.body;
        
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({ error: "Missing authorization" });
        const token = authHeader.split(' ')[1];
        
        // 1. Verify caller identity computationally
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
        if (userError || !user) throw new Error("Invalid caller token");

        // 2. Mathematically prove caller is an actual Admin
        const { data: callerProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
        if (callerProfile?.role !== 'admin') throw new Error("Forbidden: Not an admin");

        // 3. Forge Account via Service Role (Bypasses UI logout issue)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });
        if (authError) throw authError;

        const newUserId = authData.user.id;

        // 4. Force inject the salesperson role safely
        const { error: profileError } = await supabaseAdmin.from('profiles')
            .update({ full_name: fullName, role: 'salesperson' })
            .eq('id', newUserId);
        
        if (profileError) {
             // If update fails, inserting it explicitly if no trigger handled it
             await supabaseAdmin.from('profiles').insert([{ id: newUserId, full_name: fullName, role: 'salesperson' }]);
        }

        console.log(`💼 [STAFF] Admin ${user.email} securely provisioned Sales Agent: ${fullName}`);
        res.json({ success: true });

    } catch (err) {
        console.error("Staff Provisioning Error:", err);
        res.status(400).json({ error: err.message });
    }
};
