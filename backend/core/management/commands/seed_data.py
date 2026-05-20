"""
management/management/commands/seed_data.py

Usage:
    python manage.py seed_data
    python manage.py seed_data --image-dir "D:/gadaf/Documents/dubai_cars"
    python manage.py seed_data --clear          # wipe existing data first
    python manage.py seed_data --cars 30        # how many Car rows to create
"""

import os
import random
import shutil
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
from django.utils.text import slugify

# ---------------------------------------------------------------------------
# Lazy imports so the command doesn't explode when the app isn't installed
# ---------------------------------------------------------------------------
def _get_models():
    from core.models import CarImage, CarModel, Make, Order, QuoteRequest, Car  # adjust app label
    return Make, CarModel, Car, CarImage, Order, QuoteRequest


# ---------------------------------------------------------------------------
# Static seed data
# ---------------------------------------------------------------------------
MAKES = [
    {"name": "Lamborghini", "description": "Italian exotic supercar manufacturer."},
    {"name": "Ferrari",     "description": "Iconic Italian performance marque."},
    {"name": "Bugatti",     "description": "French hyper-luxury brand."},
    {"name": "McLaren",     "description": "British supercar and Formula 1 constructor."},
    {"name": "Porsche",     "description": "German precision performance brand."},
    {"name": "Bentley",     "description": "British grand-touring excellence."},
    {"name": "Rolls-Royce", "description": "The pinnacle of automotive luxury."},
    {"name": "Aston Martin","description": "British GT and sports car manufacturer."},
]

MODELS_BY_MAKE = {
    "Lamborghini": ["Urus", "Huracán", "Revuelto", "Sián"],
    "Ferrari":     ["SF90 Stradale", "Roma", "Purosangue", "296 GTB"],
    "Bugatti":     ["Chiron", "Veyron", "Divo", "Tourbillon"],
    "McLaren":     ["720S", "Artura", "765LT", "GT"],
    "Porsche":     ["911 Turbo S", "Taycan", "Cayenne Turbo", "Panamera"],
    "Bentley":     ["Continental GT", "Bentayga", "Flying Spur", "Mulliner"],
    "Rolls-Royce": ["Ghost", "Phantom", "Cullinan", "Spectre"],
    "Aston Martin":["DB12", "Vantage", "DBX707", "DBS"],
}

COLORS = [
    "Pearl White", "Matte Black", "Rosso Corsa Red", "Blu Nethuns",
    "Giallo Orion Yellow", "Grigio Titans", "Verde Mantis Green",
    "Arancio Atlas Orange", "Carbon Black",
]

ENGINES = [
    "4.0L Twin-Turbo V8", "5.2L Naturally Aspirated V10",
    "6.5L Naturally Aspirated V12", "3.9L Twin-Turbo V8",
    "8.0L Quad-Turbo W16", "4.0L Biturbo V8 + Electric",
    "3.8L Twin-Turbo V8", "3.0L Twin-Turbo Inline-6",
]

FUEL_TYPES  = ["petrol", "hybrid", "electric"]
BODY_TYPES  = ["coupe", "suv", "convertible", "sedan"]
TRANSMISSIONS = ["automatic", "semi_auto"]

BUYER_NAMES  = ["Ahmed Al Rashid", "Fatima Al Mansoori", "James Okafor",
                "Liu Wei", "Sofia Rossi", "Carlos Mendez", "Aisha Mwangi"]
BUYER_EMAILS = ["buyer1@example.com", "buyer2@example.com",
                "buyer3@example.com", "buyer4@example.com"]


# ---------------------------------------------------------------------------
# Helper: collect image files from a directory
# ---------------------------------------------------------------------------
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

def collect_images(image_dir: str) -> list[Path]:
    p = Path(image_dir)
    if not p.exists():
        return []
    return [f for f in p.rglob("*") if f.suffix.lower() in IMAGE_EXTS]


def copy_image_to_media(src: Path, upload_subdir: str) -> str:
    """
    Copy *src* into MEDIA_ROOT/<upload_subdir>/ and return the relative path
    suitable for ImageField.name.
    """
    dest_dir = Path(settings.MEDIA_ROOT) / upload_subdir
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / src.name
    if not dest.exists():
        shutil.copy2(src, dest)
    return str(Path(upload_subdir) / src.name)


# ---------------------------------------------------------------------------
# Command
# ---------------------------------------------------------------------------
class Command(BaseCommand):
    help = "Seed the database with realistic supercar data and local images."

    def add_arguments(self, parser):
        parser.add_argument(
            "--image-dir",
            default=r"D:\gadaf\Documents\dubai_cars",
            help="Path to folder containing car images (searched recursively).",
        )
        parser.add_argument(
            "--cars",
            type=int,
            default=20,
            help="Number of Car rows to create (default: 20).",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing seed data before inserting.",
        )
        parser.add_argument(
            "--gallery-images",
            type=int,
            default=4,
            help="Max gallery images per car (default: 4).",
        )

    # ------------------------------------------------------------------
    def handle(self, *args, **options):
        Make, CarModel, Car, CarImage, Order, QuoteRequest = _get_models()

        image_dir   = options["image_dir"]
        num_cars    = options["cars"]
        max_gallery = options["gallery_images"]

        # ---- optional wipe -----------------------------------------------
        if options["clear"]:
            self.stdout.write(self.style.WARNING("Clearing existing data …"))
            QuoteRequest.objects.all().delete()
            Order.objects.all().delete()
            CarImage.objects.all().delete()
            Car.objects.all().delete()
            CarModel.objects.all().delete()
            Make.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("  Done.\n"))

        # ---- collect local images ----------------------------------------
        images = collect_images(image_dir)
        if not images:
            self.stdout.write(
                self.style.WARNING(
                    f"No images found in '{image_dir}'. "
                    "Cars will be created without thumbnails/gallery images."
                )
            )
        else:
            self.stdout.write(f"Found {len(images)} image(s) in '{image_dir}'.")

        def pick_image():
            """Return a random Path or None."""
            return random.choice(images) if images else None

        # ---- Makes -------------------------------------------------------
        self.stdout.write("Creating makes …")
        make_objs = {}
        for m in MAKES:
            obj, _ = Make.objects.get_or_create(
                name=m["name"],
                defaults={"description": m["description"]},
            )
            # attach a random logo
            img = pick_image()
            if img and not obj.logo:
                rel = copy_image_to_media(img, "makes/logos")
                obj.logo = rel
                obj.save(update_fields=["logo"])
            make_objs[m["name"]] = obj

        # ---- CarModels ---------------------------------------------------
        self.stdout.write("Creating car models …")
        model_objs: list = []
        for make_name, model_names in MODELS_BY_MAKE.items():
            make = make_objs[make_name]
            for model_name in model_names:
                obj, _ = CarModel.objects.get_or_create(
                    make=make,
                    name=model_name,
                )
                model_objs.append(obj)

        # ---- Cars -------------------------------------------------------
        self.stdout.write(f"Creating {num_cars} cars …")
        car_objs = []
        for i in range(num_cars):
            cm = random.choice(model_objs)
            year = random.randint(2018, 2025)
            hp   = random.randint(450, 1600)
            eng  = random.choice(ENGINES)

            # build a unique slug manually to avoid dupes
            base_slug = slugify(f"{year}-{cm.make.name}-{cm.name}-{i}")

            price = (
                None if random.random() < 0.15
                else Decimal(random.randint(200_000, 3_500_000))
            )
            requires_quote = price is None

            car, created = Car.objects.get_or_create(
                slug=base_slug,
                defaults=dict(
                    make         = cm.make,
                    model        = cm,
                    year         = year,
                    title        = f"{year} {cm.make.name} {cm.name}",
                    price        = price,
                    mileage      = random.randint(0, 80_000),
                    color        = random.choice(COLORS),
                    fuel_type    = random.choice(FUEL_TYPES),
                    transmission = random.choice(TRANSMISSIONS),
                    body_type    = random.choice(BODY_TYPES),
                    engine       = eng,
                    horsepower   = hp,
                    top_speed_kmh= random.randint(250, 490),
                    acceleration_0_100 = Decimal(str(round(random.uniform(2.0, 5.5), 1))),
                    is_featured  = random.random() < 0.2,
                    is_sold      = random.random() < 0.1,
                    requires_quote_only = requires_quote,
                    description  = (
                        f"Experience the {cm.make.name} {cm.name} — {hp}hp of "
                        f"pure performance wrapped in {random.choice(COLORS)}."
                    ),
                ),
            )

            if created:
                # thumbnail
                img = pick_image()
                if img:
                    rel = copy_image_to_media(img, "cars/thumbnails")
                    car.thumbnail = rel
                    car.save(update_fields=["thumbnail"])

                # gallery
                chosen = random.sample(images, min(max_gallery, len(images))) if images else []
                for order, gimg in enumerate(chosen):
                    rel = copy_image_to_media(gimg, "cars/gallery")
                    CarImage.objects.create(
                        car      = car,
                        image    = rel,
                        alt_text = f"{car.title} — view {order + 1}",
                        order    = order,
                    )

            car_objs.append(car)

        # ---- Orders ------------------------------------------------------
        self.stdout.write("Creating sample orders …")
        buyable = [c for c in car_objs if c.price is not None and not c.is_sold]
        for _ in range(min(8, len(buyable))):
            car = random.choice(buyable)
            Order.objects.create(
                car            = car,
                buyer_name     = random.choice(BUYER_NAMES),
                buyer_email    = random.choice(BUYER_EMAILS),
                buyer_phone    = f"+971{random.randint(500000000, 599999999)}",
                payment_method = random.choice(["paypal", "binance", "mpesa"]),
                payment_ref    = f"TXN{random.randint(100000, 999999)}",
                amount_usd     = (car.price / Decimal("3.67")).quantize(Decimal("0.01")),
                status         = random.choice(["pending", "paid", "paid", "cancelled"]),
            )

        # ---- QuoteRequests -----------------------------------------------
        self.stdout.write("Creating sample quote requests …")
        quote_cars = [c for c in car_objs if c.requires_quote_only]
        for _ in range(min(6, len(quote_cars) or len(car_objs))):
            car = random.choice(quote_cars or car_objs)
            QuoteRequest.objects.create(
                car     = car,
                name    = random.choice(BUYER_NAMES),
                email   = random.choice(BUYER_EMAILS),
                phone   = f"+254{random.randint(700000000, 799999999)}",
                message = "Interested in this vehicle. Please send me your best price.",
                whatsapp_sent = random.choice([True, False]),
            )

        # ---- Summary -----------------------------------------------------
        self.stdout.write(self.style.SUCCESS(
            f"\n✅  Seed complete:\n"
            f"   Makes         : {Make.objects.count()}\n"
            f"   CarModels     : {CarModel.objects.count()}\n"
            f"   Cars          : {Car.objects.count()}\n"
            f"   CarImages     : {CarImage.objects.count()}\n"
            f"   Orders        : {Order.objects.count()}\n"
            f"   QuoteRequests : {QuoteRequest.objects.count()}\n"
        ))