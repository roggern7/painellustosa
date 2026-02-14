import { useEffect, useState, useMemo } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '@/lib/cfApi';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUpload from '@/components/admin/ImageUpload';
import MultiImageUpload from '@/components/admin/MultiImageUpload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Pencil, Trash2, Loader2, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  sizes: string;
  image_url: string;
  extra_images?: string[];
  price?: number;
  description?: string;
}

const categoryOptions = [
  { value: 'campo', label: 'Campo' },
  { value: 'futsal', label: 'Futsal' },
  { value: 'society', label: 'Society' },
];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sizeFilter, setSizeFilter] = useState<string>('all');

  const [form, setForm] = useState({
    name: '',
    price: '',
    image_url: '',
    extra_images: [] as string[],
    category: 'campo',
    sizes: '',
    description: '',
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data.items || []);
    } catch (error: any) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setForm({
      name: '',
      price: '',
      image_url: '',
      extra_images: [],
      category: 'campo',
      sizes: '',
      description: '',
    });
    setEditingProduct(null);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      price: product.price?.toString() || '',
      image_url: product.image_url || '',
      extra_images: product.extra_images || [],
      category: product.category || 'campo',
      sizes: product.sizes || '',
      description: product.description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name) { toast.error('Nome é obrigatório'); return; }
    if (!form.price) { toast.error('Preço é obrigatório'); return; }
    if (!form.image_url) { toast.error('Imagem é obrigatória'); return; }
    if (!form.sizes) { toast.error('Numerações são obrigatórias'); return; }

    setSaving(true);

    try {
      const payload = {
        name: form.name,
        category: form.category,
        sizes: form.sizes,
        image_url: form.image_url,
        extra_images: form.extra_images.length > 0 ? form.extra_images : [],
        price: parseFloat(form.price),
        description: form.description || null,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await createProduct(payload);
        toast.success('Produto adicionado com sucesso!');
      }

      resetForm();
      await loadProducts();
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error(error.message || 'Erro ao salvar produto');
    }

    setSaving(false);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await deleteProduct(product.id);
      toast.success('Produto excluído!');
      setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      toast.error(error.message || 'Erro ao excluir');
    }
  };

  const allSizes = useMemo(() => {
    const sizesSet = new Set<string>();
    products.forEach((product) => {
      if (product.sizes) {
        product.sizes.split(',').forEach((size) => {
          const trimmed = size.trim();
          const num = parseFloat(trimmed);
          if (num >= 37 && num <= 44) {
            sizesSet.add(trimmed);
          }
        });
      }
    });
    return Array.from(sizesSet).sort((a, b) => parseFloat(a) - parseFloat(b));
  }, [products]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = searchQuery === '' || p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSize = sizeFilter === 'all' || (p.sizes && p.sizes.split(',').map(s => s.trim()).includes(sizeFilter));
    return matchesCategory && matchesSearch && matchesSize;
  });

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'campo': return 'Campo';
      case 'futsal': return 'Futsal';
      case 'society': return 'Society';
      default: return cat || 'Sem categoria';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">GERENCIAR CATÁLOGO</h1>
          <p className="text-muted-foreground">Adicione, edite ou remova produtos do seu catálogo</p>
        </div>

        <div className="bg-secondary/50 rounded-xl p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-1">
            {editingProduct ? 'EDITAR CHUTEIRA' : 'ADICIONAR NOVA CHUTEIRA'}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Preencha os dados abaixo para {editingProduct ? 'atualizar o' : 'adicionar um novo'} produto ao catálogo
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="categoria" className="text-foreground font-medium">Categoria *</Label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm(f => ({ ...f, category: value }))}
              >
                <SelectTrigger className="bg-background border-border text-foreground h-12">
                  <SelectValue placeholder="Selecione a categoria..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome" className="text-foreground font-medium">Nome da Chuteira *</Label>
              <Input
                id="nome"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Nike Mercurial Vapor"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sizes" className="text-foreground font-medium">Numerações disponíveis *</Label>
              <Input
                id="sizes"
                value={form.sizes}
                onChange={(e) => setForm(f => ({ ...f, sizes: e.target.value }))}
                placeholder="Ex: 39, 40, 41, 42"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12"
              />
              <p className="text-xs text-muted-foreground">
                Separe os tamanhos por vírgula. Ex: 39, 40, 41, 42
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preco" className="text-foreground font-medium">Preço (R$) *</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="Ex: 299.90"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-foreground font-medium">Descrição</Label>
              <textarea
                id="descricao"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descreva o produto (opcional)"
                className="w-full min-h-[100px] rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground p-3 resize-y"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground font-medium">Imagem Principal *</Label>
              <ImageUpload
                value={form.image_url}
                onChange={(url) => setForm(f => ({ ...f, image_url: url }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground font-medium">Imagens Extras (Carrossel)</Label>
              <MultiImageUpload
                values={form.extra_images}
                onChange={(urls) => setForm(f => ({ ...f, extra_images: urls }))}
                maxImages={5}
              />
            </div>

            <div className="flex gap-3 pt-2">
              {editingProduct && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 border-border"
                  onClick={resetForm}
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                className="flex-1 h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold"
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingProduct ? 'Atualizar Chuteira' : 'Adicionar Chuteira'}
              </Button>
            </div>
          </form>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Pesquisar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border text-foreground h-12"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className={selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'border-border'}
            >
              Todos
            </Button>
            {categoryOptions.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.value)}
                className={selectedCategory === cat.value ? 'bg-primary text-primary-foreground' : 'border-border'}
              >
                {cat.label.toUpperCase()}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-sm font-medium mr-2">Numeração:</span>
            <button
              onClick={() => setSizeFilter('all')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                sizeFilter === 'all'
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              Todas
            </button>
            {allSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSizeFilter(size)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  sizeFilter === size
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-secondary/30 rounded-xl border border-border">
            <p className="text-lg">Nenhum produto encontrado</p>
            <p className="text-sm">Adicione um novo produto usando o formulário acima</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-secondary/50 rounded-xl border border-border overflow-hidden group"
              >
                {product.image_url ? (
                  <div className="aspect-square bg-background">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-background flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Sem imagem</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground truncate">{product.name}</h3>
                      <p className="text-xs text-muted-foreground">{getCategoryLabel(product.category)}</p>
                      {product.sizes && (
                        <p className="text-xs text-muted-foreground">Num: {product.sizes}</p>
                      )}
                      {product.price && (
                        <p className="text-primary font-bold mt-1">R$ {product.price.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-border"
                      onClick={() => openEditProduct(product)}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDelete(product)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
