import { useState, useEffect } from 'react';
import { X, Check, Tag, Loader2, CreditCard } from 'lucide-react';
import { supabase } from '../utils/supabase';

interface PricingPlan {
  id: string;
  plan_type: string;
  name: string;
  price: number;
  currency: string;
  features: Record<string, any>;
}

interface PricingModalProps {
  userType: 'institution' | 'employer';
  userAddress: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PricingModal({ userType, userAddress, onClose, onSuccess }: PricingModalProps) {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'select' | 'payment'>('select');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('plan_type', userType)
        .eq('active', true);

      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error('Error loading plans:', err);
    }
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setDiscount(0);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('active', true)
        .single();

      if (error || !data) {
        setError('Invalid promo code');
        setDiscount(0);
        return;
      }

      const now = new Date();
      const validFrom = new Date(data.valid_from);
      const validUntil = data.valid_until ? new Date(data.valid_until) : null;

      if (now < validFrom || (validUntil && now > validUntil)) {
        setError('Promo code expired');
        setDiscount(0);
        return;
      }

      if (data.max_uses && data.current_uses >= data.max_uses) {
        setError('Promo code usage limit reached');
        setDiscount(0);
        return;
      }

      if (!data.applicable_to.includes(userType)) {
        setError('Promo code not applicable to your account type');
        setDiscount(0);
        return;
      }

      if (selectedPlan) {
        const discountAmount = data.discount_type === 'percentage'
          ? (selectedPlan.price * data.discount_value) / 100
          : data.discount_value;

        setDiscount(discountAmount);
        setError('');
      }
    } catch (err) {
      console.error('Error validating promo code:', err);
      setError('Error validating promo code');
      setDiscount(0);
    }
  };

  const handlePlanSelect = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setStep('payment');
    setDiscount(0);
    setPromoCode('');
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    setError('');

    try {
      const finalAmount = Math.max(0, selectedPlan.price - discount);

      const { data: transaction, error: txError } = await supabase
        .from('payment_transactions')
        .insert({
          user_address: userAddress,
          user_type: userType,
          plan_id: selectedPlan.id,
          amount: selectedPlan.price,
          currency: selectedPlan.currency,
          promo_code: promoCode.toUpperCase() || null,
          discount_applied: discount,
          final_amount: finalAmount,
          status: finalAmount === 0 ? 'completed' : 'pending',
          completed_at: finalAmount === 0 ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (txError) throw txError;

      if (promoCode.toUpperCase() === 'TRINETRA' || finalAmount === 0) {
        await supabase
          .from('promo_codes')
          .update({ current_uses: supabase.rpc('increment', { x: 1 }) })
          .eq('code', promoCode.toUpperCase());

        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        await supabase
          .from('user_subscriptions')
          .insert({
            user_address: userAddress,
            user_type: userType,
            plan_id: selectedPlan.id,
            status: 'active',
            transaction_id: transaction.id,
            expires_at: expiresAt.toISOString()
          });

        onSuccess();
      } else {
        setError('Payment processing will be implemented. For now, use promo code TRINETRA for free access.');
      }
    } catch (err: any) {
      console.error('Error processing payment:', err);
      setError(err.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const getFinalPrice = () => {
    if (!selectedPlan) return 0;
    return Math.max(0, selectedPlan.price - discount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 'select' ? 'Choose Your Plan' : 'Complete Payment'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === 'select' ? (
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => handlePlanSelect(plan)}
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-blue-600">${plan.price}</span>
                    <span className="text-gray-600">/{plan.currency}</span>
                  </div>
                  <ul className="space-y-2">
                    {Object.entries(plan.features).map(([key, value]) => (
                      <li key={key} className="flex items-start text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          {typeof value === 'number' && value !== -1 && `: ${value}`}
                          {value === -1 && ': Unlimited'}
                          {typeof value === 'boolean' && value && ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium">{selectedPlan?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">${selectedPlan?.price}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span className="font-medium">-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">${getFinalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code (Optional)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={validatePromoCode}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use code <span className="font-mono font-semibold">TRINETRA</span> for free access
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      {getFinalPrice() === 0 ? 'Activate Free Plan' : `Pay $${getFinalPrice().toFixed(2)}`}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setStep('select')}
                  className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Back to Plans
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
