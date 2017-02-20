import React from 'react'
import DuckImage from '../assets/Duck.jpg'
import { Link } from 'react-router'
import './HomeView.scss'

export const HomeView = () => (
  <div>
    <h4>Welcome!</h4>
    <img
      alt='This is a duck, because stan!'
      className='duck'
      src={DuckImage} />
    <Link to='/earth-page' activeClassName='route--active'>
      EarthPage
    </Link>
  </div>
)

export default HomeView
