from django.db import models
from django.utils.text import slugify


class Make(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    logo = models.ImageField(upload_to="makes/logos/", blank=True, null=True)
    description = models.TextField(blank=True)
    meta_title = models.CharField(max_length=160, blank=True)
    meta_description = models.CharField(max_length=320, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class CarModel(models.Model):
    make = models.ForeignKey(Make, on_delete=models.CASCADE, related_name="car_models")
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, blank=True)
    meta_title = models.CharField(max_length=160, blank=True)
    meta_description = models.CharField(max_length=320, blank=True)

    class Meta:
        unique_together = ("make", "name")
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.make.name} {self.name}"


class Car(models.Model):
    FUEL_CHOICES = [
        ("petrol", "Petrol"),
        ("diesel", "Diesel"),
        ("hybrid", "Hybrid"),
        ("electric", "Electric"),
    ]
    TRANSMISSION_CHOICES = [
        ("automatic", "Automatic"),
        ("manual", "Manual"),
        ("semi_auto", "Semi-Automatic"),
    ]
    BODY_CHOICES = [
        ("coupe", "Coupe"),
        ("convertible", "Convertible"),
        ("suv", "SUV"),
        ("sedan", "Sedan"),
        ("hatchback", "Hatchback"),
        ("wagon", "Wagon"),
        ("pickup", "Pickup"),
    ]

    # Identity
    make = models.ForeignKey(Make, on_delete=models.CASCADE, related_name="cars")
    model = models.ForeignKey(CarModel, on_delete=models.CASCADE, related_name="cars")
    year = models.PositiveSmallIntegerField()
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)

    # Pricing
    price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Price in AED. Leave blank if quote-only.",
    )

    # Specs
    mileage = models.PositiveIntegerField(default=0, help_text="Mileage in km")
    color = models.CharField(max_length=80, blank=True)
    fuel_type = models.CharField(max_length=20, choices=FUEL_CHOICES, default="petrol")
    transmission = models.CharField(
        max_length=20, choices=TRANSMISSION_CHOICES, default="automatic"
    )
    body_type = models.CharField(
        max_length=20, choices=BODY_CHOICES, default="coupe"
    )
    engine = models.CharField(max_length=100, blank=True, help_text="e.g. 5.2L V10")
    horsepower = models.PositiveIntegerField(null=True, blank=True)
    top_speed_kmh = models.PositiveIntegerField(null=True, blank=True)
    acceleration_0_100 = models.DecimalField(
        max_digits=4, decimal_places=1, null=True, blank=True,
        help_text="0–100 km/h in seconds"
    )
    description = models.TextField(blank=True)

    # Flags
    is_featured = models.BooleanField(default=False)
    is_sold = models.BooleanField(default=False)
    requires_quote_only = models.BooleanField(
        default=False,
        help_text="If True, no online purchase — only WhatsApp quote.",
    )
    is_active = models.BooleanField(default=True)

    # SEO
    meta_title = models.CharField(max_length=160, blank=True)
    meta_description = models.CharField(max_length=320, blank=True)

    # Media
    thumbnail = models.ImageField(
        upload_to="cars/thumbnails/", blank=True, null=True
    )
    video_url = models.URLField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = f"{self.year}-{self.make.name}-{self.model.name}"
            self.slug = slugify(base)
        if not self.title:
            self.title = f"{self.year} {self.make.name} {self.model.name}"
        if not self.meta_title:
            self.meta_title = f"Buy {self.title} | DubaiSuperCars"
        if not self.meta_description:
            self.meta_description = (
                f"Purchase the {self.title}. "
                f"{self.horsepower}hp, {self.engine}. Available at DubaiSuperCars."
            )
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class CarImage(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="cars/gallery/")
    alt_text = models.CharField(max_length=200, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"Image {self.order} — {self.car.title}"


class Order(models.Model):
    PAYMENT_CHOICES = [
        ("paypal", "PayPal"),
        ("binance", "Binance Pay"),
        ("mpesa", "M-Pesa"),
    ]
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("cancelled", "Cancelled"),
        ("refunded", "Refunded"),
    ]

    car = models.ForeignKey(Car, on_delete=models.PROTECT, related_name="orders")
    buyer_name = models.CharField(max_length=200)
    buyer_email = models.EmailField()
    buyer_phone = models.CharField(max_length=30, blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    payment_ref = models.CharField(
        max_length=300, blank=True, help_text="Transaction ID from payment gateway"
    )
    amount_usd = models.DecimalField(max_digits=14, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.pk} — {self.car.title} ({self.status})"


class QuoteRequest(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name="quotes")
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    message = models.TextField(blank=True)
    whatsapp_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Quote — {self.car.title} by {self.name}"