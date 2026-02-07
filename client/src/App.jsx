import productsBg from './assets/hero/products-bg.jpeg'
import logo from './assets/logo.svg'
import heroImage from './assets/hero/hero.jpeg'
import sobreNosotrosBg from './assets/hero/sobrenosotros.PNG'
import contactImage from './assets/hero/contacto.PNG'
import { Routes, Route, Link } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'

const initialForm = {
  title: '',
  description: '',
  category: 'quesos',
  price: '',
  unit: '',
  imageUrl: '',
  isFeatured: false
}

const categories = [
  { value: 'quesos', label: 'Quesos' },
  { value: 'frutos_secos', label: 'Frutos secos' },
  { value: 'huevos_campo', label: 'Huevos de campo' },
  { value: 'otros', label: 'Otros' }
]

const categoryLabels = {
  quesos: 'Quesos',
  frutos_secos: 'Frutos secos',
  huevos_campo: 'Huevos de campo',
  otros: 'Otros'
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  )
}

function useInView(options = {}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2, ...options }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [options])

  return { ref, isVisible }
}

function Reveal({ children, delay = 0 }) {
  const { ref, isVisible } = useInView()

  return (
    <div
      ref={ref}
      className={`reveal ${isVisible ? 'reveal-visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function useQuantityById(cartItems) {
  return useMemo(() => {
    return cartItems.reduce((acc, item) => {
      acc[item.id] = item.quantity
      return acc
    }, {})
  }, [cartItems])
}

function QuantityControl({ quantity, onDecrement, onIncrement, label }) {
  return (
    <div className="flex items-center justify-between rounded-full border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm">
      <button
        type="button"
        onClick={onDecrement}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-200 text-brand-700 transition hover:bg-brand-50"
        aria-label={`Reducir ${label}`}
      >
        -
      </button>
      <span className="min-w-[24px] text-center text-sm font-semibold text-brand-800">{quantity}</span>
      <button
        type="button"
        onClick={onIncrement}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-200 text-brand-700 transition hover:bg-brand-50"
        aria-label={`Agregar ${label}`}
      >
        +
      </button>
    </div>
  )
}

function Home() {
  const [products, setProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('todos')

  const normalizeProduct = (product) => ({
    ...product,
    title: product.title ?? product.name ?? '',
    description: product.description ?? '',
    unit: product.unit ?? '',
    isFeatured: product.isFeatured ?? false
  })

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data.map(normalizeProduct)))
      .catch(() => setProducts([]))
  }, [])

  useEffect(() => {
    fetch('/api/products/featured')
      .then((res) => {
        if (!res.ok) throw new Error('No featured products')
        return res.json()
      })
      .then((data) => setFeaturedProducts(data.map(normalizeProduct)))
      .catch(() => setFeaturedProducts(null))
  }, [])

  const catalog = useMemo(() => {
    const fallback = [
      {
        id: 'dummy-1',
        title: 'Mantequilla de campo',
        description: 'Mantequilla suave con notas de crema fresca.',
        category: 'otros',
        price: 4200,
        unit: '250g',
        imageUrl:
          'https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'dummy-2',
        title: 'Miel orgánica',
        description: 'Miel floral con aroma intenso y textura sedosa.',
        category: 'otros',
        price: 5600,
        unit: '350g',
        imageUrl:
          'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=800&q=80'
      }
    ]
    const list = products.length >= 8 ? products : [...products, ...fallback]
    return list.slice(0, 12).map(normalizeProduct)
  }, [products])

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const total = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0)

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleSelectCategory = (category) => {
    setSelectedCategory(category)
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const featuredList = useMemo(() => {
    const source = featuredProducts ?? products.filter((product) => product.isFeatured)
    return source.slice(0, 3).map(normalizeProduct)
  }, [featuredProducts, products])

  return (
    <div className="min-h-screen bg-brand-50 text-brand-900">
      <Navbar
        totalItems={totalItems}
        onCartClick={() => setDrawerOpen(true)}
        onCategorySelect={handleSelectCategory}
      />
      <main>
        <Hero
          onProductsClick={() =>
            document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
          onNewsClick={() =>
            document.getElementById('novedades')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        />
        <Reveal delay={80}>
          <FeaturedSection
            products={featuredList}
            onAdd={addToCart}
            onDecrement={(productId) => updateQuantity(productId, -1)}
            cartItems={cartItems}
          />
        </Reveal>
        <Reveal delay={120}>
          <Products
            products={catalog}
            onAdd={addToCart}
            onDecrement={(productId) => updateQuantity(productId, -1)}
            cartItems={cartItems}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </Reveal>
        <Reveal>
          <About />
        </Reveal>
        <Reveal delay={180}>
          <Contact />
        </Reveal>
      </main>
      <Footer />
      <FloatingButtons drawerOpen={drawerOpen} />
      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={cartItems}
        total={total}
        onRemove={removeItem}
        onUpdate={updateQuantity}
      />
    </div>
  )
}

function Navbar({ totalItems, onCartClick, onCategorySelect }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isProductsOpen, setIsProductsOpen] = useState(false)
  const productsMenuRef = useRef(null)
  const productsMobileRef = useRef(null)
  const closeTimeoutRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isProductsOpen) return
    const handleClickOutside = (event) => {
      const target = event.target
      if (
        productsMenuRef.current?.contains(target) ||
        productsMobileRef.current?.contains(target)
      ) {
        return
      }
      setIsProductsOpen(false)
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsProductsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isProductsOpen])

  const openProductsMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    setIsProductsOpen(true)
  }

  const scheduleCloseProductsMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsProductsOpen(false)
    }, 160)
  }

  const productLinks = [
    { label: 'Ver todo', value: 'todos' },
    { label: 'Quesos', value: 'quesos' },
    { label: 'Frutos secos', value: 'frutos_secos' },
    { label: 'Huevos de campo', value: 'huevos_campo' },
    { label: 'Otros', value: 'otros' }
  ]

  return (
    <header
      className={`sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur transition-all duration-300 ${isScrolled ? 'shadow-lg shadow-brand-900/5' : ''
        }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-all duration-300 ${isScrolled ? 'py-3' : 'py-5'
          }`}
      >
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="Alma de Granja"
            className="h-16 max-w-[140px] w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a href="#inicio" className="nav-link text-brand-700">
            Inicio
          </a>
          <a href="#nosotros" className="nav-link text-brand-700">
            Nosotros
          </a>
          <a href="#novedades" className="nav-link text-brand-700">
            Novedades
          </a>
          <div
            ref={productsMenuRef}
            className="group relative"
            onMouseEnter={openProductsMenu}
            onMouseLeave={scheduleCloseProductsMenu}
          >
            <button
              type="button"
              className="nav-link flex items-center gap-2 text-brand-700"
              onClick={() => setIsProductsOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={isProductsOpen}
            >
              Productos
              <span className="text-xs">▾</span>
            </button>
            <div
              onMouseEnter={openProductsMenu}
              onMouseLeave={scheduleCloseProductsMenu}
              className={`absolute left-0 top-full mt-3 w-48 rounded-2xl border border-brand-100 bg-white p-2 shadow-xl shadow-brand-900/10 transition ${isProductsOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                } md:group-hover:pointer-events-auto md:group-hover:opacity-100`}
            >
              {productLinks.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    onCategorySelect(item.value)
                    setIsProductsOpen(false)
                  }}
                  className="nav-link block w-full rounded-xl px-4 py-2 text-left text-sm text-brand-700"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <a href="#contacto" className="nav-link text-brand-700">
            Contacto
          </a>
          <button
            type="button"
            onClick={onCartClick}
            className="flex items-center gap-2 rounded-full bg-brand-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white shadow-lg shadow-brand-900/15 transition hover:-translate-y-0.5 hover:bg-brand-700"
          >
            Carro ({totalItems})
          </button>
        </nav>
        <button
          type="button"
          onClick={onCartClick}
          className="md:hidden rounded-full border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700"
        >
          Carro ({totalItems})
        </button>
        <div ref={productsMobileRef} className="relative md:hidden">
          <button
            type="button"
            onClick={() => setIsProductsOpen((prev) => !prev)}
            className="ml-2 rounded-full border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700"
          >
            Productos
          </button>
          {isProductsOpen ? (
            <div className="absolute right-0 top-full mt-3 w-48 rounded-2xl border border-brand-100 bg-white p-2 shadow-xl shadow-brand-900/10">
              {productLinks.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    onCategorySelect(item.value)
                    setIsProductsOpen(false)
                  }}
                  className="nav-link block w-full rounded-xl px-4 py-2 text-left text-sm text-brand-700"
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

function Hero({ onProductsClick, onNewsClick }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 150)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section
      id="inicio"
      className="relative scroll-mt-24 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10,10,10,0.45), rgba(10,10,10,0.25)), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* brillo suave arriba */}
      <div className="pointer-events-none absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />
      {/* degradé abajo para que termine suave */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-brand-50 to-transparent" />

      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center">
        <div className="space-y-6">
          <p
            className={`fade-up text-xs uppercase tracking-[0.35em] text-white/80 ${visible ? 'show' : ''}`}
          >
            Productos de granja premium
          </p>

          <h1
            className={`fade-up font-serif text-4xl font-semibold text-white md:text-5xl ${visible ? 'show' : ''}`}
          >
            Sabores artesanales desde el alma de nuestra granja.
          </h1>

          <p className={`fade-up text-lg text-white/85 ${visible ? 'show' : ''}`}>
            Seleccionamos ingredientes nobles, procesos sostenibles y una experiencia cuidada para llegar con
            frescura a tu mesa.
          </p>

          <div className={`fade-up flex flex-wrap justify-center gap-4 ${visible ? 'show' : ''}`}>
            <button
              onClick={onProductsClick}
              className="rounded-full bg-white px-7 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-brand-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-white/90"
            >
              Productos
            </button>

            <button
              onClick={onNewsClick}
              className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              Novedades
            </button>
          </div>

          <div className="flex justify-center">
            <p className="rounded-full border border-orange-200/80 bg-white/80 px-6 py-3 text-center text-sm font-semibold text-orange-600 shadow-lg shadow-orange-500/10 backdrop-blur-sm">
              Despachamos GRATIS en San Francisco de Mostazal, Graneros, Rancagua y Machalí por compras sobre $20.000
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturedSection({ products, onAdd, onDecrement, cartItems }) {
  const quantityById = useQuantityById(cartItems)

  return (
    <section id="novedades" className="scroll-mt-24 bg-[#F7F3EE]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-500">Novedades</p>
            <h2 className="mt-3 font-serif text-3xl text-brand-900">Lo último de la granja.</h2>
          </div>
          <p className="max-w-md text-sm text-brand-600">
            Descubre las incorporaciones recientes seleccionadas para esta semana.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.length === 0 ? (
            <div className="rounded-3xl border border-brand-100 bg-brand-50 p-6 text-sm text-brand-600 shadow-sm">
              Aún no hay novedades disponibles.
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-3xl border border-brand-100 bg-brand-50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-900/10"
              >
                <div className="h-36 w-full bg-brand-100">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-500">
                      {categoryLabels[product.category] ?? 'Otros'}
                    </p>
                    <h3 className="font-serif text-lg text-brand-900">{product.title}</h3>
                  </div>
                  <div className="flex items-center justify-between text-sm text-brand-600">
                    <span>{product.unit}</span>
                    <span className="text-base font-semibold text-brand-900">${product.price}</span>
                  </div>
                  <QuantityControl
                    quantity={quantityById[product.id] ?? 0}
                    onDecrement={() => onDecrement(product.id)}
                    onIncrement={() => onAdd(product)}
                    label={product.title}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section
      id="nosotros"
      className="relative scroll-mt-24 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(
    to bottom,
    rgba(255,255,255,0.45),
    rgba(255,255,255,0.65)
  ), url(${sobreNosotrosBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-white/10" />

      <div className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-500">Sobre nosotros</p>
            <h2 className="mt-4 font-serif text-3xl text-brand-900">Una granja boutique, un legado familiar.</h2>
            <p className="mt-4 text-brand-700">
              Alma de Granja nace de la pasión por la agricultura consciente. Nuestra producción respeta el ciclo
              natural y prioriza el bienestar animal para ofrecer alimentos honestos.
            </p>
            <p className="mt-4 text-brand-700">
              Trabajamos con procesos artesanales, cuidando cada detalle desde la recolección hasta la entrega para
              mantener la frescura y el sabor original.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {['Crianza consciente', 'Producción lenta', 'Sabores auténticos', 'Entrega cuidada'].map((item) => (
              <div key={item} className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
                <div className="mb-4 h-32 rounded-2xl bg-brand-100" />
                <h3 className="font-serif text-lg text-brand-900">{item}</h3>
                <p className="mt-2 text-sm text-brand-600">
                  Curamos cada etapa para asegurar un producto final premium y responsable.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Products({ products, onAdd, onDecrement, cartItems, selectedCategory, onCategoryChange }) {
  const filters = [
    { label: 'Todos', value: 'todos' },
    { label: 'Quesos', value: 'quesos' },
    { label: 'Frutos secos', value: 'frutos_secos' },
    { label: 'Huevos de campo', value: 'huevos_campo' },
    { label: 'Otros', value: 'otros' }
  ]

  const normalizedProducts = useMemo(
    () =>
      products.map((product) => ({
        ...product,
        normalizedCategory:
          product.category === 'frutos secos'
            ? 'frutos_secos'
            : product.category === 'huevos'
              ? 'huevos_campo'
              : product.category === 'huevos de campo'
                ? 'huevos_campo'
                : product.category === 'frutos_secos'
                  ? 'frutos_secos'
                  : product.category === 'huevos_campo'
                    ? 'huevos_campo'
                    : product.category
      })),
    [products]
  )

  const quantityById = useQuantityById(cartItems)

  const visibleProducts = useMemo(() => {
    if (selectedCategory === 'todos') return normalizedProducts
    if (selectedCategory === 'otros') {
      return normalizedProducts.filter(
        (product) => !['quesos', 'frutos_secos', 'huevos_campo'].includes(product.normalizedCategory)
      )
    }
    return normalizedProducts.filter((product) => product.normalizedCategory === selectedCategory)
  }, [normalizedProducts, selectedCategory])

  return (
    <section
      id="productos"
      className="relative scroll-mt-24 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.90), rgba(255,255,255,0.98)), url(${productsBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-white/40 backdrop-blur-[1px]" />

      <div className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-500">Productos</p>
            <h2 className="mt-3 font-serif text-3xl text-brand-900">Selección fresca y artesanal.</h2>
          </div>
          <p className="max-w-md text-sm text-brand-600">
            Disponibilidad sujeta a temporada. Escríbenos si necesitas una selección personalizada.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => onCategoryChange(filter.value)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${selectedCategory === filter.value
                ? 'bg-brand-800 text-white shadow-lg shadow-brand-900/15'
                : 'border border-brand-200 text-brand-700 hover:bg-brand-50'
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-3xl border border-brand-100 bg-brand-50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10"
            >
              <div className="h-44 w-full bg-brand-100">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="space-y-4 p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-500">
                    {categoryLabels[product.normalizedCategory] ?? 'Otros'}
                  </p>
                  <h3 className="font-serif text-xl text-brand-900">{product.title}</h3>
                </div>
                <div className="flex items-center justify-between text-sm text-brand-600">
                  <span>{product.unit}</span>
                  <span className="text-lg font-semibold text-brand-900">${product.price}</span>
                </div>
                <QuantityControl
                  quantity={quantityById[product.id] ?? 0}
                  onDecrement={() => onDecrement(product.id)}
                  onIncrement={() => onAdd(product)}
                  label={product.title}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contacto" className="scroll-mt-24 mx-auto max-w-6xl px-6 py-20">
      <div
        className="rounded-3xl bg-brand-800 p-10 text-white md:p-14"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(17, 24, 39, 0.78), rgba(17, 24, 39, 0.6)), url(${contactImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-200">Contacto</p>
            <h2 className="mt-3 font-serif text-3xl">Hablemos por WhatsApp.</h2>
            <p className="mt-3 text-sm text-brand-100">
              Nuestro equipo responde en minutos. Comparte tu pedido o solicita asesoría personalizada.
            </p>
            <div className="mt-6 space-y-2 text-sm text-brand-100">
              <p className="font-semibold text-white">+56 9 5808 6762</p>
              <p>Horario de atención: Lun - Sáb, 9:00 a 19:00 hrs.</p>
              <p>Entregas programadas con 24-48h de anticipación.</p>
            </div>
          </div>
          <div className="flex items-center md:justify-end">
            <a
              href="https://wa.me/56958086762?text=Hola%20Alma%20de%20Granja%2C%20quisiera%20hacer%20un%20pedido."
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-800 shadow-lg shadow-brand-900/20 transition hover:-translate-y-0.5"
            >
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-brand-100 bg-white py-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-brand-600">
        <p>© 2024 Alma de Granja. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <a href="#inicio" className="hover:text-brand-900">Inicio</a>
          <a href="#productos" className="hover:text-brand-900">Productos</a>
          <a href="#contacto" className="hover:text-brand-900">Contacto</a>
        </div>
      </div>
    </footer>
  )
}

function CartDrawer({ open, onClose, items, total, onUpdate, onRemove }) {
  const [customerName, setCustomerName] = useState('')
  const [customerCity, setCustomerCity] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [orderComment, setOrderComment] = useState('')

  const isOrderValid =
    customerName.trim().length > 0 &&
    customerCity.trim().length > 0 &&
    deliveryAddress.trim().length > 0
  const shippingLine = total >= 20000 ? 'Despacho: GRATIS (sobre $20.000)' : 'Despacho: por coordinar'

  const message = useMemo(() => {
    const trimmedName = customerName.trim()
    const trimmedCity = customerCity.trim()
    const trimmedAddress = deliveryAddress.trim()
    const trimmedComment = orderComment.trim()
    const lines = items.map((item) => `- ${item.title} x${item.quantity} — $${item.quantity * item.price}`)
    return [
      'Pedido Alma de Granja',
      `Nombre: ${trimmedName}`,
      `Ciudad/Pueblo: ${trimmedCity}`,
      `Dirección: ${trimmedAddress}`,
      trimmedComment ? `Comentario: ${trimmedComment}` : '',
      '',
      lines.join('\n'),
      `Total: $${total}`,
      shippingLine
    ]
      .filter(Boolean)
      .join('\n')
  }, [customerName, customerCity, deliveryAddress, orderComment, items, total, shippingLine])

  const whatsappUrl = `https://wa.me/56958086762?text=${encodeURIComponent(message)}`

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md transform bg-white shadow-2xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'
          }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-brand-100 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-500">Tu carrito</p>
              <h3 className="font-serif text-xl text-brand-900">Resumen de pedido</h3>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-100 text-lg text-brand-500"
              aria-label="Cerrar carrito"
            >
              ×
            </button>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {items.length === 0 ? (
              <p className="text-sm text-brand-600">Tu carrito está vacío.</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-brand-900">{item.title}</p>
                      <p className="text-xs text-brand-500">{item.unit}</p>
                    </div>
                    <button onClick={() => onRemove(item.id)} className="text-xs text-brand-500">Eliminar</button>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdate(item.id, -1)}
                        className="h-8 w-8 rounded-full border border-brand-200"
                      >
                        -
                      </button>
                      <span className="min-w-[24px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdate(item.id, 1)}
                        className="h-8 w-8 rounded-full border border-brand-200"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-semibold text-brand-900">${item.quantity * item.price}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-brand-100 px-6 py-4">
            <div className="flex items-center justify-between text-sm text-brand-600">
              <span>Total</span>
              <span className="text-lg font-semibold text-brand-900">${total}</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-orange-500">
              Despacho GRATIS por compras sobre $20.000
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-brand-500">Nombre</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="mt-2 w-full rounded-full border border-brand-200 px-4 py-2 text-sm text-brand-900"
                  required
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-brand-500">
                  Ciudad / Pueblo
                </label>
                <input
                  type="text"
                  value={customerCity}
                  onChange={(event) => setCustomerCity(event.target.value)}
                  className="mt-2 w-full rounded-full border border-brand-200 px-4 py-2 text-sm text-brand-900"
                  required
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-brand-500">
                  Dirección (calle/pasaje + número)
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  className="mt-2 w-full rounded-full border border-brand-200 px-4 py-2 text-sm text-brand-900"
                  required
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-brand-500">
                  Comentario adicional
                </label>
                <textarea
                  value={orderComment}
                  onChange={(event) => setOrderComment(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-brand-200 px-4 py-2 text-sm text-brand-900"
                  rows={3}
                />
              </div>
            </div>
            {!isOrderValid ? (
              <p className="mt-3 text-xs font-semibold text-orange-500">
                Completa nombre, ciudad/pueblo y dirección para enviar el pedido
              </p>
            ) : null}
            <a
              href={isOrderValid ? whatsappUrl : undefined}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!isOrderValid}
              className={`mt-4 block w-full rounded-full px-4 py-3 text-center text-sm font-semibold text-white ${isOrderValid ? 'bg-brand-800' : 'cursor-not-allowed bg-brand-800/60 opacity-60'
                }`}
            >
              Enviar pedido por WhatsApp
            </a>
            <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
              <p className="font-semibold text-brand-800">
                <span className="text-orange-500">Importante:</span> Solo repartimos en San Francisco de
                Mostazal, Machalí, Rancagua, Graneros.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

const getStoredToken = () => {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('admin_token')
}

const storeToken = (token) => {
  window.localStorage.setItem('admin_token', token)
}

const clearToken = () => {
  window.localStorage.removeItem('admin_token')
}

function AdminPage() {
  const [token, setToken] = useState(() => getStoredToken())

  const handleLogout = () => {
    clearToken()
    setToken(null)
  }

  if (!token) {
    return <AdminLogin onLogin={(newToken) => setToken(newToken)} />
  }

  return <AdminDashboard token={token} onLogout={handleLogout} />
}

function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (res.ok) {
      const data = await res.json()
      storeToken(data.token)
      onLogin(data.token)
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.message || 'Credenciales inválidas')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-6">
      <div className="w-full max-w-md rounded-3xl border border-brand-100 bg-white p-8 shadow-sm">
        <h1 className="font-serif text-2xl text-brand-900">Acceso administrador</h1>
        <p className="mt-2 text-sm text-brand-600">Ingresa tus credenciales para gestionar productos.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-brand-500">Usuario</label>
            <input
              type="text"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              className="mt-2 w-full rounded-full border border-brand-200 px-4 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-brand-500">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="mt-2 w-full rounded-full border border-brand-200 px-4 py-2 text-sm"
              required
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button className="w-full rounded-full bg-brand-800 px-4 py-3 text-sm font-semibold text-white">
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}

function AdminDashboard({ token, onLogout }) {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [imageFile, setImageFile] = useState(null)
  const [uploadState, setUploadState] = useState({ loading: false, error: '' })

  const authHeaders = {
    Authorization: `Bearer ${token}`
  }

  const loadProducts = async () => {
    const res = await fetch('/api/admin/products', { headers: authHeaders })
    if (res.status === 401) {
      onLogout()
      return
    }
    const data = await res.json()
    setProducts(data)
    setLoading(false)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const resetForm = () => {
    setForm(initialForm)
    setImageFile(null)
    setUploadState({ loading: false, error: '' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const trimmedTitle = form.title.trim()
    const trimmedDescription = form.description.trim()
    const trimmedCategory = form.category?.trim()
    const priceValue = Number(form.price)

    if (!trimmedTitle || !trimmedDescription || !trimmedCategory) {
      setError('Completa título, descripción y categoría.')
      return
    }

    if (form.price === '' || !Number.isFinite(priceValue)) {
      setError('Ingresa un precio válido.')
      return
    }

    const payload = {
      ...form,
      title: trimmedTitle,
      name: trimmedTitle,
      description: trimmedDescription,
      category: trimmedCategory,
      price: priceValue,
      isFeatured: Boolean(form.isFeatured)
    }
    let res
    try {
      res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(payload)
      })
    } catch (error) {
      setError('No se pudo crear el producto')
      return
    }

    if (res.status === 401) {
      onLogout()
      return
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.message || 'No se pudo crear el producto')
      await loadProducts()
      return
    }

    await loadProducts()
    resetForm()
  }

  const handleDelete = async (id) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: authHeaders
    })
    if (res.status === 401) {
      onLogout()
      return
    }
    await loadProducts()
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null
    setImageFile(file)
    setUploadState({ loading: false, error: '' })
  }

  const handleUpload = async () => {
    if (!imageFile) {
      setUploadState({ loading: false, error: 'Selecciona una imagen para subir.' })
      return
    }
    setUploadState({ loading: true, error: '' })
    const formData = new FormData()
    formData.append('file', imageFile)
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: authHeaders,
        body: formData
      })
      if (res.status === 401) {
        onLogout()
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setUploadState({ loading: false, error: data.message || 'No se pudo subir la imagen.' })
        return
      }
      const data = await res.json()
      setForm((prev) => ({ ...prev, imageUrl: data.url || '' }))
      setUploadState({ loading: false, error: '' })
    } catch (error) {
      setUploadState({ loading: false, error: 'No se pudo subir la imagen.' })
    }
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-500">Admin</p>
            <h1 className="font-serif text-3xl text-brand-900">Panel de productos</h1>
          </div>
          <button onClick={onLogout} className="rounded-full border border-brand-200 px-4 py-2 text-sm">
            Cerrar sesión
          </button>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl text-brand-900">Nuevo producto</h2>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-brand-500">Título</label>
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  className="mt-2 w-full rounded-full border border-brand-200 px-4 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-brand-500">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  className="mt-2 w-full rounded-3xl border border-brand-200 px-4 py-3 text-sm"
                  rows={3}
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-brand-500">Categoría</label>
                  <select
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    className="mt-2 w-full rounded-full border border-brand-200 px-4 py-2 text-sm"
                  >
                    {categories.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-brand-500">Precio</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                    className="mt-2 w-full rounded-full border border-brand-200 px-4 py-2 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-brand-500">Unidad (opcional)</label>
                  <input
                    value={form.unit}
                    onChange={(event) => setForm({ ...form, unit: event.target.value })}
                    className="mt-2 w-full rounded-full border border-brand-200 px-4 py-2 text-sm"
                    placeholder="250g, docena..."
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-brand-500">Imagen (URL)</label>
                  <input
                    value={form.imageUrl}
                    onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
                    className="mt-2 w-full rounded-full border border-brand-200 px-4 py-2 text-sm"
                    placeholder="https://res.cloudinary.com/..."
                  />
                  <p className="mt-2 text-xs text-brand-500">Pegar URL de Cloudinary.</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-brand-500">Subir imagen</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-2 w-full rounded-full border border-brand-200 bg-white px-4 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={handleUpload}
                    className="rounded-full border border-brand-200 px-4 py-2 text-sm text-brand-700 transition hover:bg-brand-50"
                    disabled={uploadState.loading}
                  >
                    {uploadState.loading ? 'Subiendo...' : 'Subir a Cloudinary'}
                  </button>
                  {uploadState.error ? (
                    <p className="mt-2 text-xs text-red-600">{uploadState.error}</p>
                  ) : (
                    <p className="mt-2 text-xs text-brand-500">Sube una imagen local para generar la URL.</p>
                  )}
                </div>
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })}
                  className="h-4 w-4 rounded border-brand-300 text-brand-700 focus:ring-brand-600"
                />
                Mostrar en Novedades
              </label>
              {form.imageUrl ? (
                <div className="overflow-hidden rounded-2xl border border-brand-100">
                  <img src={form.imageUrl} alt="preview" className="h-40 w-full object-cover" />
                </div>
              ) : null}
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <div className="flex flex-wrap gap-3">
                <button className="rounded-full bg-brand-800 px-6 py-3 text-sm font-semibold text-white">
                  Crear
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-brand-200 px-6 py-3 text-sm"
                >
                  Limpiar
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="rounded-3xl border border-brand-100 bg-white p-6 text-sm text-brand-600 shadow-sm">
                Cargando productos...
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-3xl border border-brand-100 bg-white p-6 text-sm text-brand-600 shadow-sm">
                No hay productos cargados.
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-wrap items-center gap-4 rounded-3xl border border-brand-100 bg-white p-5 shadow-sm"
                >
                  <div className="h-20 w-20 overflow-hidden rounded-2xl bg-brand-100">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-500">
                      {categoryLabels[product.category] ?? product.category}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-lg text-brand-900">{product.title}</h3>
                      {product.isFeatured ? (
                        <span className="rounded-full border border-brand-200 bg-brand-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">
                          Novedad
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-brand-600">
                      ${product.price} · {product.unit || 'Sin unidad'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="rounded-full border border-red-200 px-4 py-2 text-xs text-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const socialLinks = {
  whatsapp: 'https://wa.me/56958086762',
  instagram: 'https://instagram.com/almadegranja',
  facebook: 'https://facebook.com/almadegranja'
}

function FloatingButtons({ drawerOpen }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-40 flex flex-col gap-3 transition-transform ${drawerOpen ? 'md:-translate-x-72' : ''
        }`}
    >
      {[
        { label: 'WhatsApp', href: socialLinks.whatsapp, bg: 'bg-green-500' },
        { label: 'Instagram', href: socialLinks.instagram, bg: 'bg-pink-500' },
        { label: 'Facebook', href: socialLinks.facebook, bg: 'bg-blue-600' }
      ].map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noreferrer"
          className={`group relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg shadow-brand-900/20 transition hover:-translate-y-0.5 ${item.bg}`}
          aria-label={item.label}
        >
          <span className="text-xs font-semibold">{item.label.slice(0, 2)}</span>
          <span className="pointer-events-none absolute right-full mr-3 hidden rounded-full bg-brand-900 px-3 py-1 text-xs text-white shadow-lg group-hover:block">
            {item.label}
          </span>
        </a>
      ))}
    </div>
  )
}

export default App
