/* eslint-disable */
/**
 *
 * 取得該買家彩票總額 (可使用)
 * @function getUserCoinTotal
 * @param  {String} User 使用者帳號
 * @return {Promise}
 * @memberOf external: Store
 *
 * @example
 * // 回傳格式:
 * {
 *    status: 'success',
 *    data: {
 *      total: 100
 *    }
 * }
 *
 * reject status
 * InternalError
 */
const getUserCoinTotal = account => {
  return new Promise((resolve, reject) => {
    resolve({
      total: 100
    })
  })
}

/**
 *
 * 取得以小博大結果
 * @function getCasinoResult
 * @param  {String} User 使用者帳號
 * @return {Promise}
 * @memberOf external: Store
 *
 * @example
 * // response:
 * {
 *   "status": "success",
 *   "data": {
 *     "message": "以小搏大成功",
 *     "amount": 10,
 *     "isWon": true
 *   }
 * }
 *  reject status
 * EventEnd
 * CoinNotEnough
 * InternalError
 */
const getCasinoResult = (account, amount)=> {
  return Promise.resolve({
    message: 'success',
    amount: amount * 2,
    isWon: true
  })
}
export {
  getUserCoinTotal,
  getCasinoResult
}