import  supabase from '../supabase'

/**
 * 提交体验课报名（仅手机号）
 * @param {string} phone 手机号
 * @returns {Promise<{error: any, data: any}>}
 */
export async function submitTrialSignup(phone) {
  const { data, error, status, statusText } = await supabase
    .from('qy_trial_signups')
    .insert([{ phone }])
    .select()
    .single()
  // 打印详细响应
  console.log('[submitTrialSignup] status:', status, statusText, 'data:', data, 'error:', error);
  return { data, error, status, statusText };
}

/**
 * 检查手机号是否已报名
 * @param {string} phone
 * @returns {Promise<boolean>}
 */
export async function checkPhoneExists(phone) {
  const { data, error, status, statusText } = await supabase
    .from('qy_trial_signups')
    .select('id')
    .eq('phone', phone)
    .maybeSingle()
  // 打印详细响应
  console.log('[checkPhoneExists] status:', status, statusText, 'data:', data, 'error:', error);
  return !!data
} 