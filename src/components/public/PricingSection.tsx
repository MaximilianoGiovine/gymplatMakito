'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const plans = [
    {
        name: 'Plan Inicial',
        price: 'Consultar',
        description: 'Ideal para comenzar tu viaje fitness',
        features: ['Rutinas básicas', 'Acceso a la comunidad', 'Soporte por email'],
        link: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=b6fdac3c80054449be1fd5f99777b544',
        popular: false,
    },
    {
        name: 'Plan Pro',
        price: 'Recomendado',
        description: 'Para quienes buscan resultados serios',
        features: ['Todo lo del plan Inicial', 'Rutinas personalizadas', 'Chat con Makito', 'Seguimiento de progreso'],
        link: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=4c0a70b12ed24a929c8e4ccea5284cd0',
        popular: true,
    },
    {
        name: 'Plan Elite',
        price: 'Premium',
        description: 'Máximo rendimiento y atención',
        features: ['Todo lo del plan Pro', 'Videollamada mensual', 'Análisis de técnica', 'Plan nutricional avanzado'],
        link: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=a96da561fd564fcbbdf891f0bd198ccc',
        popular: false,
    },
    {
        name: 'Plan Vitalicio',
        price: 'Exclusivo',
        description: 'Un solo pago, acceso de por vida',
        features: ['Acceso ilimitado a todo', 'Prioridad en soporte', 'Merchandising exclusivo', 'Todas las futuras actualizaciones'],
        link: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=3f011f4530a94f7da722be281c59db9d',
        popular: false,
    },
]

export function PricingSection() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container px-4 md:px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                        Elige tu plan ideal
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Empieza hoy mismo con la suscripción que mejor se adapte a tus objetivos.
                        Cancela cuando quieras.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-2xl bg-card border ${plan.popular ? 'border-primary ring-2 ring-primary/20 shadow-2xl scale-105 z-10' : 'border-border shadow-sm hover:shadow-md'
                                } p-8 flex flex-col transition-all duration-300`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    Más Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                                <div className="text-2xl font-bold text-foreground">
                                    {plan.price}
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm">
                                        <div className="mt-1 bg-primary/10 p-1 rounded-full">
                                            <Check className="w-3 h-3 text-primary" />
                                        </div>
                                        <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button asChild className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/80 text-foreground'}`} size="lg">
                                <Link href={plan.link} target="_blank" rel="noopener noreferrer">
                                    Suscribirme Ahora
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
