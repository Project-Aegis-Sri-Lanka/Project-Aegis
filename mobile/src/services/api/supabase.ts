import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import StorageAdapter from '../../lib/storage'

const SUPABASE_URL = 'https://zvfhnhpbcmfsipkcorzx.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_MYvn18WGQh_1I2AQsHtfPg_NXtsrmrT'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: StorageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})
