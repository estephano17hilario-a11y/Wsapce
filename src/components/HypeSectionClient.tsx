'use client'
import dynamic from 'next/dynamic'

const HypeSectionClient = dynamic(() => import('./HypeSection'), { ssr: false })

export default HypeSectionClient