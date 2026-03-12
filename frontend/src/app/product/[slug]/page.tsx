import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

async function getProduct(slug: string) {
  const res = await fetch(`http://localhost:4000/api/products/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Product not found");
  }

  return res.json();
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  return (
    <section className="grid gap-8 lg:grid-cols-2">
      <div>
        {product.images?.length ? (
          product.images.map((img: any) => (
            <img
              key={img.id}
              src={`http://localhost:4000${img.url}`}
              alt={product.title}
              className="mb-4 w-full rounded-xl border"
            />
          ))
        ) : (
          <div className="flex h-80 items-center justify-center rounded-xl bg-slate-100">
            Нет изображений
          </div>
        )}
      </div>

      <div>
        <Link href="/catalog" className="text-sm underline">
          ← Назад в каталог
        </Link>

        <h1 className="mt-3 text-3xl font-bold">{product.title}</h1>

        <p className="mt-4 text-2xl font-bold">{product.price} BYN</p>

        <div className="mt-6 rounded-xl border p-4">
          <h2 className="font-semibold">Описание</h2>
          <p className="mt-2 text-slate-600">
            {product.description || "Описание отсутствует"}
          </p>
        </div>

        <div className="mt-4 rounded-xl border p-4">
          <p>
            <strong>SKU:</strong> {product.sku}
          </p>
          <p className="mt-2">
            <strong>Остаток:</strong> {product.stock}
          </p>
        </div>

        <AddToCartButton product={product} />
      </div>
    </section>
  );
}