import { PrismaClient, OrderStatus } from '@prisma/client';
import * as XLSX from 'xlsx';
import path from 'path';


const prisma = new PrismaClient();


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
    path.join(__dirname, 'admin', 'components', 'export-excel'),
  );
  const admin = new AdminJS({
    rootPath: '/admin',
    resources: [
      {
        resource: { model: getModelByName('SellerWithdrawalRequest'), client: prisma },
        options: {
          listProperties: [
            'id',
            'createdAt',
            'sellerId',
            'amountFormatted',
            'methodLabel',
            'status',
          ],
          filterProperties: [
            'sellerId',
            'method',
            'status',
            'createdAt',
          ],
          showProperties: [
            'id',
            'sellerId',
            'amountFormatted',
            'methodLabel',
            'status',
            'topsetAccountName',
            'pickupLocation',
            'comment',
            'processedAt',
            'processedByAdminId',
            'createdAt',
            'updatedAt',
          ],
          editProperties: [],
          properties: {
            sellerId: {
              label: 'Seller',
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

                    record.params.amountFormatted = `${(amountInCents / 100).toFixed(2)} BYN`;
                    record.params.methodLabel =
                      method === 'TOPSET_BALANCE'
                        ? 'На баланс TOPSET'
                        : method === 'TOPSET_CASH'
                        ? 'Наличными в TOPSET'
                        : method;

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

                  response.record.params.amountFormatted = `${(amountInCents / 100).toFixed(2)} BYN`;
                  response.record.params.methodLabel =
                    method === 'TOPSET_BALANCE'
                      ? 'На баланс TOPSET'
                      : method === 'TOPSET_CASH'
                      ? 'Наличными в TOPSET'
                      : method;
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
      },
      {
        resource: { model: getModelByName('Category'), client: prisma },
      },
      {
        resource: { model: getModelByName('Product'), client: prisma },
        options: {
          properties: {
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
          },
          actions: {
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
        },
      },
      {
        resource: { model: getModelByName('ProductImage'), client: prisma },
      },
      {
        resource: { model: getModelByName('Order'), client: prisma },
        options: {
          listProperties: [
            'id',
            'createdAt',
            'sellerId',
            'userId',
            'total',
            'status',
          ],
          filterProperties: [
            'id',
            'createdAt',
            'sellerId',
            'userId',
            'status',
          ],
          showProperties: [
            'id',
            'createdAt',
            'sellerId',
            'userId',
            'fullName',
            'phone',
            'deliveryMethod',
            'city',
            'street',
            'house',
            'apartment',
            'comment',
            'total',
            'status',
          ],
          editProperties: [],
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            createdAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            sellerId: {
              label: 'Seller',
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            userId: {
              label: 'Пользователь',
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            total: {
              label: 'Сумма',
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
            status: {
              label: 'Статус',
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
          },
          actions: {
            edit: { isAccessible: false },
            new: { isAccessible: false },
            delete: { isAccessible: false },
            markAsPaid: {
              actionType: 'record',
              label: 'Оплачен',
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
          listProperties: [
            'id',
            'sellerId',
            'titleSnapshot',
            'skuSnapshot',
            'priceSnapshot',
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
            'priceSnapshot',
            'quantity',
          ],
          editProperties: [],
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            orderId: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            productId: {
              isVisible: { list: false, filter: false, show: true, edit: false },
            },
            sellerId: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            titleSnapshot: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            skuSnapshot: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            priceSnapshot: {
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
            quantity: {
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
          },
          actions: {
            edit: { isAccessible: false },
            new: { isAccessible: false },
            delete: { isAccessible: false },
          },
        },
      },
    ],
    branding: {
      companyName: 'Marketplace Admin',
    },
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

  return { admin, adminRouter };
}