import django_filters
from .models import Car


class CarFilter(django_filters.FilterSet):
    make = django_filters.CharFilter(field_name="make__slug", lookup_expr="iexact")
    model = django_filters.CharFilter(field_name="model__slug", lookup_expr="iexact")
    year_min = django_filters.NumberFilter(field_name="year", lookup_expr="gte")
    year_max = django_filters.NumberFilter(field_name="year", lookup_expr="lte")
    price_min = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    price_max = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    fuel_type = django_filters.CharFilter(field_name="fuel_type", lookup_expr="iexact")
    transmission = django_filters.CharFilter(field_name="transmission", lookup_expr="iexact")
    body_type = django_filters.CharFilter(field_name="body_type", lookup_expr="iexact")
    is_featured = django_filters.BooleanFilter(field_name="is_featured")
    is_sold = django_filters.BooleanFilter(field_name="is_sold")
    requires_quote_only = django_filters.BooleanFilter(field_name="requires_quote_only")
    hp_min = django_filters.NumberFilter(field_name="horsepower", lookup_expr="gte")
    hp_max = django_filters.NumberFilter(field_name="horsepower", lookup_expr="lte")

    class Meta:
        model = Car
        fields = [
            "make", "model", "year_min", "year_max",
            "price_min", "price_max", "fuel_type", "transmission",
            "body_type", "is_featured", "is_sold", "requires_quote_only",
            "hp_min", "hp_max",
        ]