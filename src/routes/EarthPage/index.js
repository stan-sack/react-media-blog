import { injectReducer } from '../../store/reducers'
import { fetchAllData } from './modules/earthPage'

export default (store) => ({
  /*  Async getComponent is only invoked when route matches   */
  getComponent (nextState, cb) {
    /*  Webpack - use 'require.ensure' to create a split point
    and embed an async module loader (jsonp) when bundling   */
    require.ensure([], (require) => {
      /*  Webpack - use require callback to define
      dependencies for bundling   */
      const EarthPage = require('./containers/EarthPageContainer').default
      const reducer = require('./modules/earthPage').default

      /*  Add the reducer to the store on key 'counter'  */
      injectReducer(store, { key: 'earthPage', reducer })

      /*  Return getComponent   */
      cb(null, EarthPage)

      /* Webpack named bundle   */
    }, 'earthPage')
  },
  onEnter (nextState, replace, callback) {
    store.dispatch(fetchAllData())
    callback()
  }
})
