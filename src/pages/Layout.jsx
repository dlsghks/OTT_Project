import React from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { Outlet } from 'react-router-dom'

import '../styles/layout/PageInner.scss';


export const Layout = () => {
  return (
    <>
      <Header />
      <main className='site-inner'>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}