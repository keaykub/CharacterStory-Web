import { supabase, supabaseAdmin, isSupabaseReady } from '@/lib/supabase';
import { Database } from '@/types/database';

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type CreditLog = Database['public']['Tables']['credit_logs']['Row'];

export class UserService {
  /**
   * ตรวจสอบว่า Supabase พร้อมใช้งานหรือไม่
   */
    private static checkSupabaseReady(): boolean {
        if (!isSupabaseReady()) {
        console.error('❌ Supabase is not configured properly. Please check your environment variables.');
        return false;
        }
        return true;
    }

    /**
     * สร้าง user ใหม่เมื่อ sign up
     */
    static async createUser(clerkId: string, email: string): Promise<{ success: boolean; user?: any; error?: string }> {
        try {
        if (!this.checkSupabaseReady() || !supabaseAdmin) {
            return {
            success: false,
            error: 'ระบบฐานข้อมูลยังไม่พร้อมใช้งาน'
            };
        }

        console.log('🔄 Creating new user:', { clerkId, email });

        // ✅ ใช้ upsert แทน insert เพื่อหลีกเลี่ยง duplicate error
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .upsert(
            {
                clerk_id: clerkId,
                email: email,
                credits: 100
            },
            { 
                onConflict: 'clerk_id',
                ignoreDuplicates: false 
            }
            )
            .select()
            .single();

        if (error) {
            console.error('❌ Database error:', error);
            
            // ถ้าเป็น duplicate แต่ upsert ล้มเหลว ให้ลองดึงข้อมูลมาแทน
            if (error.code === '23505') {
            console.log('🔄 Duplicate detected, trying to fetch existing user...');
            return this.getUserByClerkId(clerkId);
            }
            
            throw error;
        }

        // บันทึก credit log สำหรับเครดิตเริ่มต้น
        try {
            await this.addCreditLog(user.id, 100, 'initial_signup');
        } catch (logError) {
            console.error('⚠️ Failed to create credit log, but user created successfully:', logError);
        }

        console.log('✅ User created successfully:', user);
        return { success: true, user };

        } catch (error) {
        console.error('❌ Error creating user:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างผู้ใช้'
        };
        }
    }

    /**
    * ดึงข้อมูล user จาก Clerk ID
    */
    static async getUserByClerkId(clerkId: string): Promise<{ success: boolean; user?: any; error?: string }> {
        try {
        if (!this.checkSupabaseReady() || !supabase) {
            return {
            success: false,
            error: 'ระบบฐานข้อมูลยังไม่พร้อมใช้งาน'
            };
        }

        console.log('🔍 Searching for user with clerk_id:', clerkId);

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('clerk_id', clerkId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // no rows returned
            console.log('❌ User not found in database');
            return { success: false, error: 'ไม่พบผู้ใช้' };
            }
            console.error('❌ Database error:', error);
            throw error;
        }

        console.log('✅ User found:', user);
        return { success: true, user };

        } catch (error) {
        console.error('❌ Error getting user:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้'
        };
        }
    }

    /**
    * ดึงข้อมูล user จาก ID
    */
    static async getUserById(userId: string): Promise<{ success: boolean; user?: any; error?: string }> {
        try {
        if (!this.checkSupabaseReady() || !supabase) {
            return {
            success: false,
            error: 'ระบบฐานข้อมูลยังไม่พร้อมใช้งาน'
            };
        }
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            throw error;
        }

        return { success: true, user };

        } catch (error) {
        console.error('❌ Error getting user by ID:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้'
        };
        }
    }

    /**
     * อัพเดตเครดิตของ user
     */
    static async updateUserCredits(userId: string, newCredits: number): Promise<{ success: boolean; user?: any; error?: string }> {
        try {
        if (!this.checkSupabaseReady() || !supabaseAdmin) {
            return {
            success: false,
            error: 'ระบบฐานข้อมูลยังไม่พร้อมใช้งาน'
            };
        }
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .update({ credits: newCredits })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        console.log(`✅ Updated credits for user ${userId}: ${newCredits}`);
        return { success: true, user };

        } catch (error) {
        console.error('❌ Error updating credits:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัพเดตเครดิต'
        };
        }
    }

    /**
     * เพิ่ม credit log
     */
    static async addCreditLog(userId: string, amount: number, reason: string): Promise<{ success: boolean; log?: any; error?: string }> {
        try {
        if (!this.checkSupabaseReady() || !supabaseAdmin) {
            return {
            success: false,
            error: 'ระบบฐานข้อมูลยังไม่พร้อมใช้งาน'
            };
        }
        const { data: log, error } = await supabaseAdmin
            .from('credit_logs')
            .insert({
            user_id: userId,
            amount: amount,
            reason: reason
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        console.log(`📝 Credit log added: ${amount} for ${reason}`);
        return { success: true, log };

        } catch (error) {
        console.error('❌ Error adding credit log:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึก credit log'
        };
        }
    }

    /**
     * หัก credits (สำหรับการใช้งาน)
     */
    static async deductCredits(userId: string, amount: number, reason: string): Promise<{ success: boolean; newCredits?: number; error?: string }> {
        try {
        if (!this.checkSupabaseReady()) {
            return {
            success: false,
            error: 'ระบบฐานข้อมูลยังไม่พร้อมใช้งาน'
            };
        }

        // ดึงเครดิตปัจจุบัน
        const userResult = await this.getUserById(userId);
        if (!userResult.success || !userResult.user) {
            return { success: false, error: 'ไม่พบผู้ใช้' };
        }

        const currentCredits = userResult.user.credits;
        
        // ตรวจสอบว่าเครดิตเพียงพอหรือไม่
        if (currentCredits < amount) {
            return { success: false, error: 'เครดิตไม่เพียงพอ' };
        }

        const newCredits = currentCredits - amount;

        // อัพเดตเครดิต
        const updateResult = await this.updateUserCredits(userId, newCredits);
        if (!updateResult.success) {
            return { success: false, error: updateResult.error };
        }

        // บันทึก credit log
        await this.addCreditLog(userId, -amount, reason);

        console.log(`💸 Deducted ${amount} credits from user ${userId}. New balance: ${newCredits}`);
        return { success: true, newCredits };

        } catch (error) {
        console.error('❌ Error deducting credits:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการหักเครดิต'
        };
        }
    }

    /**
     * เพิ่ม credits (สำหรับการเติมเงิน)
     */
    static async addCredits(
        userId: string,
        amount: number,
        reason: string
    ): Promise<{ success: boolean; newCredits?: number; error?: string }> {
        try {
        // ดึงเครดิตปัจจุบัน
        const userResult = await this.getUserById(userId);
        if (!userResult.success || !userResult.user) {
            return { success: false, error: 'ไม่พบผู้ใช้' };
        }

        const currentCredits = userResult.user.credits;
        const newCredits = currentCredits + amount;

        // อัพเดตเครดิต
        const updateResult = await this.updateUserCredits(userId, newCredits);
        if (!updateResult.success) {
            return { success: false, error: updateResult.error };
        }

        // บันทึก credit log
        await this.addCreditLog(userId, amount, reason);

        console.log(`💰 Added ${amount} credits to user ${userId}. New balance: ${newCredits}`);
        return { success: true, newCredits };

        } catch (error) {
        console.error('❌ Error adding credits:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเพิ่มเครดิต'
        };
        }
    }

  /**
   * ดึงประวัติ credit logs
   */
  static async getCreditLogs(
    userId: string,
    limit: number = 50
  ): Promise<{ success: boolean; logs?: CreditLog[]; error?: string }> {
    try {
        if (!this.checkSupabaseReady() || !supabase) {
            return {
            success: false,
            error: 'ระบบฐานข้อมูลยังไม่พร้อมใช้งาน'
            };
        }
        const { data: logs, error } = await supabase
            .from('credit_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            throw error;
        }

        return { success: true, logs: logs || [] };

        } catch (error) {
        console.error('❌ Error getting credit logs:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงประวัติเครดิต'
        };
        }
    }

    /**
    * รีเซ็ตเครดิตรายวัน (สำหรับ cron job)
    */
  static async resetDailyCredits(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
    if (!this.checkSupabaseReady() || !supabaseAdmin) {
        return {
        success: false,
        error: 'ระบบฐานข้อมูลยังไม่พร้อมใช้งาน'
        };
    }
    // อัพเดต users ทั้งหมดให้มีเครดิต 100
    const { data, error } = await supabaseAdmin
    .from('users')
    .update({ credits: 100 })
    .neq('credits', 100) // อัพเดตเฉพาะคนที่เครดิตไม่ใช่ 100
    .select('id');

    if (error) {
    throw error;
    }

    const updatedCount = data?.length || 0;

    // บันทึก credit log สำหรับทุกคนที่ได้รีเซ็ต
    if (updatedCount > 0) {
    const creditLogs = data.map(user => ({
        user_id: user.id,
        amount: 100,
        reason: 'daily_reset'
    }));

    await supabaseAdmin
        .from('credit_logs')
        .insert(creditLogs);
    }

      console.log(`🔄 Daily credit reset completed. Updated ${updatedCount} users.`);
      return { success: true, count: updatedCount };

    } catch (error) {
      console.error('❌ Error resetting daily credits:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการรีเซ็ตเครดิตรายวัน'
      };
    }
  }
}