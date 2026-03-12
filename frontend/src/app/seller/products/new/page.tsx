import { ProductForm } from '@/components/forms/product-form';

export default function NewSellerProductPage() {
  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold">Новый товар</h1>
      <ProductForm />
    </section>
  );
}