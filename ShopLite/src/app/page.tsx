'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/search?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setProducts(data.products || []);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError("Could not load products. (Check DATABASE_URL connection string)");
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <>
      <form method="GET" action="/" className="mb-8 flex max-w-lg">
        <input 
          type="text" 
          name="q" 
          defaultValue={q}
          className="border border-gray-300 p-3 rounded-l-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          placeholder="Search products..."
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-r-md transition-colors font-semibold">
          Search
        </button>
      </form>

      {q && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md">
          {/* HELIX-DEMO: security — intentionally planted for authorized self-testing */}
          {/* Plant #2: Reflected XSS via dangerouslySetInnerHTML - FIXED */}
          <p>Showing search results for: {q}</p>
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p: any) => (
            <div key={p.id} className="border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white text-black">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{p.name}</h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{p.description}</p>
              <div className="flex justify-between items-center mt-auto">
                <span className="font-bold text-2xl text-blue-600">₹{p.price}</span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Stock: {p.stock}</span>
              </div>
            </div>
          ))}
          {products.length === 0 && !error && !loading && (
            <div className="col-span-full text-center py-12 text-gray-500 text-lg">
              No products found. Try adjusting your search.
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function HomePage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 tracking-tight">Product Catalog</h1>
      <Suspense fallback={<div>Loading search...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
