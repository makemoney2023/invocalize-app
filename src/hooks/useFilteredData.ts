'use client'

import { useState, useMemo } from 'react'
import { z } from 'zod'

interface UseFilteredDataProps<T> {
  data: T[]
  searchFields: (keyof T)[]
  sortFields: (keyof T)[]
  initialSort?: {
    field: keyof T
    direction: 'asc' | 'desc'
  }
}

export function useFilteredData<T>({
  data,
  searchFields,
  sortFields,
  initialSort
}: UseFilteredDataProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState(initialSort)

  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data]

    // Search
    if (searchTerm) {
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field]
          return value && String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    // Sort
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.field]
        const bVal = b[sortConfig.field]
        
        if (aVal === bVal) return 0
        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1
        
        const comparison = aVal < bVal ? -1 : 1
        return sortConfig.direction === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }, [data, searchTerm, sortConfig, searchFields])

  return {
    filteredData: filteredAndSortedData,
    searchTerm,
    setSearchTerm,
    sortConfig,
    setSortConfig
  }
}

