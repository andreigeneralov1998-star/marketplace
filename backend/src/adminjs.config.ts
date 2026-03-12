import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Важно: TS не должен превращать это в require()
const dynamicImport = new Function(
  'modulePath',
  'return import(modulePath)',
) as (modulePath: string) => Promise<any>;

async function recalculateOrderStatus(orderId: string) {
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId },
    select: { status: true },
  });

  if (!orderItems.length) return;

  const statuses = orderItems.map((item) => item.status);

  let orderStatus: OrderStatus = OrderStatus.PENDING;

  if (statuses.every((s) => s === 'DELIVERED')) {
    orderStatus = OrderStatus.DELIVERED;
  } else if (statuses.every((s) => s === 'CANCELLED')) {
    orderStatus = OrderStatus.CANCELLED;
  } else if (statuses.every((s) => s === 'SHIPPED' || s === 'DELIVERED')) {
    orderStatus = OrderStatus.SHIPPED;
  } else if (
    statuses.some(
      (s) =>
        s === 'PROCESSING' ||
        s === 'SHIPPED' ||
        s === 'DELIVERED' ||
        s === 'PAID',
    )
  ) {
    orderStatus = OrderStatus.PROCESSING;
  } else if (statuses.every((s) => s === 'PAID')) {
    orderStatus = OrderStatus.PAID;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: orderStatus },
  });
}

export async function buildAdminRouter() {
  const AdminJSModule = await dynamicImport('adminjs');
  const AdminJSExpressModule = await dynamicImport('@adminjs/express');
  const AdminJSPrismaModule = await dynamicImport('@adminjs/prisma');

  const AdminJS = AdminJSModule.default;
  const AdminJSExpress =
    AdminJSExpressModule.default || AdminJSExpressModule;
  const { Database, Resource, getModelByName } = AdminJSPrismaModule;

  AdminJS.registerAdapter({ Database, Resource });

  const admin = new AdminJS({
    rootPath: '/admin',
    resources: [
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
          },
        },
      },
      {
        resource: { model: getModelByName('ProductImage'), client: prisma },
      },
      {
        resource: { model: getModelByName('Order'), client: prisma },
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
            'status',
            'orderId',
          ],
          filterProperties: [
            'status',
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
            'status',
          ],
          editProperties: ['status'],
          properties: {
            status: {
              availableValues: [
                { value: 'PENDING', label: 'Новый' },
                { value: 'PAID', label: 'Оплачен' },
                { value: 'PROCESSING', label: 'В обработке' },
                { value: 'SHIPPED', label: 'Отправлен' },
                { value: 'DELIVERED', label: 'Доставлен' },
                { value: 'CANCELLED', label: 'Отменён' },
              ],
            },
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
            edit: {
              after: async (response) => {
                const record = response.record;

                if (record?.params?.orderId) {
                  await recalculateOrderStatus(String(record.params.orderId));
                }

                return response;
              },
            },
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

  return { admin, adminRouter };
}