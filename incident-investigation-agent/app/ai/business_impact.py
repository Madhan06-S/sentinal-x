from app.schemas.incident import BusinessImpact

SERVICE_BUSINESS_MAP = {
    "payment-service": {
        "function": "Payment Processing & Checkout API",
        "impact_level": "HIGH",
        "description": "Users are unable to complete payment transactions or order checkouts.",
    },
    "user-service": {
        "function": "User Authentication & Profile API",
        "impact_level": "MEDIUM",
        "description": "Users may experience delays logging in or updating profile settings.",
    },
    "inventory-service": {
        "function": "Stock Management & Catalog API",
        "impact_level": "MEDIUM",
        "description": "Product availability stock levels may be out of sync.",
    },
}


def get_business_impact(service: str) -> BusinessImpact:
    mapping = SERVICE_BUSINESS_MAP.get(
        service.lower(),
        {
            "function": f"{service.replace('-', ' ').title()} Core Operations",
            "impact_level": "MEDIUM",
            "description": f"Core operations for {service} are currently impacted.",
        },
    )

    return BusinessImpact(
        affected_service=service,
        business_function=mapping["function"],
        impact_level=mapping["impact_level"],
        description=mapping["description"],
    )
