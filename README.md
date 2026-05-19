#  DubaiSuperCars — Premium Supercar Marketplace

A full-stack supercar marketplace platform inspired by Dubai's luxury automotive scene. Built with **Django** (backend) and **React** (frontend), supporting online purchasing via PayPal, Binance & M-Pesa, plus WhatsApp quote requests for exclusive inventory.

---

##  Project Structure

```
dubaisupercars/
│
├── backend/                          # Django backend
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env                          # Environment variables (never commit)
│   │
│   ├── config/                       # Django project config
│   │   ├── __init__.py
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   └── core/                         # Core Django application
│       ├── __init__.py
│       ├── admin.py
│       ├── apps.py
│       ├── models.py                 # Make, Model, Car, Order, QuoteRequest, etc.
│       ├── serializers.py
│       ├── views.py
│       ├── urls.py
│       ├── permissions.py
│       ├── filters.py
│       ├── payments/
│       │   ├── __init__.py
│       │   ├── paypal.py             # PayPal integration
│       │   ├── binance.py            # Binance Pay integration
│       │   └── mpesa.py              # M-Pesa Daraja API integration
│       ├── migrations/
│       └── tests/
│           ├── test_models.py
│           ├── test_views.py
│           └── test_payments.py
│
├── frontend/                         # React frontend
│   ├── index.html                    # Entry HTML with SEO + Bootstrap Icons
│   ├── package.json
│   ├── vite.config.js
│   ├── .env
│   │
│   └── src/
│       ├── main.jsx                  # React entry point
│       ├── App.jsx                   # Root component + routing
│       │
│       ├── utils/
│       │   └── api.js                # Axios API client + all endpoint helpers
│       │
│       ├── components/
│       │   ├── Navbar.jsx            # Sticky nav with search, cart, WhatsApp CTA
│       │   ├── Footer.jsx            # Links, social, payment badges
│       │   ├── CarCard.jsx           # Reusable car listing card
│       │   └── PaymentModal.jsx      # PayPal / Binance / M-Pesa selector
│       │
│       ├── pages/
│       │   ├── HomePage.jsx          # Hero, featured cars, makes, testimonials
│       │   ├── ProductsPage.jsx      # Filtered car listings (SERP)
│       │   ├── ProductDetailPage.jsx # Car detail, gallery, specs, buy/quote
│       │   ├── CheckoutPage.jsx      # Order summary + payment flow
│       │   ├── OrderSuccessPage.jsx  # Post-purchase confirmation
│       │   ├── LoginPage.jsx         # Optional login (not required to buy)
│       │   ├── AboutPage.jsx
│       │   └── NotFoundPage.jsx
│       │
│       └── styles/
│           └── main.css              # Global styles (~2000 lines)
│
├── media/                            # User-uploaded images (Django MEDIA_ROOT)
├── static/                           # Collected static files
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

##  Backend — Django Models (`core/models.py`)

```python
# Key models overview

class Make(models.Model):
    name          # e.g. Lamborghini, Ferrari
    slug          # SEO slug
    logo          # ImageField
    description
    meta_title
    meta_description
    created_at

class CarModel(models.Model):
    make          # FK → Make
    name          # e.g. Huracán, 488 GTB
    slug
    meta_title
    meta_description

class Car(models.Model):
    # Identity
    make, model, year, slug (unique, SEO-friendly)
    title         # e.g. "2024 Lamborghini Huracán STO"

    # Specs
    price         # Decimal (AED); null = quote only
    mileage, color, fuel_type, transmission, body_type
    engine, horsepower, top_speed_kmh, acceleration_0_100

    # Flags
    is_featured, is_sold, requires_quote_only, is_active

    # SEO
    meta_title, meta_description

    # Media
    thumbnail     # ImageField (primary listing image)
    video_url

    # Timestamps
    created_at, updated_at

class CarImage(models.Model):
    car           # FK → Car
    image         # ImageField
    alt_text
    order

class Order(models.Model):
    car           # FK → Car
    buyer_name, buyer_email, buyer_phone
    payment_method   # paypal | binance | mpesa
    payment_ref      # Transaction ID from gateway
    amount_usd
    status           # pending | paid | cancelled | refunded
    created_at

class QuoteRequest(models.Model):
    car           # FK → Car
    name, email, phone, message
    whatsapp_sent # Boolean
    created_at
```

---

## 🌐 API Endpoints (`core/urls.py`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cars/` | List all active cars (filterable) |
| GET | `/api/cars/:slug/` | Single car detail |
| GET | `/api/makes/` | All makes |
| GET | `/api/makes/:slug/` | Make + its cars |
| POST | `/api/orders/` | Create order (any payment) |
| POST | `/api/orders/paypal/verify/` | Verify PayPal payment |
| POST | `/api/orders/binance/webhook/` | Binance Pay webhook |
| POST | `/api/orders/mpesa/callback/` | M-Pesa Daraja callback |
| POST | `/api/quotes/` | Submit WhatsApp quote request |
| POST | `/api/auth/login/` | JWT login (optional) |
| POST | `/api/auth/register/` | Register (optional) |

---

##  Payment Integrations

### PayPal
- Uses **PayPal REST SDK** / PayPal JS SDK (client-side)
- Server verifies capture before order is marked paid
- Set `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` in `.env`

### Binance Pay
- Merchant API: create order → get `checkoutUrl` → redirect
- Webhook at `/api/orders/binance/webhook/` verifies HMAC signature
- Set `BINANCE_API_KEY` and `BINANCE_SECRET` in `.env`

### M-Pesa (Safaricom Daraja)
- STK Push for mobile payments (Kenya / East Africa)
- Async callback at `/api/orders/mpesa/callback/`
- Set `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY` in `.env`

---

##  WhatsApp Quote Flow

Cars with `requires_quote_only=True` show **"Request Quote via WhatsApp"** instead of a buy button.

Clicking it:
1. POSTs to `/api/quotes/` (saves lead to DB)
2. Opens `https://wa.me/+971XXXXXXXXX?text=I%20am%20interested%20in%20...` with pre-filled message

---

## Environment Variables

**Backend `.env`**
```
SECRET_KEY=
DEBUG=True
DATABASE_URL=postgres://user:pass@localhost:5432/dubaisupercars
ALLOWED_HOSTS=localhost,127.0.0.1

# Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_SECRET=
PAYPAL_MODE=sandbox

# Binance Pay
BINANCE_API_KEY=
BINANCE_SECRET=

# M-Pesa
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=https://yourdomain.com/api/orders/mpesa/callback/

# WhatsApp
WHATSAPP_NUMBER=+971500000000
```

**Frontend `.env`**
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_PAYPAL_CLIENT_ID=
VITE_WHATSAPP_NUMBER=+971500000000
```

---

##  Getting Started

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env       # fill in values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env       # fill in values
npm run dev
```

### Docker (full stack)
```bash
docker-compose up --build
```

---

##  Key Dependencies

### Backend
```
django>=4.2
djangorestframework
djangorestframework-simplejwt
django-cors-headers
django-filter
pillow                  # image processing
python-decouple         # .env management
psycopg2-binary
django-storages[s3]
paypalrestsdk
requests                # for Binance & M-Pesa HTTP calls
gunicorn
```

### Frontend
```
react + react-dom
react-router-dom        # client-side routing
axios                   # HTTP client
@paypal/react-paypal-js # PayPal button component
react-image-gallery     # Car photo gallery
react-helmet-async      # Per-page SEO meta tags
bootstrap-icons         # Icon set (CDN in index.html)
```

---

##  Authentication Notes

- Authentication is **optional** — users can purchase or request a quote without an account
- JWT tokens are used if a user does log in
- Admin panel (`/admin/`) is Django's built-in admin, protected

---

##  Image Handling

- Car images stored via Django `ImageField`, served from S3 (production) or `MEDIA_ROOT` (dev)
- `thumbnail` is the primary card image; additional images via `CarImage` model
- Frontend uses lazy loading and WebP format (via Django `imagekit` optional)

---

##  SEO

- Every `Make`, `Car` has `slug`, `meta_title`, `meta_description`
- Frontend uses `react-helmet-async` to set `<title>` and `<meta>` per page
- `index.html` includes Open Graph and Twitter Card meta tags
- Sitemap can be generated with `django.contrib.sitemaps`

---

##  License

MIT — built for educational and commercial use.