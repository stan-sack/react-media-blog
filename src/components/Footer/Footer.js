import React from 'react'
import { IndexLink, Link } from 'react-router'
import './Footer.scss'

export const Footer = () => (
  <div className='footer'>
    This is the footer
  </div>
)

// <IndexLink to='/' activeClassName='route--active'>
//   Home
// </IndexLink>
// {' · '}
// <Link to='/counter' activeClassName='route--active'>
//   Counter
// </Link>
// {' · '}
// <Link to='/earth-page' activeClassName='route--active'>
//   EarthPage
// </Link>

export default Footer
