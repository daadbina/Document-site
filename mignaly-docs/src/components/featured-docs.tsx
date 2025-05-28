"use client"

import Link from 'next/link'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

// This would normally be fetched from the database
const featuredDocs = [
  {
    id: 1,
    title: 'Getting Started',
    description: 'Learn how to get started with our platform',
    href: '/docs/getting-started',
    icon: DocumentTextIcon,
  },
  {
    id: 2,
    title: 'API Reference',
    description: 'Explore our API documentation',
    href: '/docs/api',
    icon: DocumentTextIcon,
  },
  {
    id: 3,
    title: 'User Guide',
    description: 'Learn how to use our platform effectively',
    href: '/docs/user-guide',
    icon: DocumentTextIcon,
  },
  {
    id: 4,
    title: 'Advanced Topics',
    description: 'Dive deeper into advanced features',
    href: '/docs/advanced',
    icon: DocumentTextIcon,
  },
]

export default function FeaturedDocs() {
  return (
    <div className="mt-16 sm:mt-20 lg:mt-24">
      <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
        {featuredDocs.map((doc) => (
          <Link key={doc.id} href={doc.href} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                  <doc.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                {doc.title}
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">{doc.description}</dd>
            </div>
          </Link>
        ))}
      </dl>
    </div>
  )
}