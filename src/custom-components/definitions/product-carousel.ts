import { registerComponent } from '../registry';

function escapePropsForAttribute(props: Record<string, unknown>): string {
  return JSON.stringify(props).replace(/'/g, "\\'");
}

interface ProductItem {
  title?: string;
  price?: string;
  size?: string;
  imageUrl?: string;
  link?: string;
}

function renderProductCarousel(props: Record<string, unknown>): string {
  const {
    title = 'Recently viewed products',
    products = [
      { title: 'Sensitive Skin Balm', price: '$16.50', size: '120g', imageUrl: '', link: '#' },
      { title: 'Cream Conditioner', price: '$14.50', size: '', imageUrl: '', link: '#' },
    ],
    cardBgColor = '#FFFFFF',
    containerBgColor = '#F5F5F5',
    textColor = '#1F2937',
    priceColor = '#1F2937',
    subtextColor = '#6B7280',
    accentColor = '#4285F4',
    buttonText = 'ADD TO CART',
    cardBorderRadius = 12,
    showArrows = true,
    showDots = true,
  } = props as Record<string, string | number | boolean | ProductItem[]>;

  const items = Array.isArray(products) ? products : [];
  const radius = Number(cardBorderRadius) || 12;
  const arrows = showArrows !== false;
  const dots = showDots !== false;

  // Each card is a self-contained product card with data attributes for JS targeting
  const productCards = items
    .slice(0, 10)
    .map(
      (p: ProductItem, i: number) => `
      <div
        id="pcar-card-${i}"
        class="pcar-card"
        data-index="${i}"
        data-product-title="${String(p.title || '')}"
        style="flex:0 0 auto; width:240px; background:${cardBgColor}; border-radius:${radius}px; overflow:hidden; border:1px solid #E8E8E8; scroll-snap-align:start; display:flex; flex-direction:column;"
      >
        <!-- Product image slot -->
        <div
          id="pcar-card-${i}-img"
          class="pcar-card-img"
          data-field="image"
          data-slot="product-image"
          style="width:100%; height:160px; background:#F3F4F6; display:flex; align-items:center; justify-content:center; overflow:hidden;"
        >
          ${
            p.imageUrl
              ? `<img src="${String(p.imageUrl)}" alt="${String(p.title || 'Product')}" style="width:100%; height:100%; object-fit:cover; display:block;" />`
              : `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="opacity:0.3;">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#9CA3AF" stroke-width="1.5"/>
                  <circle cx="8.5" cy="8.5" r="2" stroke="#9CA3AF" stroke-width="1.5"/>
                  <path d="M3 16l5-5 4 4 3-3 6 6" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round"/>
                </svg>`
          }
        </div>

        <!-- Card body — flex column so button always sits at bottom regardless of subtitle -->
        <div
          id="pcar-card-${i}-body"
          class="pcar-card-body"
          data-field="body"
          style="padding:14px 16px; display:flex; flex-direction:column; flex:1;"
        >
          <p
            id="pcar-card-${i}-title"
            class="pcar-card-title"
            data-field="title"
            style="margin:0 0 4px; color:${textColor}; font-size:14px; font-weight:600; line-height:1.3; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
          >${String(p.title || 'Product Name')}</p>

          <!-- Subtitle — always rendered with min-height to keep cards equal -->
          <p
            id="pcar-card-${i}-size"
            class="pcar-card-size"
            data-field="size"
            style="margin:0 0 6px; color:${subtextColor}; font-size:12px; line-height:1.3; min-height:16px;"
          >${p.size ? String(p.size) : ''}</p>

          <p
            id="pcar-card-${i}-price"
            class="pcar-card-price"
            data-field="price"
            style="margin:0; color:${priceColor}; font-size:15px; font-weight:700;"
          >${String(p.price || '')}</p>

          <!-- Spacer pushes button to bottom -->
          <div style="flex:1; min-height:8px;"></div>

          <a
            id="pcar-card-${i}-btn"
            class="pcar-card-btn"
            data-field="cta"
            href="${String(p.link || '#')}"
            style="display:block; background:${accentColor}; color:#fff; padding:10px 16px; border-radius:8px; font-size:12px; font-weight:700; text-align:center; text-decoration:none; letter-spacing:0.03em;"
          >${String(buttonText)}</a>
        </div>
      </div>`
    )
    .join('');

  // Dot indicators — only render when there are more cards than typically visible (>2)
  // With 240px cards + 12px gap in ~480px+ container, ~2 cards are visible at once
  const dotsHtml = dots && items.length > 2
    ? items.slice(0, 10).map((_, i) =>
        `<span
          id="pcar-dot-${i}"
          class="pcar-dot"
          data-dot-index="${i}"
          style="width:8px; height:8px; border-radius:50%; background:${i === 0 ? accentColor : '#D1D5DB'}; transition:background 0.2s; cursor:pointer;"
        ></span>`
      ).join('')
    : '';

  const html = `
    <style>
      .pcar-root { box-sizing: border-box; max-width: 100%; }
      .pcar-root * { box-sizing: border-box; }
      .pcar-track {
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }
      .pcar-track::-webkit-scrollbar { display: none; }
      .pcar-card { scroll-snap-align: start; transition: transform 0.15s ease; }
      .pcar-arrow {
        width: 36px; height: 36px; border-radius: 50%;
        background: #1F2937; color: #fff; border: none;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; flex-shrink: 0; font-size: 18px;
        transition: opacity 0.15s;
      }
      .pcar-arrow:hover { opacity: 0.8; }
      @media (max-width: 480px) {
        .pcar-card { width: 200px !important; }
        .pcar-card-img { height: 120px !important; }
        .pcar-arrow { width: 30px; height: 30px; font-size: 14px; }
      }
    </style>
    <div
      data-component="product-carousel"
      data-props='${escapePropsForAttribute(props as Record<string, unknown>)}'
      data-card-count="${items.length}"
      id="pcar-root"
      class="pcar-root"
      style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:${containerBgColor}; padding:20px; border-radius:16px; max-width:100%;"
    >
      <!-- Section title -->
      <h3
        id="pcar-title"
        data-field="title"
        style="margin:0 0 16px; color:${textColor}; font-size:16px; font-weight:700;"
      >${String(title)}</h3>

      <!-- Carousel navigation row -->
      <div
        id="pcar-nav"
        data-field="nav-row"
        style="display:flex; align-items:center; gap:10px;"
      >
        ${arrows ? `
        <div
          id="pcar-prev"
          class="pcar-arrow"
          data-action="prev"
          role="button"
          aria-label="Previous products"
          tabindex="0"
        >&#8249;</div>` : ''}

        <!-- Scrollable track — this is the slot where JS will inject/manage cards -->
        <div
          id="pcar-track"
          class="pcar-track"
          data-slot="product-cards"
          data-field="track"
          role="list"
          aria-label="Product carousel"
          style="display:flex; overflow-x:auto; gap:12px; padding:4px 2px; flex:1; min-width:0;"
        >
          ${productCards || `
          <div
            id="pcar-empty"
            data-field="empty-state"
            style="color:#9CA3AF; font-size:13px; padding:40px 16px; text-align:center; width:100%;"
          >Products will appear here</div>`}
        </div>

        ${arrows ? `
        <div
          id="pcar-next"
          class="pcar-arrow"
          data-action="next"
          role="button"
          aria-label="Next products"
          tabindex="0"
        >&#8250;</div>` : ''}
      </div>

      <!-- Dot indicators -->
      ${dotsHtml ? `
      <div
        id="pcar-dots"
        data-field="dots"
        data-slot="carousel-dots"
        style="display:flex; justify-content:center; gap:6px; margin-top:14px;"
      >${dotsHtml}</div>` : ''}
    </div>
  `;
  return html.trim();
}

registerComponent({
  id: 'product-carousel',
  name: 'Product Carousel',
  description: 'Horizontal scrollable product cards with navigation',
  category: 'commerce',
  icon: '🛒',
  props: [
    { name: 'title', label: 'Section Title', type: 'text', defaultValue: 'Recently viewed products' },
    { name: 'containerBgColor', label: 'Container Background', type: 'color', defaultValue: '#F5F5F5' },
    { name: 'cardBgColor', label: 'Card Background', type: 'color', defaultValue: '#FFFFFF' },
    { name: 'textColor', label: 'Text Color', type: 'color', defaultValue: '#1F2937' },
    { name: 'priceColor', label: 'Price Color', type: 'color', defaultValue: '#1F2937' },
    { name: 'subtextColor', label: 'Subtext Color', type: 'color', defaultValue: '#6B7280' },
    { name: 'accentColor', label: 'Button Color', type: 'color', defaultValue: '#4285F4' },
    { name: 'buttonText', label: 'Button Text', type: 'text', defaultValue: 'ADD TO CART' },
  ],
  defaultProps: {
    title: 'Recently viewed products',
    products: [
      { title: 'Sensitive Skin Balm', price: '$16.50', size: '120g', imageUrl: '', link: '#' },
      { title: 'Cream Conditioner', price: '$14.50', size: '', imageUrl: '', link: '#' },
    ],
    containerBgColor: '#F5F5F5',
    cardBgColor: '#FFFFFF',
    textColor: '#1F2937',
    priceColor: '#1F2937',
    subtextColor: '#6B7280',
    accentColor: '#4285F4',
    buttonText: 'ADD TO CART',
  },
  render: renderProductCarousel,
});