'use client'
import dynamic from 'next/dynamic'

const ProfileCircleClient = dynamic(() => import('./ProfileCircle'), { ssr: false })

export default ProfileCircleClient