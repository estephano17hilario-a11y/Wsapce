'use client'
import dynamic from 'next/dynamic'

const PricingSectionClient = dynamic(() => import('./PricingSection'), { ssr: false })

export default PricingSectionClient