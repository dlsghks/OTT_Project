import React from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { TopButton } from '../components/TopButton'
import { Outlet } from 'react-router-dom'

import '../styles/layout/PageInner.scss';
import { ScrollToTop } from '../components/ScrollToTop'


export const Layout = () => {
  return (
    <>
      <ScrollToTop />

      <Header />
      <main className='site-inner'>
        <Outlet />
      </main>
      <Footer />
      <TopButton />
    </>
  )
}