"use client"

import React from "react"

export default function Footer() {
  return (
    <footer className="site-footer relative w-full px-6 pt-10 md:pt-12 pb-0">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="footer-col lux-card p-6">
            <h3 className="footer-heading shine-text">WSPACE</h3>
            <p className="footer-text">Un imperio forjado en el caos. Construido por Fundadores. Hecho para la guerra.</p>
          </div>
          <div className="footer-col lux-card p-6">
            <h3 className="footer-heading shine-text">CONTACTO</h3>
            <p className="footer-text">Contacto de Guerra (Empresas):</p>
            <a href="mailto:contac.wspace.live@gmail.com" className="footer-link">contac.wspace.live@gmail.com</a>
          </div>
        </div>
        <div className="footer-bottom mt-4 text-center">
          <div className="footer-divider mx-auto mb-3" />
          <p className="footer-copy">© 2025 WSPACE.LIVE - Todos los derechos reservados por el Arquitecto.</p>
        </div>
      </div>
    </footer>
  )
}