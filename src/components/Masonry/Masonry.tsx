import React, { useState, useEffect, useMemo, useRef } from 'react'
import useMeasure from 'react-use-measure'
import shuffle from 'lodash.shuffle'
import data from './data'

interface MasonryItem {
  css: string
  height: number
  x?: number
  y?: number
  width?: number
  column?: number
  row?: number
}

function Masonry() {
  const [ref, { width }] = useMeasure()
  const [items, setItems] = useState<MasonryItem[]>(data)

  const columns = useMemo(() => {
    if (width >= 1500) return 5
    if (width >= 1200) return 4
    if (width >= 900) return 3
    return 2
  }, [width])

  useEffect(() => {
    let intervalId

    const startInterval = () => {
      intervalId = setInterval(() => {
        setItems(prevItems => shuffle([...prevItems]))
      }, 5000)
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(intervalId)
      } else {
        startInterval()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    startInterval()

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  const rotations = useMemo(
    () => items.map(() => Math.random() * 4 - 2),
    [items]
  )

  const [heights, gridItems] = useMemo(() => {
    if (width === 0) return [[], []]

    const fixedWidth = width / columns
    const fixedHeight = 280

    const gridItems: Array<MasonryItem & {
      x: number;
      y: number;
      width: number;
      height: number;
      column: number;
      row: number;
    }> = []

    const columnHeights: number[] = new Array(columns).fill(0)

    items.forEach((item, index) => {
      const column = index % columns

      const offsetPattern = [0, fixedHeight * 0.3, fixedHeight * 0.6, fixedHeight * 0.2, fixedHeight * 0.8]
      const verticalOffset = offsetPattern[column % offsetPattern.length]

      const x = column * fixedWidth
      const y = columnHeights[column] + verticalOffset
      const row = Math.floor(y / fixedHeight)

      columnHeights[column] = Math.max(columnHeights[column], y + fixedHeight)

      gridItems.push({
        ...item,
        x,
        y,
        width: fixedWidth,
        height: fixedHeight,
        column,
        row
      })
    })

    return [columnHeights, gridItems]
  }, [columns, items, width])

  if (width === 0) {
    return (
      <div ref={ref} style={{ width: '100%', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#888', fontSize: '1.1rem' }}>Cargando galería...</div>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        height: Math.max(...heights, 0),
        overflow: 'hidden'
      }}
    >
      {gridItems.map((item, index) => (
        <div
          key={`${item.css}-${index}`}
          style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            width: item.width,
            height: item.height,
            padding: '6px',
            boxSizing: 'border-box',
            transition: 'all 0.3s ease-in-out',
            zIndex: item.row
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${item.css}?auto=compress&dpr=2&w=${Math.round(item.width)}&h=${Math.round(item.height)}&fit=crop)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              borderRadius: '8px',
              boxShadow: '0px 10px 30px -10px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              transform: `rotate(${rotations[index]}deg)`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = `rotate(0deg) scale(1.05)`
              e.currentTarget.style.boxShadow = '0px 20px 40px -15px rgba(0, 0, 0, 0.4)'
              e.currentTarget.style.zIndex = '100'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = `rotate(${rotations[index]}deg) scale(1)`
              e.currentTarget.style.boxShadow = '0px 10px 30px -10px rgba(0, 0, 0, 0.3)'
              e.currentTarget.style.zIndex = item.row.toString()
            }}
            onClick={() => console.log('Clicked:', item.css)}
          />
        </div>
      ))}
    </div>
  )
}

export default Masonry
