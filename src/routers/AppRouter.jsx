import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Home } from '../pages/Home'
import { RetroV } from '../pages/RetroV'
import { Drama } from '../pages/Drama'
import { Entertainment } from '../pages/Entertainment'
import { Currentaffairs } from '../pages/Currentaffairs'
import { Animation } from '../pages/Animation'
import { Global } from '../pages/Global'
import { ProgramDetail } from '../pages/ProgramDetail'
import { Movie } from '../pages/Movie'
import { Live } from '../pages/Live'

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/entertainment' element={<Entertainment />} />
                <Route path='/drama' element={<Drama />} />
                <Route path='/movie' element={<Movie />} />
                <Route path='/currentaffairs' element={<Currentaffairs />} />
                <Route path='/animation' element={<Animation />} />
                <Route path='/global' element={<Global />} />
                <Route path='/live' element={<Live />} />

                <Route path='/retrov' element={<RetroV />} />

                <Route path='/programdetail' element={<ProgramDetail />} />
            </Routes>
        </BrowserRouter>
    )
}