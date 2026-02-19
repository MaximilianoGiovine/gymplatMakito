import { Navbar } from '@/components/public/Navbar'
import { Footer } from '@/components/public/Footer'
import { PricingSection } from '@/components/public/PricingSection'

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 pt-20">
                <PricingSection />
            </main>
            <Footer />
        </div>
    )
}
