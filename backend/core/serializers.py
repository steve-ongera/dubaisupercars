from rest_framework import serializers
from .models import Make, CarModel, Car, CarImage, Order, QuoteRequest


class CarImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = CarImage
        fields = ["id", "image", "alt_text", "order"]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class MakeSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    car_count = serializers.SerializerMethodField()

    class Meta:
        model = Make
        fields = [
            "id", "name", "slug", "logo", "description",
            "meta_title", "meta_description", "car_count",
        ]

    def get_logo(self, obj):
        request = self.context.get("request")
        if obj.logo and request:
            return request.build_absolute_uri(obj.logo.url)
        return None

    def get_car_count(self, obj):
        return obj.cars.filter(is_active=True, is_sold=False).count()


class CarModelSerializer(serializers.ModelSerializer):
    make_name = serializers.CharField(source="make.name", read_only=True)

    class Meta:
        model = CarModel
        fields = ["id", "make", "make_name", "name", "slug"]


class CarListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listings / cards."""
    make_name = serializers.CharField(source="make.name", read_only=True)
    model_name = serializers.CharField(source="model.name", read_only=True)
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Car
        fields = [
            "id", "title", "slug", "year",
            "make_name", "model_name",
            "price", "mileage", "color",
            "fuel_type", "transmission", "body_type",
            "horsepower", "thumbnail",
            "is_featured", "is_sold", "requires_quote_only",
        ]

    def get_thumbnail(self, obj):
        request = self.context.get("request")
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None


class CarDetailSerializer(serializers.ModelSerializer):
    """Full serializer for the detail page."""
    make = MakeSerializer(read_only=True)
    model = CarModelSerializer(read_only=True)
    images = CarImageSerializer(many=True, read_only=True)
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Car
        fields = [
            "id", "title", "slug", "year",
            "make", "model",
            "price", "mileage", "color",
            "fuel_type", "transmission", "body_type",
            "engine", "horsepower", "top_speed_kmh", "acceleration_0_100",
            "description",
            "is_featured", "is_sold", "requires_quote_only", "is_active",
            "meta_title", "meta_description",
            "thumbnail", "video_url", "images",
            "created_at", "updated_at",
        ]

    def get_thumbnail(self, obj):
        request = self.context.get("request")
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None


# ── Orders ────────────────────────────────────────────────────────────────────

class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            "car", "buyer_name", "buyer_email", "buyer_phone",
            "payment_method", "amount_usd",
        ]

    def validate_car(self, car):
        if car.is_sold:
            raise serializers.ValidationError("This car has already been sold.")
        if car.requires_quote_only:
            raise serializers.ValidationError(
                "This car is available by quote only — please use WhatsApp."
            )
        if not car.is_active:
            raise serializers.ValidationError("This car is not available.")
        return car


class OrderSerializer(serializers.ModelSerializer):
    car_title = serializers.CharField(source="car.title", read_only=True)
    car_slug = serializers.CharField(source="car.slug", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "car", "car_title", "car_slug",
            "buyer_name", "buyer_email", "buyer_phone",
            "payment_method", "payment_ref", "amount_usd",
            "status", "created_at",
        ]


# ── Quote Requests ─────────────────────────────────────────────────────────────

class QuoteRequestSerializer(serializers.ModelSerializer):
    car_title = serializers.CharField(source="car.title", read_only=True)
    car_slug = serializers.CharField(source="car.slug", read_only=True)

    class Meta:
        model = QuoteRequest
        fields = [
            "id", "car", "car_title", "car_slug",
            "name", "email", "phone", "message",
            "created_at",
        ]

    def validate_car(self, car):
        if not car.is_active:
            raise serializers.ValidationError("Car is not available.")
        return car