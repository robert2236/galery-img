import React, { useState, useEffect, useMemo } from 'react'
import useMeasure from 'react-use-measure'
import shuffle from 'lodash.shuffle'
import data from './data'

// Interfaz para los items
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
  // Hook1: Medir el ancho del contenedor
  const [ref, { width }] = useMeasure()
  
  // Hook2: Mantener items
  const [items, setItems] = useState<MasonryItem[]>(data)
  
  // Hook3: Calcular columnas basadas en el ancho
  const columns = useMemo(() => {
    if (width >= 1500) return 5
    if (width >= 1200) return 4
    if (width >= 900) return 3
    return 2
  }, [width])
  
  // Hook4: Mezclar items cada 2 segundos
  useEffect(() => {
    const intervalId = setInterval(() => {
      setItems(prevItems => shuffle([...prevItems]))
    }, 2000)
    
    return () => clearInterval(intervalId)
  }, [])
  
  // Hook5: Calcular posiciones ESCALONADAS (staggered)
  const [heights, gridItems] = useMemo(() => {
    if (width === 0) return [[], []]
    
    // TAMAÑO FIJO PARA TODAS LAS IMÁGENES
    const fixedWidth = width / columns
    const fixedHeight = 280 // Más alto que antes
    
    // Calcular cuántas filas necesitamos aproximadamente
    const itemsPerColumn = Math.ceil(items.length / columns)
    const estimatedHeight = itemsPerColumn * fixedHeight
    
    const gridItems: Array<MasonryItem & { 
      x: number; 
      y: number; 
      width: number; 
      height: number; 
      column: number;
      row: number;
    }> = []
    
    // Array para trackear alturas por columna
    const columnHeights: number[] = new Array(columns).fill(0)
    
    // Crear patrón escalonado
    items.forEach((item, index) => {
      // Alternar entre columnas de manera cíclica
      const column = index % columns
      
      // Calcular desplazamiento vertical aleatorio/alternado
      let verticalOffset = 0
      
      // Opción 1: Desplazamiento fijo por columna (patrón escalonado)
      if (column === 1 || column === 3) {
        verticalOffset = fixedHeight * 0.5 // Columna 1 y 3 desplazadas hacia abajo
      }
      
      // Opción 2: Desplazamiento más variado (mejor visualmente)
      const offsetPattern = [0, fixedHeight * 0.3, fixedHeight * 0.6, fixedHeight * 0.2, fixedHeight * 0.8]
      verticalOffset = offsetPattern[column % offsetPattern.length]
      
      // Opción 3: Desplazamiento aleatorio (más orgánico)
      // verticalOffset = Math.random() * fixedHeight * 0.7
      
      // Calcular posición
      const x = column * fixedWidth
      const y = columnHeights[column] + verticalOffset
      const row = Math.floor(y / fixedHeight)
      
      // Actualizar altura de la columna
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
  
  // Si no hay ancho, mostrar mensaje de carga
  if (width === 0) {
    return (
      <div ref={ref} style={{ width: '100%', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Cargando masonry...</div>
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
            transition: 'all 0.5s ease-in-out',
            zIndex: item.row // Para orden de superposición
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
              transform: `rotate(${Math.random() * 4 - 2}deg)` // Rotación sutil aleatoria
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = `rotate(0deg) scale(1.05)`
              e.currentTarget.style.boxShadow = '0px 20px 40px -15px rgba(0, 0, 0, 0.4)'
              e.currentTarget.style.zIndex = '100'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = `rotate(${Math.random() * 4 - 2}deg) scale(1)`
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