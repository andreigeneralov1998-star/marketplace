'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type BalanceTransaction = {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  createdAt: string;
  orderId: string | null;
};

type WithdrawalRequest = {
  id: string;
  amount: number;
  method: 'TOPSET_BALANCE' | 'TOPSET_CASH';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  topsetAccountName?: string | null;
  pickupLocation?: string | null;
  comment?: string | null;
  createdAt: string;
};

const TOPSET_LOCATIONS = [
  'ГРОДНО, курьером в руки',
  'Гомель, Курьером в руки',
  'Гомель, Карповича 28 пав.169 (2-й этаж) ТЦ "ВИКТОРИЯ"',
  'БАРАНОВИЧИ, Курьером в руки',
  'БАРАНОВИЧИ, Чернышеского 11 пав.52Б',
  'МИНСК, Курьером в руки',
  'МИНСК, Тимирязева 127 пав.Б6',
  'МИНСК, Кульман 5Б-72 пав.143',
  'МИНСК, Могилевская 39а оф.008',
];

function methodLabel(method: WithdrawalRequest['method']) {
  if (method === 'TOPSET_BALANCE') return 'Перевести на баланс TOPSET';
  return 'Получить наличными в TOPSET';
}

function statusLabel(status: WithdrawalRequest['status']) {
  if (status === 'PENDING') return 'На рассмотрении';
  if (status === 'APPROVED') return 'Подтверждена';
  return 'Отклонена';
}

export default function SellerBalancePage() {
  const [balance, setBalance] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [showActions, setShowActions] = useState(false);
  const [showTopsetModal, setShowTopsetModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [topsetAmount, setTopsetAmount] = useState('');
  const [topsetAccountName, setTopsetAccountName] = useState('');

  const [cashAmount, setCashAmount] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [cashComment, setCashComment] = useState('');

  const loadData = async () => {
    try {
      const [balanceRes, withdrawalsRes] = await Promise.all([
        api.get('/seller/balance'),
        api.get('/seller/withdrawals/my'),
      ]);

      const balanceData = balanceRes.data;
      setBalance(Number(balanceData.balance || 0));
      setAvailableBalance(Number(balanceData.availableBalance || 0));
      setTransactions(balanceData.transactions || []);
      setWithdrawals(withdrawalsRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetTopsetForm = () => {
    setTopsetAmount('');
    setTopsetAccountName('');
    setShowTopsetModal(false);
  };

  const resetCashForm = () => {
    setCashAmount('');
    setPickupLocation('');
    setCashComment('');
    setShowCashModal(false);
  };

  const openTopsetModal = () => {
    setShowActions(false);
    setShowTopsetModal(true);
  };

  const openCashModal = () => {
    setShowActions(false);
    setShowCashModal(true);
  };

  const submitTopsetWithdrawal = async () => {
    const amount = Number(topsetAmount);

    if (!amount || amount <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    if (amount > availableBalance) {
      alert('Сумма не может быть больше доступного баланса');
      return;
    }

    if (!topsetAccountName.trim()) {
      alert('Введите название учетной записи TOPSET');
      return;
    }

    try {
      setSubmitting(true);

      await api.post('/seller/withdrawals/topset-balance', {
        amount,
        topsetAccountName: topsetAccountName.trim(),
      });

      resetTopsetForm();
      await loadData();
      alert('Заявка на вывод отправлена');
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Не удалось отправить заявку');
    } finally {
      setSubmitting(false);
    }
  };

  const submitCashWithdrawal = async () => {
    const amount = Number(cashAmount);

    if (!amount || amount <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    if (amount > availableBalance) {
      alert('Сумма не может быть больше доступного баланса');
      return;
    }

    if (!pickupLocation) {
      alert('Выберите магазин TOPSET');
      return;
    }

    try {
      setSubmitting(true);

      await api.post('/seller/withdrawals/topset-cash', {
        amount,
        pickupLocation,
        comment: cashComment.trim() || undefined,
      });

      resetCashForm();
      await loadData();
      alert('Заявка на вывод отправлена');
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Не удалось отправить заявку');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6">Загрузка...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Баланс</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-6 bg-white shadow-sm">
          <div className="text-sm text-gray-500">Текущий баланс</div>
          <div className="text-3xl font-bold mt-2">{balance.toFixed(2)} BYN</div>
        </div>

        <div className="rounded-2xl border p-6 bg-white shadow-sm relative">
          <div className="text-sm text-gray-500">Доступный баланс</div>
          <div className="text-3xl font-bold mt-2 mb-4">
            {availableBalance.toFixed(2)} BYN
          </div>

          <button
            onClick={() => setShowActions((prev) => !prev)}
            className="rounded-xl bg-black text-white px-4 py-2 text-sm font-medium"
          >
            Вывод средств
          </button>

          {showActions && (
            <div className="absolute right-6 top-[110px] z-10 w-[320px] rounded-2xl border bg-white shadow-xl p-3 space-y-2">
              <button
                onClick={openTopsetModal}
                className="w-full rounded-xl border px-4 py-3 text-left hover:bg-gray-50"
              >
                Перевести на баланс TOPSET (0% комиссии)
              </button>

              <button
                onClick={openCashModal}
                className="w-full rounded-xl border px-4 py-3 text-left hover:bg-gray-50"
              >
                Получить наличными в TOPSET
              </button>

              <button
                onClick={() => setShowActions(false)}
                className="w-full rounded-xl border px-4 py-3 text-left hover:bg-gray-50"
              >
                Отмена
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b font-semibold">История операций</div>

        {transactions.length === 0 ? (
          <div className="p-4 text-gray-500">Пока нет операций</div>
        ) : (
          <div className="divide-y">
            {transactions.map((item) => {
              const isDebit = item.type?.includes('DEBIT');

              return (
                <div
                  key={item.id}
                  className="p-4 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="font-medium">
                      {item.description || 'Операция по балансу'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                    {item.orderId && (
                      <div className="text-sm text-gray-500">
                        Заказ: {item.orderId}
                      </div>
                    )}
                  </div>

                  <div className="text-lg font-semibold">
                    {isDebit ? '-' : '+'}
                    {Number(item.amount).toFixed(2)} BYN
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b font-semibold">Заявки на вывод</div>

        {withdrawals.length === 0 ? (
          <div className="p-4 text-gray-500">Пока нет заявок</div>
        ) : (
          <div className="divide-y">
            {withdrawals.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="font-medium">{methodLabel(item.method)}</div>
                  <div className="text-sm text-gray-500">
                    Статус: {statusLabel(item.status)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>

                  {item.topsetAccountName && (
                    <div className="text-sm text-gray-500">
                      Учетная запись TOPSET: {item.topsetAccountName}
                    </div>
                  )}

                  {item.pickupLocation && (
                    <div className="text-sm text-gray-500">
                      Магазин: {item.pickupLocation}
                    </div>
                  )}

                  {item.comment && (
                    <div className="text-sm text-gray-500">
                      Комментарий: {item.comment}
                    </div>
                  )}
                </div>

                <div className="text-lg font-semibold">
                  {Number(item.amount).toFixed(2)} BYN
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showTopsetModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-semibold">
              Перевести на баланс TOPSET
            </h2>

            <div className="space-y-2">
              <label className="text-sm text-gray-600">Введите сумму</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={topsetAmount}
                onChange={(e) => setTopsetAmount(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none"
                placeholder={`Максимум ${availableBalance.toFixed(2)} BYN`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600">
                Название учетной записи в TOPSET
              </label>
              <input
                type="text"
                value={topsetAccountName}
                onChange={(e) => setTopsetAccountName(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none"
                placeholder="Введите название учетной записи"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={submitTopsetWithdrawal}
                disabled={submitting}
                className="flex-1 rounded-xl bg-black text-white px-4 py-3 font-medium disabled:opacity-60"
              >
                Отправить
              </button>

              <button
                onClick={resetTopsetForm}
                disabled={submitting}
                className="flex-1 rounded-xl border px-4 py-3 font-medium"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showCashModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold">Получить наличными в TOPSET</h2>

            <div className="space-y-2">
              <label className="text-sm text-gray-600">Введите сумму</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none"
                placeholder={`Максимум ${availableBalance.toFixed(2)} BYN`}
              />
            </div>

            <div className="space-y-3">
              <div className="text-sm text-gray-600">Выберите магазин TOPSET</div>

              <div className="space-y-2">
                {TOPSET_LOCATIONS.map((location) => (
                  <label
                    key={location}
                    className="flex items-start gap-3 rounded-xl border p-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="pickupLocation"
                      value={location}
                      checked={pickupLocation === location}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="mt-1"
                    />
                    <span>{location}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600">Комментарий</label>
              <textarea
                value={cashComment}
                onChange={(e) => setCashComment(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none min-h-[110px]"
                placeholder="Свободное поле для записей"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={submitCashWithdrawal}
                disabled={submitting}
                className="flex-1 rounded-xl bg-black text-white px-4 py-3 font-medium disabled:opacity-60"
              >
                Отправить
              </button>

              <button
                onClick={resetCashForm}
                disabled={submitting}
                className="flex-1 rounded-xl border px-4 py-3 font-medium"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}