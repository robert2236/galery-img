/// <reference types="vite/client" />

// Solo estas declaraciones (no duplicadas)
declare module '*.module.css' {
  const classes: { [key: string]: string }
}