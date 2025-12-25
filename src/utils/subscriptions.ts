import { supabase } from './supabase';

export interface UserSubscription {
  id: string;
  user_address: string;
  user_type: string;
  plan_id: string;
  status: string;
  starts_at: string;
  expires_at: string;
  plan?: {
    name: string;
    features: Record<string, any>;
  };
}

export const checkUserSubscription = async (
  userAddress: string,
  userType: 'institution' | 'employer' | 'student'
): Promise<{ hasAccess: boolean; subscription: UserSubscription | null }> => {
  try {
    if (userType === 'student') {
      return { hasAccess: true, subscription: null };
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:pricing_plans(name, features)
      `)
      .eq('user_address', userAddress)
      .eq('user_type', userType)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return {
      hasAccess: !!data,
      subscription: data as UserSubscription | null
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return { hasAccess: false, subscription: null };
  }
};

export const getUserTransactions = async (userAddress: string) => {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        plan:pricing_plans(name, price, currency)
      `)
      .eq('user_address', userAddress)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

export const getActiveSubscription = async (userAddress: string) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:pricing_plans(*)
      `)
      .eq('user_address', userAddress)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as UserSubscription | null;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
};

export const checkFeatureAccess = async (
  userAddress: string,
  userType: string,
  featureKey: string
): Promise<boolean> => {
  try {
    const subscription = await getActiveSubscription(userAddress);
    if (!subscription || !subscription.plan) return false;

    const features = subscription.plan.features as Record<string, any>;
    return features[featureKey] !== undefined && features[featureKey] !== false;
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
};
