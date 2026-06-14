"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { StarIcon, ShoppingCartIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const { addToCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/products?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.products?.length > 0) return fetch(`/api/products/${data.products[0].id}`);
      })
      .then((r) => r?.json())
      .then((p) => { if (p) setProduct(p); })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!product || !session?.user?.id) return;
    const myReview = product.reviews?.find((r: any) => r.user?.id === session.user.id);
    if (myReview) {
      setReviewRating(myReview.rating);
      setReviewComment(myReview.comment ?? "");
    }
  }, [product?.id, session?.user?.id]);

  const isAdmin = session?.user.role === "ADMIN";
  const canReview = product?.canReview ?? false;
  const myReview = product?.reviews?.find((r: any) => r.user?.id === session?.user?.id);

  const handleAddToCart = async () => {
    if (!session) { toast.error("กรุณาเข้าสู่ระบบก่อน"); router.push("/login"); return; }
    if (isAdmin) { toast.error("แอดมินไม่สามารถเพิ่มสินค้าลงตะกร้าได้"); return; }
    if (product.sizes?.length > 0 && !selectedSize) { toast.error("กรุณาเลือกไซส์"); return; }
    if (product.colors?.length > 0 && !selectedColor) { toast.error("กรุณาเลือกสี"); return; }
    await addToCart(product.id, quantity, selectedSize, selectedColor);
    toast.success("เพิ่มสินค้าลงตะกร้าแล้ว!");
  };

  const handleSubmitReview = async () => {
    if (!session) { router.push("/login"); return; }
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, rating: reviewRating, comment: reviewComment }),
    });
    if (res.ok) {
      toast.success(myReview ? "แก้ไขรีวิวสำเร็จ!" : "รีวิวสำเร็จ!");
      const updated = await fetch(`/api/products/${product.id}`).then((r) => r.json());
      setProduct(updated);
    }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-gray-100 dark:bg-[#1a2540] rounded-2xl animate-pulse" style={{ aspectRatio: "4/5" }} />
        <div className="space-y-4 py-4">
          {[40, 24, 16, 16, 32].map((h, i) => <div key={i} className="bg-gray-100 dark:bg-[#1a2540] rounded-xl animate-pulse" style={{ height: h }} />)}
        </div>
      </div>
    </div>
  );
  if (!product) return <div className="text-center py-20 text-gray-400 dark:text-[#4e6888]">ไม่พบสินค้า</div>;

  const avgRating = product.reviews?.length > 0
    ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/products" className="inline-flex items-center gap-1.5 text-gray-500 dark:text-[#6080a8] hover:text-blue-700 text-sm mb-8 group transition-colors">
        <ChevronLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        กลับไปหน้าสินค้า
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div>
          <div className="relative rounded-2xl overflow-hidden bg-gray-50 dark:bg-[#111827] mb-3 group" style={{ aspectRatio: "4/5" }}>
            {product.images?.[selectedImage] ? (
              <Image src={product.images[selectedImage]} alt={product.name} fill className="object-cover transition-all duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">👗</div>
            )}

            {product.images?.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white dark:bg-[#131c30]/90 hover:bg-white dark:bg-[#131c30] text-slate-700 dark:text-[#b8cef0] rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => (prev + 1) % product.images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-[#131c30]/90 hover:bg-white dark:bg-[#131c30] text-slate-700 dark:text-[#b8cef0] rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {product.images.map((_: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`rounded-full transition-all duration-200 ${i === selectedImage ? "w-5 h-1.5 bg-white dark:bg-[#131c30]" : "w-1.5 h-1.5 bg-white dark:bg-[#131c30]/50 hover:bg-white dark:bg-[#131c30]/80"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 ${i === selectedImage ? "border-blue-600 shadow-md shadow-blue-100" : "border-transparent hover:border-gray-300"}`}
                  style={{ width: 72, height: 90 }}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <p className="text-xs text-blue-600 font-semibold tracking-[0.2em] uppercase mb-2">{product.category?.name}</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-[#dde8ff] mb-3 leading-tight">{product.name}</h1>

          <div className="flex items-center gap-2 mb-5">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <StarIcon key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? "text-yellow-400" : "text-gray-200"}`} />
              ))}
            </div>
            <span className="text-sm text-gray-400 dark:text-[#4e6888]">({product.reviews?.length || 0} รีวิว)</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-blue-700">฿{product.price?.toLocaleString()}</span>
            {product.comparePrice && (
              <>
                <span className="text-gray-400 dark:text-[#4e6888] line-through text-lg">฿{product.comparePrice.toLocaleString()}</span>
                <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  -{Math.round((1 - product.price / product.comparePrice) * 100)}%
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-gray-500 dark:text-[#6080a8] text-sm leading-relaxed mb-6 border-b border-gray-100 dark:border-[#253350] pb-6">{product.description}</p>
          )}

          {product.sizes?.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">ไซส์</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-11 h-11 border rounded-xl text-sm font-medium transition-all duration-200 ${selectedSize === s ? "border-blue-700 bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40" : "border-gray-200 dark:border-[#304070] hover:border-blue-300 text-slate-600 dark:text-[#8aaad4]"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">สี{selectedColor && `: ${selectedColor}`}</p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((c: string) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 border rounded-xl text-sm font-medium transition-all duration-200 ${selectedColor === c ? "border-blue-700 bg-blue-50 dark:bg-[#0f1d38] text-blue-700 shadow-sm" : "border-gray-200 dark:border-[#304070] hover:border-blue-300 text-slate-600 dark:text-[#8aaad4]"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-200 dark:border-[#304070] rounded-xl overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-gray-500 dark:text-[#6080a8] hover:text-blue-700 hover:bg-blue-50 dark:bg-[#0f1d38] transition-colors text-lg">−</button>
              <span className="px-5 py-3 font-semibold text-slate-800 dark:text-[#dde8ff] text-sm min-w-[3rem] text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-4 py-3 text-gray-500 dark:text-[#6080a8] hover:text-blue-700 hover:bg-blue-50 dark:bg-[#0f1d38] transition-colors text-lg">+</button>
            </div>
            <span className="text-xs text-gray-400 dark:text-[#4e6888]">คงเหลือ {product.stock} ชิ้น</span>
          </div>

          {isAdmin ? (
            <div className="w-full py-4 bg-gray-100 dark:bg-[#1a2540] text-gray-400 dark:text-[#4e6888] text-center rounded-xl text-sm">
              แอดมินไม่สามารถซื้อสินค้าได้
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full flex items-center justify-center gap-2.5 py-4 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99] shadow-lg shadow-blue-200 dark:shadow-blue-900/40"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              {product.stock === 0 ? "หมดสต็อก" : "เพิ่มลงตะกร้า"}
            </button>
          )}

          {/* Specs chips */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-[#253350] grid grid-cols-2 gap-3">
            {product.sizes?.length > 0 && (
              <div className="bg-gray-50 dark:bg-[#111827] rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-gray-400 dark:text-[#4e6888] uppercase tracking-wider mb-0.5">ไซส์ที่มี</p>
                <p className="text-xs font-medium text-slate-700 dark:text-[#b8cef0]">{product.sizes.join(", ")}</p>
              </div>
            )}
            {product.colors?.length > 0 && (
              <div className="bg-gray-50 dark:bg-[#111827] rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-gray-400 dark:text-[#4e6888] uppercase tracking-wider mb-0.5">สีที่มี</p>
                <p className="text-xs font-medium text-slate-700 dark:text-[#b8cef0]">{product.colors.join(", ")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 border-t border-gray-100 dark:border-[#253350] pt-12">
        <div className="flex items-center gap-3 mb-8">
          <p className="text-xs text-blue-600 font-semibold tracking-[0.2em] uppercase">Reviews</p>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-[#dde8ff] mb-8">รีวิวจากลูกค้า <span className="text-gray-400 dark:text-[#4e6888] font-normal text-lg">({product.reviews?.length || 0})</span></h2>

        {session && !isAdmin && (
          canReview ? (
            <div className="bg-gray-50 dark:bg-[#111827] border border-gray-100 dark:border-[#253350] rounded-2xl p-6 mb-10">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-slate-800 dark:text-[#dde8ff]">{myReview ? "แก้ไขรีวิวของคุณ" : "เขียนรีวิวของคุณ"}</p>
                {myReview && <span className="text-xs text-blue-600 bg-blue-50 dark:bg-[#0f1d38] px-2.5 py-1 rounded-full">รีวิวแล้ว</span>}
              </div>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setReviewRating(s)} className="transition-transform hover:scale-110">
                    <StarIcon className={`w-7 h-7 ${s <= reviewRating ? "text-yellow-400" : "text-gray-200"}`} />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="แชร์ประสบการณ์การใช้สินค้า..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-[#304070] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#131c30] focus:bg-white dark:bg-[#131c30] transition-colors mb-4"
                rows={3}
              />
              <button
                onClick={handleSubmitReview}
                className="px-6 py-2.5 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors text-sm font-semibold"
              >
                {myReview ? "บันทึกการแก้ไข" : "ส่งรีวิว"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-amber-50 dark:bg-[#1a1500] border border-amber-200 dark:border-[#3d2e00] rounded-2xl px-5 py-4 mb-10">
              <StarIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                คุณสามารถรีวิวสินค้านี้ได้หลังจากได้รับสินค้าแล้วเท่านั้น
              </p>
            </div>
          )
        )}

        <div className="space-y-4">
          {product.reviews?.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-[#4e6888]">
              <StarIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p>ยังไม่มีรีวิว</p>
            </div>
          )}
          {product.reviews?.map((review: any) => {
            const isOwnReview = review.user?.id === session?.user?.id;
            return (
              <div key={review.id} className={`bg-white dark:bg-[#131c30] border rounded-2xl p-5 ${isOwnReview ? "border-blue-200 dark:border-[#304070]" : "border-gray-100 dark:border-[#253350]"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                      {review.user.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-slate-800 dark:text-[#dde8ff]">{review.user.name}</p>
                        {isOwnReview && <span className="text-[10px] bg-blue-100 dark:bg-[#0f1d38] text-blue-600 px-1.5 py-0.5 rounded-full">รีวิวของฉัน</span>}
                      </div>
                      <div className="flex gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <StarIcon key={s} className={`w-3 h-3 ${s <= review.rating ? "text-yellow-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {review.comment && <p className="text-sm text-gray-600 dark:text-[#8aaad4] leading-relaxed">{review.comment}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
