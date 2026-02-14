import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { fetchProducts } from "@/lib/cfApi";
import logoLustosa from "@/assets/logo-lustosa.jpg";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  sizes: string;
  category: string;
}

type CategoryFilter = "todos" | "campo" | "futsal" | "society";

const Catalogo = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("todos");
  const [sizeFilter, setSizeFilter] = useState<string>("todos");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data.items || []);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  const allSizes = useMemo(() => {
    const sizesSet = new Set<string>();
    products.forEach((product) => {
      if (product.sizes) {
        product.sizes.split(",").forEach((size) => {
          sizesSet.add(size.trim());
        });
      }
    });
    return Array.from(sizesSet).sort((a, b) => Number(a) - Number(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        categoryFilter === "todos" ||
        product.category?.toLowerCase() === categoryFilter;

      const matchesSize =
        sizeFilter === "todos" ||
        (product.sizes && product.sizes.split(",").map(s => s.trim()).includes(sizeFilter));

      return matchesCategory && matchesSize;
    });
  }, [products, categoryFilter, sizeFilter]);

  const categories: { key: CategoryFilter; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "campo", label: "CAMPO" },
    { key: "futsal", label: "FUTSAL" },
    { key: "society", label: "SOCIETY" },
  ];

  return (
    <div className="min-h-screen bg-[#2d3748]">
      <header className="bg-[#1a202c] py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={logoLustosa}
            alt="Lustosa Sports"
            className="w-12 h-12 rounded-lg object-cover"
          />
          <h1 className="text-xl font-bold text-white">Lustosa Sports</h1>
        </div>
        <Link to="/admin/login">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
      </header>

      <main className="p-6">
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategoryFilter(cat.key)}
                className={`px-5 py-2.5 rounded-md font-bold text-sm uppercase tracking-wide transition-colors ${
                  categoryFilter === cat.key
                    ? "bg-[#ecc94b] text-[#1a202c]"
                    : "bg-[#3d4a5c] text-[#ecc94b] hover:bg-[#4a5568]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-white/70 text-sm font-medium mr-2">Numeração:</span>
            <button
              onClick={() => setSizeFilter("todos")}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                sizeFilter === "todos"
                  ? "bg-[#ecc94b] text-[#1a202c] font-semibold"
                  : "bg-[#3d4a5c] text-white hover:bg-[#4a5568]"
              }`}
            >
              Todas
            </button>
            {allSizes.filter(size => {
              const num = parseInt(size);
              return num >= 37 && num <= 44;
            }).map((size) => (
              <button
                key={size}
                onClick={() => setSizeFilter(size)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  sizeFilter === size
                    ? "bg-[#ecc94b] text-[#1a202c] font-semibold"
                    : "bg-[#3d4a5c] text-white hover:bg-[#4a5568]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-white py-12">Carregando produtos...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-white/70 py-12">
            Nenhum produto encontrado com os filtros selecionados.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-[#1a202c] rounded-lg overflow-hidden group cursor-pointer hover:ring-2 hover:ring-[#ecc94b] transition-all"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-white text-sm font-medium truncate">{product.name}</h3>
                  <p className="text-[#ecc94b] font-bold mt-1">
                    R$ {product.price?.toFixed(2).replace(".", ",")}
                  </p>
                  <p className="text-white/50 text-xs mt-1">
                    Tam: {product.sizes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Catalogo;
