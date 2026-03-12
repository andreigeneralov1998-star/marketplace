"use client";

export default function AddToCartButton({ product }: any) {

  const handleAdd = async () => {
    const token = localStorage.getItem("accessToken");

    const res = await fetch("http://localhost:4000/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: product.id,
        quantity: 1,
      }),
    });

    if (res.ok) {
      alert("Товар добавлен в корзину");
    } else {
      const error = await res.json();
      alert(error.message);
    }
  };

  return (
    <button
      onClick={handleAdd}
      className="mt-6 rounded-xl bg-black px-6 py-3 text-white"
    >
      Добавить в корзину
    </button>
  );
}