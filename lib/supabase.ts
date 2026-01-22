import { createClient } from '@supabase/supabase-js';

/**
 * ສໍາລັບ Vite ແອັບພລິເຄຊັນ, ເຮົາຕ້ອງໃຊ້ import.meta.env ເທົ່ານັ້ນ
 * ແລະ ຕົວແປຕ້ອງຂຶ້ນຕົ້ນດ້ວຍ VITE_ ເພື່ອໃຫ້ Browser ສາມາດເຫັນໄດ້
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ກວດສອບເບື້ອງຕົ້ນໃນ Console ເພື່ອຊ່ວຍໃນການ Debug
if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
  console.warn("ຄຳເຕືອນ: ບໍ່ພົບ VITE_SUPABASE_URL ທີ່ຖືກຕ້ອງ. ກະລຸນາຕັ້ງຄ່າໃນ Environment Variables.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
