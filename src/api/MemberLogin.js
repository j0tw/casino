/* eslint-disable */
const getLoginStatus = () => {
  return new Promise((resolve, reject) => {
    resolve({account: 'test'})
  })
}

export {
  getLoginStatus
}
