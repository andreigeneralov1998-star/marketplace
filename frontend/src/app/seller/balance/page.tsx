'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  Wallet,
  XCircle,
  ChevronDown,
  Landmark,
} from 'lucide-react';
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

function formatMoney(value: number | string) {
  return `${Number(value || 0).toFixed(2)} BYN`;
}

function methodLabel(method: WithdrawalRequest['method']) {
  if (method === 'TOPSET_BALANCE') return 'Перевод на баланс TOPSET';
  return 'Получение наличными в TOPSET';
}

function statusLabel(status: WithdrawalRequest['status']) {
  if (status === 'PENDING') return 'На рассмотрении';
  if (status === 'APPROVED') return 'Подтверждена';
  return 'Отклонена';
}

function withdrawalStatusClass(status: WithdrawalRequest['status']) {
  if (status === 'PENDING') {
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  }
  if (status === 'APPROVED') {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  }
  return 'bg-red-50 text-red-700 border border-red-200';
}

function withdrawalStatusIcon(status: WithdrawalRequest['status']) {
  if (status === 'PENDING') return <Clock3 className="h-4 w-4" />;
  if (status === 'APPROVED') return <CheckCircle2 className="h-4 w-4" />;
  return <XCircle className="h-4 w-4" />;
}

function KpiCard({
  title,
  value,
  hint,
  icon,
  accent = false,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] ${
        accent ? 'border-[#F5A623]/30 bg-[#FFF9EC]' : 'border-[#E5E7EB] bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">{title}</p>
          <p className="mt-3 text-[30px] font-bold leading-none tracking-tight text-[#111827]">
            {value}
          </p>
          <p className="mt-2 text-xs text-[#9CA3AF]">{hint}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            accent ? 'bg-[#F5A623] text-[#1F2937]' : 'bg-[#FFF4DD] text-[#1F2937]'
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-[#E5E7EB] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>
          {description ? <p className="mt-1 text-sm text-[#6B7280]">{description}</p> : null}
        </div>
        {actions}
      </div>
      <div>{children}</div>
    </section>
  );
}

function ModalShell({
  title,
  description,
  onClose,
  children,
  maxWidth = 'max-w-md',
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`w-full ${maxWidth} rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.20)]`}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-[#111827]">{title}</h3>
            {description ? <p className="mt-1 text-sm text-[#6B7280]">{description}</p> : null}
          </div>

          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:bg-[#F9FAFB]"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
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

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
      setErrorMessage('Не удалось загрузить данные по балансу');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingWithdrawals = useMemo(
    () => withdrawals.filter((item) => item.status === 'PENDING').length,
    [withdrawals],
  );

  const approvedWithdrawalsAmount = useMemo(
    () =>
      withdrawals
        .filter((item) => item.status === 'APPROVED')
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [withdrawals],
  );

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
    setErrorMessage('');
    setSuccessMessage('');
    setShowTopsetModal(true);
  };

  const openCashModal = () => {
    setShowActions(false);
    setErrorMessage('');
    setSuccessMessage('');
    setShowCashModal(true);
  };

  const submitTopsetWithdrawal = async () => {
    const amount = Number(topsetAmount);

    setErrorMessage('');
    setSuccessMessage('');

    if (!amount || amount <= 0) {
      setErrorMessage('Введите корректную сумму');
      return;
    }

    if (amount > availableBalance) {
      setErrorMessage('Сумма не может быть больше доступного баланса');
      return;
    }

    if (!topsetAccountName.trim()) {
      setErrorMessage('Введите название учетной записи TOPSET');
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
      setSuccessMessage('Заявка на вывод отправлена');
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error?.response?.data?.message || 'Не удалось отправить заявку');
    } finally {
      setSubmitting(false);
    }
  };

  const submitCashWithdrawal = async () => {
    const amount = Number(cashAmount);

    setErrorMessage('');
    setSuccessMessage('');

    if (!amount || amount <= 0) {
      setErrorMessage('Введите корректную сумму');
      return;
    }

    if (amount > availableBalance) {
      setErrorMessage('Сумма не может быть больше доступного баланса');
      return;
    }

    if (!pickupLocation) {
      setErrorMessage('Выберите магазин TOPSET');
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
      setSuccessMessage('Заявка на вывод отправлена');
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error?.response?.data?.message || 'Не удалось отправить заявку');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-sm text-[#6B7280]">
          Загрузка данных по балансу...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <section className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF4DD] px-3 py-1 text-xs font-semibold text-[#1F2937]">
              <Wallet className="h-3.5 w-3.5" />
              Seller / Баланс
            </div>

            <h1 className="mt-4 text-[28px] font-bold leading-tight text-[#111827]">
              Баланс продавца
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Здесь виден общий баланс, доступная сумма для вывода, история операций и заявки
              на вывод средств через TOPSET.
            </p>
          </div>

          <div className="relative lg:w-[320px]">
            <button
              onClick={() => setShowActions((prev) => !prev)}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#111827] px-5 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
            >
              Вывод средств
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-[56px] z-20 w-full rounded-2xl border border-[#E5E7EB] bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
                <button
                  onClick={openTopsetModal}
                  className="flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-[#F9FAFB]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF4DD] text-[#1F2937]">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#111827]">
                      Перевести на баланс TOPSET
                    </div>
                    <div className="mt-1 text-xs text-[#6B7280]">
                      Без комиссии, по названию учетной записи
                    </div>
                  </div>
                </button>

                <button
                  onClick={openCashModal}
                  className="flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-[#F9FAFB]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF4DD] text-[#1F2937]">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#111827]">
                      Получить наличными в TOPSET
                    </div>
                    <div className="mt-1 text-xs text-[#6B7280]">
                      С выбором точки выдачи и комментарием
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setShowActions(false)}
                  className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
                >
                  Закрыть
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {(errorMessage || successMessage) && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            errorMessage
              ? 'border border-red-200 bg-red-50 text-red-700'
              : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {errorMessage || successMessage}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Текущий баланс"
          value={formatMoney(balance)}
          hint="Сумма всех заказов со статусом «Отправлен»"
          icon={<Landmark className="h-5 w-5" />}
        />
        <KpiCard
          title="Доступный баланс"
          value={formatMoney(availableBalance)}
          hint="Сумма оплаченных заказов, доступная к выводу"
          icon={<Wallet className="h-5 w-5" />}
          accent
        />
        <KpiCard
          title="Заявок в ожидании"
          value={String(pendingWithdrawals)}
          hint="Еще не обработаны администратором"
          icon={<Clock3 className="h-5 w-5" />}
        />
        <KpiCard
          title="Подтверждено к выводу"
          value={formatMoney(approvedWithdrawalsAmount)}
          hint="По уже подтвержденным заявкам"
          icon={<ArrowDownToLine className="h-5 w-5" />}
        />
      </section>

      <SectionCard
        title="История операций"
        description="Все начисления и списания по балансу продавца."
      >
        {!transactions.length ? (
          <div className="p-5 text-sm text-[#6B7280]">Пока нет операций</div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {transactions.map((item) => {
              const isDebit = item.type?.includes('DEBIT');

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#111827]">
                      {item.description || 'Операция по балансу'}
                    </div>
                    <div className="mt-1 text-sm text-[#6B7280]">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                    {item.orderId ? (
                      <div className="mt-1 text-sm text-[#9CA3AF]">Заказ: {item.orderId}</div>
                    ) : null}
                  </div>

                  <div
                    className={`inline-flex rounded-full px-3 py-2 text-sm font-semibold ${
                      isDebit
                        ? 'bg-red-50 text-red-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {isDebit ? '-' : '+'}
                    {formatMoney(item.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Заявки на вывод"
        description="История всех отправленных заявок и их текущий статус."
      >
        {!withdrawals.length ? (
          <div className="p-5 text-sm text-[#6B7280]">Пока нет заявок</div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {withdrawals.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 p-5 xl:flex-row xl:items-start xl:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-sm font-semibold text-[#111827]">
                      {methodLabel(item.method)}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${withdrawalStatusClass(
                        item.status,
                      )}`}
                    >
                      {withdrawalStatusIcon(item.status)}
                      {statusLabel(item.status)}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-[#6B7280]">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>

                  {item.topsetAccountName ? (
                    <div className="mt-2 text-sm text-[#6B7280]">
                      Учетная запись TOPSET:{' '}
                      <span className="text-[#111827]">{item.topsetAccountName}</span>
                    </div>
                  ) : null}

                  {item.pickupLocation ? (
                    <div className="mt-2 text-sm text-[#6B7280]">
                      Точка выдачи:{' '}
                      <span className="text-[#111827]">{item.pickupLocation}</span>
                    </div>
                  ) : null}

                  {item.comment ? (
                    <div className="mt-2 text-sm text-[#6B7280]">
                      Комментарий: <span className="text-[#111827]">{item.comment}</span>
                    </div>
                  ) : null}
                </div>

                <div className="text-lg font-semibold text-[#111827]">
                  {formatMoney(item.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {showTopsetModal && (
        <ModalShell
          title="Перевести на баланс TOPSET"
          description="Создай заявку на вывод без комиссии."
          onClose={resetTopsetForm}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111827]">Сумма</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={topsetAmount}
                onChange={(e) => setTopsetAmount(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#FFF4DD]"
                placeholder={`Максимум ${availableBalance.toFixed(2)} BYN`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111827]">
                Название учетной записи TOPSET
              </label>
              <input
                type="text"
                value={topsetAccountName}
                onChange={(e) => setTopsetAccountName(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#FFF4DD]"
                placeholder="Введите название учетной записи"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                onClick={submitTopsetWithdrawal}
                disabled={submitting}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-[#F5A623] px-4 text-sm font-semibold text-[#1F2937] transition hover:bg-[#E69512] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Отправить заявку
              </button>

              <button
                onClick={resetTopsetForm}
                disabled={submitting}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
              >
                Отмена
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {showCashModal && (
        <ModalShell
          title="Получить наличными в TOPSET"
          description="Выбери точку выдачи и при необходимости оставь комментарий."
          onClose={resetCashForm}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111827]">Сумма</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#FFF4DD]"
                placeholder={`Максимум ${availableBalance.toFixed(2)} BYN`}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-[#111827]">Точка выдачи TOPSET</label>

              <div className="grid gap-3">
                {TOPSET_LOCATIONS.map((location) => (
                  <label
                    key={location}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                      pickupLocation === location
                        ? 'border-[#F5A623] bg-[#FFF9EC]'
                        : 'border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pickupLocation"
                      value={location}
                      checked={pickupLocation === location}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="mt-1"
                    />
                    <span className="text-sm text-[#111827]">{location}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111827]">Комментарий</label>
              <textarea
                value={cashComment}
                onChange={(e) => setCashComment(e.target.value)}
                className="min-h-[120px] w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#FFF4DD]"
                placeholder="Свободное поле для уточнений"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                onClick={submitCashWithdrawal}
                disabled={submitting}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-[#F5A623] px-4 text-sm font-semibold text-[#1F2937] transition hover:bg-[#E69512] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Отправить заявку
              </button>

              <button
                onClick={resetCashForm}
                disabled={submitting}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
              >
                Отмена
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}