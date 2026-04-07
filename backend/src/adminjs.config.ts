import { PrismaClient, OrderStatus } from '@prisma/client';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import express from 'express';


const prisma = new PrismaClient();

const formatDateTime = (value: unknown) => {
  if (!value) return '';

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatMoney = (value: unknown) => {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) return String(value ?? '');

  return `${amount.toFixed(2)} BYN`;
};

const mapProductModerationStatus = (value: unknown) => {
  const status = String(value ?? '');

  if (status === 'APPROVED') return 'Одобрен';
  if (status === 'PENDING') return 'На модерации';
  if (status === 'REJECTED') return 'Отклонён';

  return status;
};

const mapPublishedLabel = (value: unknown) => {
  if (value === true || value === 'true') return 'Да';
  if (value === false || value === 'false') return 'Нет';
  return String(value ?? '');
};

const mapOrderStatus = (value: unknown) => {
  const status = String(value ?? '');

  if (status === 'PENDING') return 'Новый';
  if (status === 'PAID') return 'Оплачен';
  if (status === 'PROCESSING') return 'В обработке';
  if (status === 'SHIPPED') return 'Отправлен';
  if (status === 'DELIVERED') return 'Доставлен';
  if (status === 'CANCELLED') return 'Отменён';

  return status;
};

const mapDeliveryMethod = (value: unknown) => {
  const method = String(value ?? '');

  if (method === 'BELPOCHTA') return 'Белпочта';
  if (method === 'EUROPOCHTA') return 'Европочта';
  if (method === 'EMS') return 'EMS';
  if (method === 'PICKUP') return 'Самовывоз';
  if (method === 'TOPSET_CASH') return 'Наличными в TOPSET';
  if (method === 'TOPSET_BALANCE') return 'На баланс TOPSET';

  return method;
};
const ADMIN_BRANDING = {
  companyName: 'Rynok.by — Админ-панель',
  softwareBrothers: false,
  withMadeWithLove: false,
};

const ruTranslations = {
  
  labels: {
    loginWelcome: 'Вход в админ-панель',
    navigation: 'Навигация',
    pages: 'Страницы',
    dashboard: 'Главная',
    properties: 'Поля',
  },

  buttons: {
    save: 'Сохранить',
    addNewItem: 'Добавить',
    filter: 'Фильтр',
    applyChanges: 'Применить',
    resetFilter: 'Сбросить',
    confirmRemovalMany: 'Подтвердить',
    confirmRemoval: 'Подтвердить',
    delete: 'Удалить',
    edit: 'Редактировать',
    show: 'Открыть',
    list: 'Список',
    search: 'Поиск',
    logout: 'Выйти',
    login: 'Войти',
    bulkDelete: 'Скрыть выбранное',
  },
  actions: {
    new: 'Создать',
    edit: 'Редактировать',
    show: 'Просмотр',
    delete: 'Скрыть',
    list: 'Список',
    search: 'Поиск',
    bulkDelete: 'Скрыть выбранное',
  },
  messages: {
    welcomeOnBoard_title: 'Добро пожаловать в админ-панель',
    welcomeOnBoard_subtitle:
      'Здесь вы можете управлять товарами, заказами, пользователями и выплатами.',

    addingResources_title: 'Ресурсы',
    addingResources_subtitle:
      'Основные сущности проекта доступны через меню слева.',

    customizeResources_title: 'Настройка ресурсов',
    customizeResources_subtitle:
      'Можно управлять полями, фильтрами и отображением данных.',

    customizeActions_title: 'Действия',
    customizeActions_subtitle:
      'Одобрение, отклонение, скрытие и другие действия над записями.',

    writeOwnComponents_title: 'Кастомные компоненты',
    writeOwnComponents_subtitle:
      'Позже можно добавить собственные интерфейсы и улучшения.',

    customDashboard_title: 'Главная страница',
    customDashboard_subtitle:
      'При необходимости позже сделаем свою главную страницу.',

    roleBasedAccess_title: 'Роли и доступы',
    roleBasedAccess_subtitle:
      'Доступ к действиям и разделам зависит от роли пользователя.',

    successfullyBulkDeleted: 'Выбранные записи обработаны',
    successfullyDeleted: 'Запись успешно обработана',
    successfullyUpdated: 'Запись успешно обновлена',
    successfullyCreated: 'Запись успешно создана',
    deleteMessage: 'Вы действительно хотите выполнить это действие?',
    bulkDeleteError: 'Не удалось обработать выбранные записи',
    thereWereValidationErrors: 'Проверьте форму: есть ошибки в заполнении',
    forbiddenError: 'У вас нет доступа к этому действию',
  },
  resources: {
    FeedbackMessage: {
      name: 'Обратная связь',
      properties: {
        id: 'ID',
        name: 'Имя',
        contact: 'Контакт',
        message: 'Сообщение',
        status: 'Статус',
        createdAt: 'Создано',
        updatedAt: 'Обновлено',
      },
    },
    HomepageBanner: {
      name: 'Баннеры главной',
      properties: {
        title: 'Название',
        imageUrl: 'Изображение',
        imageUpload: 'Изображение',
        linkUrl: 'Ссылка',
        sortOrder: 'Порядок',
        isActive: 'Активен',
        openInNewTab: 'Открывать в новой вкладке',
        createdAt: 'Создан',
        updatedAt: 'Обновлен',
      },
    },
    SellerWithdrawalRequest: {
      name: 'Заявки на вывод',
      properties: {
        requestNumber: 'Номер заявки',
        sellerId: 'Продавец',
        amount: 'Сумма',
        amountFormatted: 'Сумма',
        method: 'Способ вывода',
        methodLabel: 'Способ вывода',
        status: 'Статус',
        topsetAccountName: 'Учетная запись TOPSET',
        pickupLocation: 'Магазин TOPSET',
        comment: 'Комментарий',
        processedAt: 'Дата обработки',
        processedByAdminId: 'Обработал администратор',
        createdAt: 'Создано',
        updatedAt: 'Обновлено',
      },
    },
    User: {
      name: 'Пользователи',
      properties: {
        email: 'Email',
        role: 'Роль',
        firstName: 'Имя',
        lastName: 'Фамилия',
        phone: 'Телефон',
        storeName: 'Название магазина',
        storeSlug: 'Слаг магазина',
        storeDescription: 'Описание магазина',
        storeLogo: 'Логотип магазина',
        isSellerApproved: 'Продавец одобрен',
        createdAt: 'Создан',
        updatedAt: 'Обновлен',
      },
    },  
    SellerApplication: {
      name: 'Заявки в продавцы',
      properties: {
        userId: 'Пользователь',
        status: 'Статус',
        lastName: 'Фамилия',
        firstName: 'Имя',
        middleName: 'Отчество',
        phone: 'Телефон',
        city: 'Город',
        warehouseAddress: 'Адрес склада',
        storeName: 'Название магазина',
        storeSlug: 'Слаг магазина',
        storeDescription: 'Описание магазина',
        storeLogo: 'Логотип магазина',
        createdAt: 'Создано',
        updatedAt: 'Обновлено',
      },
    },

    Category: {
      name: 'Категории',
      properties: {
        name: 'Название',
        slug: 'Слаг',
        createdAt: 'Создана',
        updatedAt: 'Обновлена',
      },
    },
    Product: {
      name: 'Товары',
      properties: {
        title: 'Название',
        slug: 'Слаг',
        sku: 'Артикул',
        description: 'Описание',
        price: 'Цена',
        stock: 'Остаток',
        categoryId: 'Категория',
        sellerId: 'Продавец',
        imageUrl: 'Главное фото',
        moderationStatus: 'Статус модерации',
        moderationComment: 'Комментарий модератора',
        compatibleModels: 'Совместимые модели',
        isPublished: 'Опубликован',
        createdAt: 'Создан',
        updatedAt: 'Обновлен',
      },
    },
    ProductImage: {
      name: 'Изображения товаров',
      properties: {
        productId: 'Товар',
        url: 'Изображение',
        position: 'Позиция',
        createdAt: 'Создано',
      },
    },
    Order: {
      name: 'Заказы',
      properties: {
        orderNumber: 'Номер заказа',
        id: 'ID',
        createdAt: 'Создан',
        sellerId: 'Продавец',
        userId: 'Покупатель',
        fullName: 'ФИО',
        phone: 'Телефон',
        deliveryMethod: 'Доставка',
        city: 'Город',
        street: 'Улица',
        house: 'Дом',
        apartment: 'Квартира',
        comment: 'Комментарий',
        total: 'Сумма',
        status: 'Статус',
      },
    },
    OrderItem: {
      name: 'Позиции заказа',
      properties: {
        id: 'ID',
        orderId: 'Заказ',
        productId: 'Товар',
        sellerId: 'Продавец',
        titleSnapshot: 'Название',
        skuSnapshot: 'Артикул',
        priceSnapshot: 'Цена',
        quantity: 'Количество',
      },
    },
  },
};


// Важно: TS не должен превращать это в require()
const dynamicImport = new Function(
  'modulePath',
  'return import(modulePath)',
) as (modulePath: string) => Promise<any>;

async function recalculateOrderStatus(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });

  if (!order) return;

  await prisma.order.update({
    where: { id: orderId },
    data: { status: order.status ?? OrderStatus.PENDING },
  });
}

export async function buildAdminRouter() {
  const AdminJSModule = await dynamicImport('adminjs');
  const AdminJSExpressModule = await dynamicImport('@adminjs/express');
  const AdminJSPrismaModule = await dynamicImport('@adminjs/prisma');

  const AdminJS = AdminJSModule.default;
  const { ComponentLoader } = AdminJSModule;
  const componentLoader = new ComponentLoader();
  const AdminJSExpress =
    AdminJSExpressModule.default || AdminJSExpressModule;
  const { Database, Resource, getModelByName } = AdminJSPrismaModule;

  AdminJS.registerAdapter({ Database, Resource });

  const exportExcelComponent = componentLoader.add(
    'ExportExcel',
    './admin/components/export-excel',
    'buildAdminRouter',
  );

  const bannerImageUploadComponent = componentLoader.add(
    'BannerImageUploadV2',
    './admin/components/banner-image-upload',
    'buildAdminRouter',
  );
  const productModerationStatusBadge = componentLoader.add(
    'ProductModerationStatusBadge',
    './admin/components/product-moderation-status-badge',
    'buildAdminRouter',
  );

  const admin = new AdminJS({
    rootPath: '/admin',
    componentLoader,
    resources: [
      {
        resource: { model: getModelByName('SellerWithdrawalRequest'), client: prisma },
        options: {
          navigation: {
            name: 'Финансы',
            icon: 'Payment',
          },
          listProperties: [
            'requestNumber',
            'createdAtFormatted',
            'sellerId',
            'amountFormatted',
            'methodLabel',
            'statusLabel',
          ],
          filterProperties: [
            'sellerId',
            'method',
            'status',
            'createdAt',
          ],
          showProperties: [
            'requestNumber',
            'sellerId',
            'amountFormatted',
            'methodLabel',
            'statusLabel',
            'topsetAccountName',
            'pickupLocation',
            'comment',
            'processedAtFormatted',
            'processedByAdminId',
            'createdAtFormatted',
            'updatedAtFormatted',
          ],
          editProperties: [],
          properties: {
            requestNumber: {
              label: 'Номер заявки',
              isVisible: { list: true, show: true, filter: true, edit: false },
            },
            id: {
              isVisible: false,
            },
            statusLabel: {
              label: 'Статус',
              isVisible: { list: true, show: true, filter: false, edit: false },
            },
            createdAtFormatted: {
              label: 'Создано',
              isVisible: { list: true, show: true, filter: false, edit: false },
            },
            processedAtFormatted: {
              label: 'Дата обработки',
              isVisible: { list: false, show: true, filter: false, edit: false },
            },
            updatedAtFormatted: {
              label: 'Обновлено',
              isVisible: { list: false, show: true, filter: false, edit: false },
            },
            sellerId: {
              label: 'Продавец',
            },
            amount: {
              label: 'Сумма',
            },
            method: {
              label: 'Способ вывода',
            },
            amountFormatted: {
              label: 'Сумма',
              isVisible: { list: true, show: true, filter: false, edit: false },
            },
            methodLabel: {
              label: 'Способ вывода',
              isVisible: { list: true, show: true, filter: false, edit: false },
            },
            status: {
              label: 'Статус',
            },
            topsetAccountName: {
              label: 'Учетная запись TOPSET',
            },
            pickupLocation: {
              label: 'Магазин TOPSET',
            },
            comment: {
              label: 'Комментарий',
            },
            processedAt: {
              label: 'Дата обработки',
            },
            processedByAdminId: {
              label: 'Обработал админ',
            },
          },
          actions: {
            list: {
              after: async (response) => {
                if (response.records) {
                  response.records = response.records.map((record) => {
                    const amountInCents = Number(record.params.amount ?? 0);
                    const method = String(record.params.method ?? '');
                    const status = String(record.params.status ?? '');

                    record.params.amountFormatted = `${(amountInCents / 100).toFixed(2)} BYN`;
                    record.params.methodLabel =
                      method === 'TOPSET_BALANCE'
                        ? 'На баланс TOPSET'
                        : method === 'TOPSET_CASH'
                        ? 'Наличными в TOPSET'
                        : method;

                    record.params.statusLabel =
                      status === 'PENDING'
                        ? 'Ожидает'
                        : status === 'APPROVED'
                        ? 'Подтверждена'
                        : status === 'REJECTED'
                        ? 'Отклонена'
                        : status;

                    record.params.createdAtFormatted = formatDateTime(record.params.createdAt);
                    record.params.processedAtFormatted = formatDateTime(record.params.processedAt);
                    record.params.updatedAtFormatted = formatDateTime(record.params.updatedAt);

                    return record;
                  });
                }

                return response;
              },
            },

            show: {
              after: async (response) => {
                if (response.record) {
                  const amountInCents = Number(response.record.params.amount ?? 0);
                  const method = String(response.record.params.method ?? '');
                  const status = String(response.record.params.status ?? '');

                  response.record.params.amountFormatted = `${(amountInCents / 100).toFixed(2)} BYN`;
                  response.record.params.methodLabel =
                    method === 'TOPSET_BALANCE'
                      ? 'На баланс TOPSET'
                      : method === 'TOPSET_CASH'
                      ? 'Наличными в TOPSET'
                      : method;

                  response.record.params.statusLabel =
                    status === 'PENDING'
                      ? 'Ожидает'
                      : status === 'APPROVED'
                      ? 'Подтверждена'
                      : status === 'REJECTED'
                      ? 'Отклонена'
                      : status;

                  response.record.params.createdAtFormatted = formatDateTime(
                    response.record.params.createdAt,
                  );
                  response.record.params.processedAtFormatted = formatDateTime(
                    response.record.params.processedAt,
                  );
                  response.record.params.updatedAtFormatted = formatDateTime(
                    response.record.params.updatedAt,
                  );
                }

                return response;
              },
            },
            edit: { isAccessible: false },
            new: { isAccessible: false },
            delete: { isAccessible: false },

            approveWithdrawal: {
              actionType: 'record',
              label: 'Подтвердить',
              icon: 'Checkmark',
              component: false,
              guard: 'Подтвердить заявку на вывод?',
              isAccessible: ({ record, currentAdmin }) =>
                currentAdmin?.role === 'ADMIN' && record?.params?.status === 'PENDING',
              handler: async (request, response, context) => {
                const { record, resource, currentAdmin } = context;

                if (!record) {
                  return {
                    notice: {
                      message: 'Заявка не найдена',
                      type: 'error',
                    },
                  };
                }

                const adminUser = await prisma.user.findFirst({
                  where: {
                    email: currentAdmin?.email,
                    role: 'ADMIN',
                  },
                });

                if (!adminUser) {
                  return {
                    notice: {
                      message: 'Администратор не найден',
                      type: 'error',
                    },
                  };
                }

                const withdrawalId = String(record.params.id);
                const withdrawal = await prisma.sellerWithdrawalRequest.findUnique({
                  where: { id: record.params.id as string },
                });

                if (!withdrawal) {
                  throw new Error('Заявка на вывод не найдена');
                }

                const amountInCents = Number(withdrawal.amount);

                if (!withdrawal) {
                  return {
                    notice: {
                      message: 'Заявка не найдена',
                      type: 'error',
                    },
                  };
                }

                if (withdrawal.status !== 'PENDING') {
                  return {
                    notice: {
                      message: 'Заявка уже обработана',
                      type: 'error',
                    },
                  };
                }

                const sellerId = String(withdrawal.sellerId);

                if (!withdrawal) {
                  return {
                    notice: {
                      message: 'Заявка не найдена',
                      type: 'error',
                    },
                  };
                }

                if (withdrawal.status !== 'PENDING') {
                  return {
                    notice: {
                      message: 'Заявка уже обработана',
                      type: 'error',
                    },
                  };
                }

                const paidItems = await prisma.orderItem.findMany({
                  where: {
                    sellerId,
                    status: OrderStatus.PAID,
                  },
                  select: {
                    priceSnapshot: true,
                    quantity: true,
                  },
                });

                const paidTotalInCents = paidItems.reduce((sum, item) => {
                  return sum + Math.round(Number(item.priceSnapshot) * 100) * item.quantity;
                }, 0);

                const approvedWithdrawals = await prisma.sellerWithdrawalRequest.aggregate({
                  where: {
                    sellerId,
                    status: 'APPROVED',
                  },
                  _sum: {
                    amount: true,
                  },
                });

                const withdrawnInCents = Number(approvedWithdrawals._sum.amount ?? 0);
                const availableInCents = Math.max(0, paidTotalInCents - withdrawnInCents);

                if (amountInCents > availableInCents) {
                  return {
                    notice: {
                      message: 'Недостаточно доступного баланса',
                      type: 'error',
                    },
                  };
                }

                await prisma.$transaction(async (tx) => {
                  const currentWithdrawal = await tx.sellerWithdrawalRequest.findUnique({
                    where: { id: withdrawalId },
                  });

                  if (!currentWithdrawal) {
                    throw new Error('Заявка не найдена');
                  }

                  if (currentWithdrawal.status !== 'PENDING') {
                    throw new Error('Заявка уже обработана');
                  }
                  const sellerBalance = await tx.sellerBalance.findUnique({
                    where: { sellerId },
                  });

                  if (!sellerBalance) {
                    throw new Error('Баланс продавца не найден');
                  }

                  await tx.sellerBalance.update({
                    where: { sellerId },
                    data: {
                      amount: {
                        decrement: amountInCents,
                      },
                    },
                  });
                  await tx.sellerBalanceTransaction.create({
                    data: {
                      sellerId,
                      type: 'DEBIT_WITHDRAWAL_APPROVED',
                      amount: amountInCents,
                      description: `Подтвержден вывод средств (${record.params.method})`,
                    },
                  });

                  await tx.sellerWithdrawalRequest.update({
                    where: { id: withdrawalId },
                    data: {
                      status: 'APPROVED',
                      processedAt: new Date(),
                      processedByAdminId: adminUser.id,
                    },
                  });
                });

                const updatedRecord = await resource.findOne(withdrawalId);

                return {
                  record: updatedRecord?.toJSON(currentAdmin),
                  notice: {
                    message: 'Заявка подтверждена',
                    type: 'success',
                  },
                };
              },
            },

            rejectWithdrawal: {
              actionType: 'record',
              label: 'Отменить',
              icon: 'Close',
              component: false,
              guard: 'Отклонить заявку на вывод?',
              isAccessible: ({ record, currentAdmin }) =>
                currentAdmin?.role === 'ADMIN' && record?.params?.status === 'PENDING',
              handler: async (request, response, context) => {
                const { record, resource, currentAdmin } = context;

                if (!record) {
                  return {
                    notice: {
                      message: 'Заявка не найдена',
                      type: 'error',
                    },
                  };
                }

                const adminUser = await prisma.user.findFirst({
                  where: {
                    email: currentAdmin?.email,
                    role: 'ADMIN',
                  },
                });

                if (!adminUser) {
                  return {
                    notice: {
                      message: 'Администратор не найден',
                      type: 'error',
                    },
                  };
                }
                const withdrawal = await prisma.sellerWithdrawalRequest.findUnique({
                  where: { id: String(record.params.id) },
                });

                if (!withdrawal) {
                  return {
                    notice: {
                      message: 'Заявка не найдена',
                      type: 'error',
                    },
                  };
                }

                if (withdrawal.status !== 'PENDING') {
                  return {
                    notice: {
                      message: 'Заявка уже обработана',
                      type: 'error',
                    },
                  };
                }
                await prisma.sellerWithdrawalRequest.update({
                  where: { id: String(record.params.id) },
                  data: {
                    status: 'REJECTED',
                    processedAt: new Date(),
                    processedByAdminId: adminUser.id,
                  },
                });

                const updatedRecord = await resource.findOne(String(record.params.id));

                return {
                  record: updatedRecord?.toJSON(currentAdmin),
                  notice: {
                    message: 'Заявка отклонена',
                    type: 'success',
                  },
                };
              },
            },
          },
        },
      },
      {
        resource: { model: getModelByName('User'), client: prisma },
        options: {
          label: 'Пользователи',
          properties: {
            email: { label: 'Email' },
            role: { label: 'Роль' },
            storeName: { label: 'Магазин' },
            isSellerApproved: { label: 'Одобрен продавец' },
            createdAt: { label: 'Создан' },
          },
          actions: {
            new: { label: 'Создать' },
            edit: { label: 'Редактировать' },
            show: { label: 'Просмотр' },
            delete: { label: 'Удалить' },
          },
          navigation: {
            name: 'Пользователи и магазины',
            icon: 'User',
          },
          listProperties: ['email', 'role', 'storeName', 'isSellerApproved', 'createdAt'],
          filterProperties: ['email', 'role', 'storeName', 'isSellerApproved', 'createdAt'],
        },
      },
        {
          resource: { model: getModelByName('SellerApplication'), client: prisma },
          options: {
            label: 'Заявки в продавцы',
            navigation: {
              name: 'Пользователи и магазины',
              icon: 'User',
            },
            listProperties: [
              'userId',
              'status',
              'lastName',
              'firstName',
              'phone',
              'storeName',
              'createdAt',
            ],
            filterProperties: [
              'status',
              'userId',
              'phone',
              'storeName',
              'createdAt',
            ],
            showProperties: [
              'id',
              'userId',
              'status',
              'lastName',
              'firstName',
              'middleName',
              'phone',
              'city',
              'warehouseAddress',
              'storeName',
              'storeSlug',
              'storeDescription',
              'storeLogo',
              'createdAt',
              'updatedAt',
            ],
            editProperties: [],
            properties: {
              id: { label: 'ID' },
              userId: { label: 'Пользователь' },
              status: { label: 'Статус' },
              lastName: { label: 'Фамилия' },
              firstName: { label: 'Имя' },
              middleName: { label: 'Отчество' },
              phone: { label: 'Телефон' },
              city: { label: 'Город' },
              warehouseAddress: { label: 'Адрес склада' },
              storeName: { label: 'Название магазина' },
              storeSlug: { label: 'Слаг магазина' },
              storeDescription: { label: 'Описание магазина' },
              storeLogo: { label: 'Логотип магазина' },
              createdAt: { label: 'Создано' },
              updatedAt: { label: 'Обновлено' },
            },
            actions: {
              new: { isAccessible: false },
              edit: { isAccessible: false },
              delete: { isAccessible: false },

              approveSellerApplication: {
                actionType: 'record',
                label: 'Одобрить',
                icon: 'Checkmark',
                component: false,
                guard: 'Одобрить заявку и перевести пользователя в Seller?',
                isAccessible: ({ record, currentAdmin }) =>
                  currentAdmin?.role === 'ADMIN' && record?.params?.status === 'PENDING',
                handler: async (_request, _response, context) => {
                  const { record, resource, currentAdmin } = context;

                  if (!record) {
                    return {
                      notice: {
                        message: 'Заявка не найдена',
                        type: 'error',
                      },
                    };
                  }

                  const applicationId = Number(record.params.id);

                  const application = await prisma.sellerApplication.findUnique({
                    where: { id: applicationId },
                  });

                  if (!application) {
                    return {
                      notice: {
                        message: 'Заявка не найдена',
                        type: 'error',
                      },
                    };
                  }

                  if (application.status !== 'PENDING') {
                    return {
                      notice: {
                        message: 'Заявка уже обработана',
                        type: 'error',
                      },
                    };
                  }

                  await prisma.$transaction(async (tx) => {
                    await tx.sellerApplication.update({
                      where: { id: applicationId },
                      data: {
                        status: 'APPROVED',
                      },
                    });

                    await tx.user.update({
                      where: { id: application.userId },
                      data: {
                        role: 'SELLER',
                        isSellerApproved: true,
                        lastName: application.lastName,
                        firstName: application.firstName,
                        middleName: application.middleName,
                        phone: application.phone,
                        city: application.city,
                        warehouseAddress: application.warehouseAddress,
                        storeName: application.storeName,
                        storeSlug: application.storeSlug,
                        storeDescription: application.storeDescription,
                        storeLogo: application.storeLogo,
                        isProfileComplete: true,
                      },
                    });
                  });

                  const updatedRecord = await resource.findOne(String(applicationId));

                  return {
                    record: updatedRecord?.toJSON(currentAdmin),
                    notice: {
                      message: 'Заявка одобрена. Пользователь стал продавцом.',
                      type: 'success',
                    },
                  };
                },
              },

              rejectSellerApplication: {
                actionType: 'record',
                label: 'Отклонить',
                icon: 'Close',
                component: false,
                guard: 'Отклонить заявку?',
                isAccessible: ({ record, currentAdmin }) =>
                  currentAdmin?.role === 'ADMIN' && record?.params?.status === 'PENDING',
                handler: async (_request, _response, context) => {
                  const { record, resource, currentAdmin } = context;

                  if (!record) {
                    return {
                      notice: {
                        message: 'Заявка не найдена',
                        type: 'error',
                      },
                    };
                  }

                  const applicationId = Number(record.params.id);

                  await prisma.sellerApplication.update({
                    where: { id: applicationId },
                    data: {
                      status: 'REJECTED',
                    },
                  });

                  const updatedRecord = await resource.findOne(String(applicationId));

                  return {
                    record: updatedRecord?.toJSON(currentAdmin),
                    notice: {
                      message: 'Заявка отклонена',
                      type: 'success',
                    },
                  };
                },
              },
            },
          },
        },
      {
        resource: { model: getModelByName('Category'), client: prisma },
        options: {
          label: 'Категории',
          navigation: {
            name: 'Каталог',
            icon: 'Category',
          },
          listProperties: ['name', 'slug', 'createdAt'],
          filterProperties: ['name', 'slug', 'createdAt'],
          showProperties: ['id', 'name', 'slug', 'createdAt', 'updatedAt'],
          editProperties: ['name', 'slug'],
          properties: {
            name: { label: 'Название' },
            slug: { label: 'Слаг' },
            createdAt: { label: 'Создана' },
            updatedAt: { label: 'Обновлена' },
          },
        },
      },
      {
        resource: { model: getModelByName('HomepageBanner'), client: prisma },
        options: {
          label: 'Баннеры главной',
          navigation: {
            name: 'Маркетинг',
            icon: 'Image',
          },
          listProperties: [
            'title',
            'imageUrl',
            'linkUrl',
            'sortOrder',
            'isActive',
            'openInNewTab',
            'createdAt',
          ],
          filterProperties: [
            'title',
            'linkUrl',
            'isActive',
            'openInNewTab',
            'createdAt',
          ],
          showProperties: [
            'id',
            'title',
            'imageUrl',
            'linkUrl',
            'sortOrder',
            'isActive',
            'openInNewTab',
            'createdAt',
            'updatedAt',
          ],
          editProperties: [
            'title',
            'imageUpload',
            'linkUrl',
            'sortOrder',
            'isActive',
            'openInNewTab',
          ],

          properties: {
            id: {
              isVisible: { list: false, filter: false, show: true, edit: false },
            },

            title: {
              label: 'Название',
            },

            imageUrl: {
              label: 'Изображение',
              isVisible: {
                list: true,
                filter: false,
                show: true,
                edit: false,
              },
            },

            imageUpload: {
              label: 'Изображение',
              type: 'string',
              isVisible: {
                list: false,
                filter: false,
                show: false,
                edit: true,
              },
              components: {
                edit: bannerImageUploadComponent,
                new: bannerImageUploadComponent,
              },
            },

            linkUrl: {
              label: 'Ссылка',
            },

            sortOrder: {
              label: 'Порядок',
            },

            isActive: {
              label: 'Активен',
            },

            openInNewTab: {
              label: 'Открывать в новой вкладке',
            },

            createdAt: {
              label: 'Создан',
              isVisible: { list: true, filter: true, show: true, edit: false },
            },

            updatedAt: {
              label: 'Обновлен',
              isVisible: { list: false, filter: false, show: true, edit: false },
            },
          },
          actions: {
            new: {
              label: 'Создать',
              before: async (request) => {
                if (request.method !== 'post') return request;

                const payload = request.payload ?? {};
                let imageUrl =
                  typeof payload.imageUrl === 'string' ? payload.imageUrl.trim() : '';

                if (typeof payload.imageUpload === 'string' && payload.imageUpload.startsWith('data:image/')) {
                  imageUrl = saveHomepageBannerFromDataUrl(payload.imageUpload);
                }

                request.payload = {
                  ...payload,
                  imageUrl,
                };

                delete request.payload.imageUpload;

                return request;
              },
            },

            edit: {
              label: 'Редактировать',
              before: async (request) => {
                if (request.method !== 'post') return request;

                const payload = request.payload ?? {};
                let imageUrl =
                  typeof payload.imageUrl === 'string' ? payload.imageUrl.trim() : '';

                if (typeof payload.imageUpload === 'string' && payload.imageUpload.startsWith('data:image/')) {
                  imageUrl = saveHomepageBannerFromDataUrl(payload.imageUpload);
                }

                request.payload = {
                  ...payload,
                  imageUrl,
                };

                delete request.payload.imageUpload;

                return request;
              },
            },

            show: { label: 'Просмотр' },
            delete: { label: 'Удалить' },
          },
          sort: {
            sortBy: 'sortOrder',
            direction: 'asc',
          },
        },
      },
      {
        resource: { model: getModelByName('Product'), client: prisma },
        options: {
          label: 'Товары',
          navigation: {
            name: 'Каталог',
            icon: 'Catalog',
          },
          listProperties: [
            'title',
            'sku',
            'priceFormatted',
            'stock',
            'moderationStatusLabel',
            'isPublishedLabel',
            'createdAtFormatted',
          ],
          filterProperties: [
            'title',
            'sku',
            'moderationStatus',
            'isPublished',
            'createdAt',
          ],
          showProperties: [
            'id',
            'title',
            'slug',
            'sku',
            'description',
            'priceFormatted',
            'stock',
            'compatibleModels',
            'moderationStatusLabel',
            'moderationComment',
            'isPublishedLabel',
            'createdAtFormatted',
            'updatedAtFormatted',
          ],
          properties: {
            title: { label: 'Название' },
            slug: { label: 'Слаг' },
            sku: { label: 'Артикул' },
            description: { label: 'Описание' },
            price: { label: 'Цена' },
            stock: { label: 'Остаток' },
            createdAt: { label: 'Создан' },
            updatedAt: { label: 'Обновлен' },
            imageUrl: { isVisible: false },
            moderationStatus: {
              label: 'Статус модерации',
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            moderationComment: {
              label: 'Комментарий модератора',
              isVisible: { list: false, filter: false, show: true, edit: true },
            },
            compatibleModels: {
              label: 'Совместимые модели',
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            isPublished: {
              label: 'Опубликован',
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            priceFormatted: {
              label: 'Цена',
              isVisible: { list: true, show: true, filter: false, edit: false },
            },
            moderationStatusLabel: {
              label: 'Статус модерации',
              isVisible: { list: true, show: true, filter: false, edit: false },
              components: {
                list: productModerationStatusBadge,
                show: productModerationStatusBadge,
              },
            },
            isPublishedLabel: {
              label: 'Опубликован',
              isVisible: { list: true, show: true, filter: false, edit: false },
            },
            createdAtFormatted: {
              label: 'Создан',
              isVisible: { list: true, show: true, filter: false, edit: false },
            },
            updatedAtFormatted: {
              label: 'Обновлен',
              isVisible: { list: false, show: true, filter: false, edit: false },
            },
          },
          actions: {
            list: {
              after: async (response) => {
                if (response.records) {
                  response.records = response.records.map((record) => {
                    record.params.priceFormatted = formatMoney(record.params.price);
                    record.params.moderationStatusLabel = mapProductModerationStatus(
                      record.params.moderationStatus,
                    );
                    record.params.isPublishedLabel = mapPublishedLabel(
                      record.params.isPublished,
                    );
                    record.params.createdAtFormatted = formatDateTime(record.params.createdAt);
                    record.params.updatedAtFormatted = formatDateTime(record.params.updatedAt);
                    return record;
                  });
                }

                return response;
              },
            },

            show: {
              label: 'Просмотр',
              after: async (response) => {
                if (response.record) {
                  response.record.params.priceFormatted = formatMoney(
                    response.record.params.price,
                  );
                  response.record.params.moderationStatusLabel = mapProductModerationStatus(
                    response.record.params.moderationStatus,
                  );
                  response.record.params.isPublishedLabel = mapPublishedLabel(
                    response.record.params.isPublished,
                  );
                  response.record.params.createdAtFormatted = formatDateTime(
                    response.record.params.createdAt,
                  );
                  response.record.params.updatedAtFormatted = formatDateTime(
                    response.record.params.updatedAt,
                  );
                }

                return response;
              },
            },
            new: { isAccessible: false },
            edit: { label: 'Редактировать' },
            exportExcel: {
              actionType: 'resource',
              label: 'Экспорт в Excel',
              icon: 'Download',
              isAccessible: true,
              component: exportExcelComponent,
            },
            approve: {
              actionType: 'record',
              label: 'Одобрить',
              component: false,
              guard: 'Подтвердить публикацию товара?',
              isAccessible: true,
              handler: async (request, response, context) => {
                const { record, currentAdmin, resource } = context;

                if (!record) {
                  return {
                    notice: {
                      message: 'Товар не найден',
                      type: 'error',
                    },
                    redirectUrl: '/admin/resources/Product',
                  };
                }

                await prisma.product.update({
                  where: { id: String(record.params.id) },
                  data: {
                    isPublished: true,
                    moderationStatus: 'APPROVED',
                    moderationComment: null,
                  },
                });

                const updatedRecord = await resource.findOne(String(record.params.id));

                return {
                  record: updatedRecord?.toJSON(currentAdmin),
                  notice: {
                    message: 'Товар опубликован',
                    type: 'success',
                  },
                  redirectUrl: `/admin/resources/Product/records/${record.params.id}/show`,
                };
              },
            },

            reject: {
              actionType: 'record',
              label: 'Отклонить',
              component: false,
              guard: 'Отклонить товар?',
              isAccessible: true,
              handler: async (request, response, context) => {
                const { record, currentAdmin, resource } = context;

                if (!record) {
                  return {
                    notice: {
                      message: 'Товар не найден',
                      type: 'error',
                    },
                    redirectUrl: '/admin/resources/Product',
                  };
                }

                await prisma.product.update({
                  where: { id: String(record.params.id) },
                  data: {
                    isPublished: false,
                    moderationStatus: 'REJECTED',
                  },
                });

                const updatedRecord = await resource.findOne(String(record.params.id));

                return {
                  record: updatedRecord?.toJSON(currentAdmin),
                  notice: {
                    message: 'Товар отклонён',
                    type: 'success',
                  },
                  redirectUrl: `/admin/resources/Product/records/${record.params.id}/show`,
                };
              },
            },

            delete: {
              isAccessible: true,
              handler: async (request, response, context) => {
                const record = context.record;

                if (!record?.params?.id) {
                  return {
                    notice: {
                      message: 'Товар не найден',
                      type: 'error',
                    },
                  };
                }

                const productId = String(record.params.id);

                await prisma.product.update({
                  where: { id: productId },
                  data: { isPublished: false },
                });

                return {
                  record: record.toJSON(context.currentAdmin),
                  notice: {
                    message: 'Товар скрыт',
                    type: 'success',
                  },
                };
              },
            },

            bulkDelete: {
              isAccessible: true,
              handler: async (request, response, context) => {
                const ids = context.records?.map((r) => String(r.params.id)) ?? [];

                if (!ids.length) {
                  return {
                    records: [],
                    notice: {
                      message: 'Товары не выбраны',
                      type: 'error',
                    },
                  };
                }

                await prisma.product.updateMany({
                  where: { id: { in: ids } },
                  data: { isPublished: false },
                });

                return {
                  records:
                    context.records?.map((r) => r.toJSON(context.currentAdmin)) ?? [],
                  notice: {
                    message: `Скрыто товаров: ${ids.length}`,
                    type: 'success',
                  },
                };
              },
            },
          },
          sort: {
            sortBy: 'createdAt',
            direction: 'desc',
          },
        },
      },
      {
        resource: { model: getModelByName('ProductImage'), client: prisma },
        options: {
          label: 'Изображения товаров',
          navigation: {
            name: 'Каталог',
            icon: 'Catalog',
          },
          properties: {
            productId: { label: 'Товар' },
            url: { label: 'Файл' },
            position: { label: 'Позиция' },
            createdAt: { label: 'Создано' },
          },
        },
      },
      {
        resource: { model: getModelByName('Order'), client: prisma },
        options: {
          label: 'Заказы',
          navigation: {
            name: 'Заказы',
            icon: 'ShoppingCart',
          },
          listProperties: [
            'orderNumber',
            'createdAtFormatted',
            'fullName',
            'phone',
            'deliveryMethodLabel',
            'totalFormatted',
            'statusLabel',
          ],
          filterProperties: [
            'createdAt',
            'fullName',
            'phone',
            'deliveryMethod',
            'status',
          ],
          showProperties: [
            'orderNumber',
            'createdAtFormatted',
            'fullName',
            'phone',
            'deliveryMethodLabel',
            'city',
            'street',
            'house',
            'apartment',
            'comment',
            'totalFormatted',
            'statusLabel',
          ],
          editProperties: [],
          properties: {
            orderNumber: {
              label: 'Номер заказа',
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            id: {
              isVisible: false,
            },
            createdAt: {
              label: 'Дата',
              isVisible: { list: false, filter: true, show: false, edit: false },
            },
            createdAtFormatted: {
              label: 'Дата',
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
            fullName: {
              label: 'ФИО',
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            phone: {
              label: 'Телефон',
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            deliveryMethod: {
              label: 'Доставка',
              isVisible: { list: false, filter: true, show: false, edit: false },
            },
            deliveryMethodLabel: {
              label: 'Доставка',
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
            city: {
              label: 'Город',
              isVisible: { list: false, filter: false, show: true, edit: false },
            },
            street: {
              label: 'Улица',
              isVisible: { list: false, filter: false, show: true, edit: false },
            },
            house: {
              label: 'Дом',
              isVisible: { list: false, filter: false, show: true, edit: false },
            },
            apartment: {
              label: 'Квартира',
              isVisible: { list: false, filter: false, show: true, edit: false },
            },
            comment: {
              label: 'Комментарий',
              isVisible: { list: false, filter: false, show: true, edit: false },
            },
            total: {
              label: 'Сумма',
              isVisible: { list: false, filter: false, show: false, edit: false },
            },
            totalFormatted: {
              label: 'Сумма',
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
            status: {
              label: 'Статус',
              isVisible: { list: false, filter: true, show: false, edit: false },
            },
            statusLabel: {
              label: 'Статус',
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
          },
          actions: {
            list: {
              label: 'Список',
              after: async (response) => {
                if (response.records) {
                  response.records = response.records.map((record) => {
                    record.params.createdAtFormatted = formatDateTime(record.params.createdAt);
                    record.params.deliveryMethodLabel = mapDeliveryMethod(
                      record.params.deliveryMethod,
                    );
                    record.params.totalFormatted = formatMoney(record.params.total);
                    record.params.statusLabel = mapOrderStatus(record.params.status);
                    return record;
                  });
                }

                return response;
              },
            },
            show: {
              label: 'Просмотр',
              after: async (response) => {
                if (response.record) {
                  response.record.params.createdAtFormatted = formatDateTime(
                    response.record.params.createdAt,
                  );
                  response.record.params.deliveryMethodLabel = mapDeliveryMethod(
                    response.record.params.deliveryMethod,
                  );
                  response.record.params.totalFormatted = formatMoney(
                    response.record.params.total,
                  );
                  response.record.params.statusLabel = mapOrderStatus(
                    response.record.params.status,
                  );
                }

                return response;
              },
            },
            
            edit: { isAccessible: false },
            new: { isAccessible: false },
            delete: { isAccessible: false },
            markAsPaid: {
              actionType: 'record',
              label: 'Отметить оплаченным',
              icon: 'Checkmark',
              component: false,
              guard: 'Подтвердить оплату заказа?',
              isAccessible: ({ currentAdmin }) => currentAdmin?.role === 'ADMIN',
              handler: async (request, response, context) => {
                const { record, resource } = context;

                if (!record) {
                  return {
                    notice: {
                      message: 'Заказ не найден',
                      type: 'error',
                    },
                  };
                }

                const orderId = String(record.params.id);

                await prisma.$transaction(async (tx) => {
                  await tx.orderItem.updateMany({
                    where: { orderId },
                    data: {
                      status: OrderStatus.PAID,
                    },
                  });

                  await tx.order.update({
                    where: { id: orderId },
                    data: {
                      status: OrderStatus.PAID,
                    },
                  });
                });

                const updatedRecord = await resource.findOne(record.id());

                return {
                  record: updatedRecord?.toJSON(context.currentAdmin),
                  notice: {
                    message: 'Заказ отмечен как оплаченный',
                    type: 'success',
                  },
                };
              },
            },
          },
        },
      },
      {
        resource: { model: getModelByName('OrderItem'), client: prisma },
        options: {
          label: 'Позиции заказа',
          navigation: {
            name: 'Заказы',
            icon: 'ShoppingCart',
          },
          listProperties: [
            'titleSnapshot',
            'skuSnapshot',
            'priceSnapshotFormatted',
            'quantity',
            'orderId',
          ],
          filterProperties: [
            'sellerId',
            'titleSnapshot',
            'skuSnapshot',
            'orderId',
          ],
          showProperties: [
            'id',
            'orderId',
            'productId',
            'sellerId',
            'titleSnapshot',
            'skuSnapshot',
            'priceSnapshotFormatted',
            'quantity',
          ],
          editProperties: [],
          properties: {
            priceSnapshotFormatted: {
              label: 'Цена',
              isVisible: { list: true, show: true, filter: false, edit: false },
            },
            id: {
              label: 'ID',
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            orderId: {
              label: 'Заказ',
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            productId: {
              label: 'Товар',
              isVisible: { list: false, filter: false, show: true, edit: false },
            },
            sellerId: {
              label: 'Продавец',
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            titleSnapshot: {
              label: 'Название',
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            skuSnapshot: {
              label: 'Артикул',
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            priceSnapshot: {
              label: 'Цена',
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
            quantity: {
              label: 'Количество',
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
          },
          actions: {
            list: {
              after: async (response) => {
                if (response.records) {
                  response.records = response.records.map((record) => {
                    record.params.priceSnapshotFormatted = formatMoney(
                      record.params.priceSnapshot,
                    );
                    return record;
                  });
                }

                return response;
              },
            },
            show: {
              after: async (response) => {
                if (response.record) {
                  response.record.params.priceSnapshotFormatted = formatMoney(
                    response.record.params.priceSnapshot,
                  );
                }

                return response;
              },
            },
            edit: { isAccessible: false },
            new: { isAccessible: false },
            delete: { isAccessible: false },
          },
        },
      },
      {
        resource: { model: getModelByName('FeedbackMessage'), client: prisma },
        options: {
          label: 'Обратная связь',
          navigation: {
            name: 'Поддержка',
            icon: 'Chat',
          },
          listProperties: [
            'createdAtFormatted',
            'name',
            'contact',
            'statusLabel',
            'messageShort',
          ],
          filterProperties: [
            'status',
            'name',
            'contact',
            'createdAt',
          ],
          showProperties: [
            'id',
            'createdAtFormatted',
            'updatedAtFormatted',
            'name',
            'contact',
            'statusLabel',
            'message',
          ],
          editProperties: ['status'],
          properties: {
            id: {
              label: 'ID',
              isVisible: { list: false, filter: false, show: true, edit: false },
            },
            name: {
              label: 'Имя',
            },
            contact: {
              label: 'Контакт',
            },
            message: {
              label: 'Сообщение',
              type: 'textarea',
              isVisible: { list: false, filter: false, show: true, edit: false },
            },
            messageShort: {
              label: 'Сообщение',
              isVisible: { list: true, filter: false, show: false, edit: false },
            },
            status: {
              label: 'Статус',
              availableValues: [
                { value: 'NEW', label: 'Новое' },
                { value: 'IN_PROGRESS', label: 'В работе' },
                { value: 'DONE', label: 'Закрыто' },
              ],
              isVisible: { list: false, filter: true, show: false, edit: true },
            },
            statusLabel: {
              label: 'Статус',
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
            createdAt: {
              label: 'Создано',
              isVisible: { list: false, filter: true, show: false, edit: false },
            },
            createdAtFormatted: {
              label: 'Создано',
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
            updatedAtFormatted: {
              label: 'Обновлено',
              isVisible: { list: false, filter: false, show: true, edit: false },
            },
            updatedAt: {
              label: 'Обновлено',
              isVisible: false,
            },
          },
          actions: {
            list: {
              after: async (response) => {
                if (response.records) {
                  response.records = response.records.map((record) => {
                    const message = String(record.params.message ?? '');
                    const status = String(record.params.status ?? '');

                    record.params.messageShort =
                      message.length > 120 ? `${message.slice(0, 120)}...` : message;

                    record.params.statusLabel =
                      status === 'NEW'
                        ? 'Новое'
                        : status === 'IN_PROGRESS'
                        ? 'В работе'
                        : status === 'DONE'
                        ? 'Закрыто'
                        : status;

                    record.params.createdAtFormatted = formatDateTime(record.params.createdAt);
                    record.params.updatedAtFormatted = formatDateTime(record.params.updatedAt);

                    return record;
                  });
                }

                return response;
              },
            },

            show: {
              after: async (response) => {
                if (response.record) {
                  const status = String(response.record.params.status ?? '');

                  response.record.params.statusLabel =
                    status === 'NEW'
                      ? 'Новое'
                      : status === 'IN_PROGRESS'
                      ? 'В работе'
                      : status === 'DONE'
                      ? 'Закрыто'
                      : status;

                  response.record.params.createdAtFormatted = formatDateTime(
                    response.record.params.createdAt,
                  );
                  response.record.params.updatedAtFormatted = formatDateTime(
                    response.record.params.updatedAt,
                  );
                }

                return response;
              },
            },

            new: { isAccessible: false },
            delete: { isAccessible: false },

            edit: {
              label: 'Изменить статус',
            },

            markInProgress: {
              actionType: 'record',
              label: 'В работу',
              icon: 'Play',
              component: false,
              isAccessible: ({ currentAdmin, record }) =>
                currentAdmin?.role === 'ADMIN' &&
                record?.params?.status !== 'IN_PROGRESS' &&
                record?.params?.status !== 'DONE',
              handler: async (_request, _response, context) => {
                const { record, resource, currentAdmin } = context;

                if (!record) {
                  return {
                    notice: {
                      message: 'Обращение не найдено',
                      type: 'error',
                    },
                  };
                }

                await prisma.feedbackMessage.update({
                  where: { id: String(record.params.id) },
                  data: { status: 'IN_PROGRESS' },
                });

                const updatedRecord = await resource.findOne(String(record.params.id));

                return {
                  record: updatedRecord?.toJSON(currentAdmin),
                  notice: {
                    message: 'Обращение переведено в работу',
                    type: 'success',
                  },
                };
              },
            },

            markDone: {
              actionType: 'record',
              label: 'Закрыть',
              icon: 'Checkmark',
              component: false,
              isAccessible: ({ currentAdmin, record }) =>
                currentAdmin?.role === 'ADMIN' &&
                record?.params?.status !== 'DONE',
              handler: async (_request, _response, context) => {
                const { record, resource, currentAdmin } = context;

                if (!record) {
                  return {
                    notice: {
                      message: 'Обращение не найдено',
                      type: 'error',
                    },
                  };
                }

                await prisma.feedbackMessage.update({
                  where: { id: String(record.params.id) },
                  data: { status: 'DONE' },
                });

                const updatedRecord = await resource.findOne(String(record.params.id));

                return {
                  record: updatedRecord?.toJSON(currentAdmin),
                  notice: {
                    message: 'Обращение закрыто',
                    type: 'success',
                  },
                };
              },
            },
          },
          sort: {
            sortBy: 'createdAt',
            direction: 'desc',
          },
        },
      },
    ],
    locale: {
      language: 'ru',
      translations: ruTranslations,
    },
    branding: ADMIN_BRANDING,
  });

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate: async (email: string, password: string) => {
        const adminUser = await prisma.user.findFirst({
          where: {
            email,
            role: 'ADMIN',
          },
        });

        if (
          adminUser &&
          email === process.env.ADMINJS_EMAIL &&
          password === process.env.ADMINJS_PASSWORD
        ) {
          return {
            email: adminUser.email,
            role: adminUser.role,
          };
        }

        return null;
      },
      cookieName: 'adminjs',
      cookiePassword:
        process.env.ADMINJS_COOKIE_SECRET || 'super_admin_cookie_secret',
    },
    null,
    {
      secret:
        process.env.ADMINJS_COOKIE_SECRET || 'super_admin_cookie_secret',
      resave: false,
      saveUninitialized: false,
    },
  );

  
  adminRouter.get('/export/products', async (req, res) => {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        seller: true,
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const rows = products.map((product, index) => ({
      '№': index + 1,
      'ID': product.id,
      'Название': product.title,
      'Артикул': product.sku,
      'Slug': product.slug,
      'Категория': product.category?.name ?? '',
      'Продавец': product.seller?.email ?? '',
      'Цена': Number(product.price),
      'Остаток': product.stock,
      'Опубликован': product.isPublished ? 'Да' : 'Нет',
      'Статус модерации': product.moderationStatus,
      'Комментарий модератора': product.moderationComment ?? '',
      'Совместимые модели': product.compatibleModels ?? '',
      'Главное фото': product.imageUrl ?? '',
      'Количество фото': product.images?.length ?? 0,
      'Создан': product.createdAt,
      'Обновлен': product.updatedAt,
      'Описание': product.description ?? '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="products-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.end(buffer);
  });
  const homepageBannerUploadDir = path.join(process.cwd(), 'uploads', 'homepage-banners');
  const saveHomepageBannerFromDataUrl = (dataUrl: string) => {
    const match = String(dataUrl).match(/^data:(.+);base64,(.+)$/);

    if (!match) {
      throw new Error('Некорректный формат изображения');
    }

    const [, mimeType, base64Data] = match;

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new Error('Разрешены только JPG, PNG, WEBP');
    }

    const buffer = Buffer.from(base64Data, 'base64');

    const maxSize = 8 * 1024 * 1024;
    if (buffer.length > maxSize) {
      throw new Error('Файл слишком большой. Максимум 8 МБ');
    }

    const extension =
      mimeType === 'image/png'
        ? '.png'
        : mimeType === 'image/webp'
        ? '.webp'
        : '.jpg';

    const storedFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    const storedFilePath = path.join(homepageBannerUploadDir, storedFileName);

    fs.writeFileSync(storedFilePath, buffer);

    return `/uploads/homepage-banners/${storedFileName}`;
  };

  if (!fs.existsSync(homepageBannerUploadDir)) {
    fs.mkdirSync(homepageBannerUploadDir, { recursive: true });
  }

  adminRouter.post(
    '/upload/homepage-banner',
    express.json({ limit: '10mb' }),
    async (req: any, res: any) => {
      try {
        if (!req.session?.adminUser) {
          return res.status(401).json({
            message: 'Не авторизован в админ-панели',
          });
        }

        console.log('UPLOAD ROUTE DEBUG content-type:', req.headers['content-type']);
        console.log('UPLOAD ROUTE DEBUG body:', req.body);

        const { filename, mimeType, dataUrl } = req.body ?? {};

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!filename || !mimeType || !dataUrl) {
          return res.status(400).json({
            message: `Пустые поля: filename=${Boolean(filename)}, mimeType=${Boolean(mimeType)}, dataUrl=${Boolean(dataUrl)}`,
          });
        }

        if (!allowedMimeTypes.includes(String(mimeType))) {
          return res.status(400).json({
            message: 'Разрешены только JPG, PNG, WEBP',
          });
        }

        const match = String(dataUrl).match(/^data:(.+);base64,(.+)$/);

        if (!match) {
          return res.status(400).json({
            message: 'Некорректный формат файла',
          });
        }

        const [, parsedMimeType, base64Data] = match;

        if (parsedMimeType !== mimeType) {
          return res.status(400).json({
            message: 'Некорректный MIME-тип файла',
          });
        }

        const buffer = Buffer.from(base64Data, 'base64');

        const maxSize = 8 * 1024 * 1024;
        if (buffer.length > maxSize) {
          return res.status(400).json({
            message: 'Файл слишком большой. Максимум 8 МБ',
          });
        }

        const extension =
          mimeType === 'image/png'
            ? '.png'
            : mimeType === 'image/webp'
            ? '.webp'
            : '.jpg';

        const storedFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        const storedFilePath = path.join(homepageBannerUploadDir, storedFileName);

        fs.writeFileSync(storedFilePath, buffer);

        console.log('BANNER FILE SAVED:', {
          storedFilePath,
          publicUrl: `/uploads/homepage-banners/${storedFileName}`,
          size: buffer.length,
        });

        return res.json({
          url: `/uploads/homepage-banners/${storedFileName}`,
        });
      } catch (error: any) {
        return res.status(400).json({
          message: error?.message || 'Ошибка загрузки файла',
        });
      }
    },
  );
  return { admin, adminRouter };
}