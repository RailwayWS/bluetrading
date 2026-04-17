import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import productsData from '../../data/products.json'
import './products.css'

/* Dynamically import all product images */
const imageModules = import.meta.glob('../../assets/products/*.png', { eager: true })
const images = {}
for (const path in imageModules) {
  const filename = path.split('/').pop()
  images[filename] = imageModules[path].default
}

function Products() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeSubcategory, setActiveSubcategory] = useState('All')

  /* Build unique categories & subcategories */
  const categories = useMemo(() => {
    const cats = {}
    productsData.forEach((p) => {
      if (!cats[p.category]) cats[p.category] = new Set()
      cats[p.category].add(p.subcategory)
    })
    return Object.fromEntries(
      Object.entries(cats).map(([k, v]) => [k, [...v]])
    )
  }, [])

  /* Filter products */
  const filteredProducts = useMemo(() => {
    return productsData.filter((p) => {
      if (activeCategory !== 'All' && p.category !== activeCategory) return false
      if (activeSubcategory !== 'All' && p.subcategory !== activeSubcategory) return false
      return true
    })
  }, [activeCategory, activeSubcategory])

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat)
    setActiveSubcategory('All')
  }

  const formatPrice = (price) => {
    return 'R ' + price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })
  }

  return (
    <section className="products" id="products-section">
      <div className="products__container">
        <div className="products__header">
          <span className="products__label">Our Products</span>
          <h2 className="products__heading">Browse Our Equipment</h2>
          <p className="products__description">
            Explore our range of quality agricultural equipment, irrigation systems, and dam solutions.
          </p>
        </div>

        <div className="products__layout">
          {/* Sidebar */}
          <aside className="products__sidebar">
            <h3 className="products__sidebar-title">Categories</h3>
            <ul className="products__category-list">
              <li>
                <button
                  className={`products__category-btn ${activeCategory === 'All' ? 'products__category-btn--active' : ''}`}
                  onClick={() => handleCategoryClick('All')}
                >
                  All Products
                  <span className="products__count">{productsData.length}</span>
                </button>
              </li>
              {Object.entries(categories).map(([cat, subs]) => (
                <li key={cat}>
                  <button
                    className={`products__category-btn ${activeCategory === cat ? 'products__category-btn--active' : ''}`}
                    onClick={() => handleCategoryClick(cat)}
                  >
                    {cat}
                    <span className="products__count">
                      {productsData.filter((p) => p.category === cat).length}
                    </span>
                  </button>
                  {activeCategory === cat && (
                    <ul className="products__subcategory-list">
                      <li>
                        <button
                          className={`products__subcategory-btn ${activeSubcategory === 'All' ? 'products__subcategory-btn--active' : ''}`}
                          onClick={() => setActiveSubcategory('All')}
                        >
                          All {cat}
                        </button>
                      </li>
                      {subs.map((sub) => (
                        <li key={sub}>
                          <button
                            className={`products__subcategory-btn ${activeSubcategory === sub ? 'products__subcategory-btn--active' : ''}`}
                            onClick={() => setActiveSubcategory(sub)}
                          >
                            {sub}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </aside>

          {/* Product Grid */}
          <div className="products__grid">
            {filteredProducts.map((product) => (
              <div className="product-card" key={product.id}>
                <div className="product-card__image-wrap">
                  <img
                    src={images[product.image]}
                    alt={product.name}
                    className="product-card__image"
                    loading="lazy"
                  />
                </div>
                <div className="product-card__body">
                  <span className="product-card__category">
                    {product.category}, {product.subcategory}
                  </span>
                  <h3 className="product-card__name">{product.name}</h3>
                  <p className="product-card__price">{formatPrice(product.price)}</p>
                  <button
                    className="product-card__btn"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    More Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Products
