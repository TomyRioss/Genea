"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MessageCircle, Check } from "lucide-react";

const WHATSAPP_NUMBER = "5491134083140";

const plans = [
  {
    name: "Starter",
    priceUSD: 20,
    priceARS: 29000,
    images: 100,
    features: ["100 imágenes", "Soporte por email"],
  },
  {
    name: "Pro",
    priceUSD: 49,
    priceARS: 70000,
    images: 400,
    popular: true,
    features: ["400 imágenes", "Soporte prioritario", "Acceso a nuevas funciones"],
  },
  {
    name: "Business",
    priceUSD: 99,
    priceARS: 140000,
    images: 1500,
    features: ["1,500 imágenes", "Soporte 24/7", "Acceso anticipado", "Generación personalizada"],
  },
];

export default function PlanesPage() {
  const [currency, setCurrency] = useState<"USD" | "ARS">("USD");

  const formatPrice = (plan: typeof plans[0]) => {
    if (currency === "USD") {
      return `$${plan.priceUSD}`;
    }
    return `$${plan.priceARS.toLocaleString("es-AR")}`;
  };

  const handleContact = (planName: string) => {
    const message = encodeURIComponent(`Hola, me interesa el plan ${planName}`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">Planes</h2>
        <p className="text-sm text-gray-500">Elegí el plan que mejor se adapte a tus necesidades</p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm ${currency === "USD" ? "font-medium text-gray-900" : "text-gray-500"}`}>USD</span>
        <Switch
          checked={currency === "ARS"}
          onCheckedChange={(checked) => setCurrency(checked ? "ARS" : "USD")}
        />
        <span className={`text-sm ${currency === "ARS" ? "font-medium text-gray-900" : "text-gray-500"}`}>ARS</span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-xl border p-6 ${
              plan.popular
                ? "border-gray-900 ring-1 ring-gray-900"
                : "border-gray-200"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">
                  Popular
                </span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(plan)}</span>
                  <span className="text-sm text-gray-500">{currency}</span>
                </div>
                <p className="text-sm text-gray-600">{plan.images.toLocaleString()} imágenes</p>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-gray-900" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleContact(plan.name)}
                className={`w-full gap-2 ${
                  plan.popular ? "" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
                variant={plan.popular ? "default" : "secondary"}
              >
                <MessageCircle className="h-4 w-4" />
                Contáctanos
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
