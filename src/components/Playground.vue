<template>
  <div class="playground-wrap">
    <transition name="zoomout">
      <div class="loading-block" v-show="loadingStatus < 100">
        <span class="loading-text">{{loadingStatus}}%</span>
      </div>
    </transition>
    <div v-show="loadingStatus === 100" class="square" ref="square" :style="{'width': `${pixiWidth}px`}">
      <div class="playground-content" v-if="isStep1">
        <section class="playground-content-step" :style="{'top': contentTop}">
          <div class="playground-content-descrpition">
            <p class="title">想用幾張彩票跟我賭呢？</p>
            <div :class="['playground-content-input-block', {'vibrate': showInputVibrate}]">
              <span class="playground-content-input-action" @click="inputCoin--">-</span>
              <input class="playground-content-input" type="number" pattern="\d*" :placeholder="`最多${maxCoin}張`" :max="maxCoin" :min="maxCoin >= 1 ? 1 : 0" v-model.number="inputCoin">
              <span class="playground-content-input-action" @click="inputCoin++">+</span>
            </div>
            <span class="max">(最多可用{{ maxCoin }}張)</span>
          </div>
          <div class="playground-content-button-block">
            <span class="playground-content-button" @click.prevent="tryItNow">試試手氣</span>
          </div>
        </section>
      </div>
    </div>
    <div class="landscape-alert" style="display: none" v-if="isMobile">
      <p>請將您的裝置轉至直立式（portrait）</p>
    </div>
  </div>
</template>

<script>
/* eslint-disable new-cap */
import { getLoginStatus } from '../api/MemberLogin'
import { getUserCoinTotal, getCasinoResult } from '../api/Coin'
import Dice1 from '../assets/d1.png'
import Dice2 from '../assets/d2.png'
import Dice3 from '../assets/d3.png'
import Dice4 from '../assets/d4.png'
import Dice5 from '../assets/d5.png'
import Dice6 from '../assets/d6.png'
import Banner from '../assets/bn.png'
import Eagle from '../assets/eg.png'
import CoinA from '../assets/coin1.png'
import CoinB from '../assets/coin2.png'
import WinAgain from '../assets/win-again.png'
import LoseAgain from '../assets/lose-again.png'
import BackgroundPC from '../assets/pcbg.png'
import BackgroundMobile from '../assets/mbg.png'
import * as PIXI from 'pixi.js'
import { TweenMax, Elastic, Circ, Back, Power0, Power2 } from 'gsap/all'
import Shake from 'shake.js'

const LOGIN_REF = `https://member.ruten.com.tw/user/login.htm?refer=${window.location.href}`
export default {
  name: 'Playground',
  props: ['isMobile', 'isIeBrowser'],
  data () {
    return {
      account: null,
      loadingStatus: 0,
      loader: null,
      vibrateTicker: null,
      pixiApp: null,
      diceContainer: null,
      pixiWidth: 0,
      pixiHeight: 0,
      bannerScalePercent: 0,
      maxCoin: 0,
      useCoin: '',
      winner: 'Banker', // Player Banker
      gameStep: 1,
      shakeListener: null,
      hasDeviceOrientation: false,
      hasChanceRollDice: false,
      isEventEnd: false,
      showInputVibrate: false
    }
  },
  created () {
    this.$_loadPIXI()
    this.$_initDeviceOrientation()
  },
  methods: {
    $_loadPlayerData () {
      getLoginStatus()
        .then(({ account }) => {
          this.loadingStatus = 95
          this.account = account

          getUserCoinTotal(this.account)
            .then(({ total }) => {
              this.loadingStatus = 100
              this.maxCoin = total
            })
            .catch(() => {
              alert('系統忙碌中，請重新整理後在試！')
            })
        })
        .catch(error => {
          this.loadingStatus = 100
          window.setTimeout(() => {
            if (error === 'NoLogin') {
              alert('請先登入會員，才可以參加活動唷!')
              setTimeout(() => { window.location.href = LOGIN_REF }, 5)
            } else {
              alert('系統忙碌中，請重新整理後在試！')
            }
          }, 200)
        })
    },
    $_initDeviceOrientation () {
      this.hasDeviceOrientation = this.isMobile && Boolean(window.DeviceOrientationEvent)
      if (this.hasDeviceOrientation) {
        window.addEventListener('devicemotion', event => { event.preventDefault() })
        this.shakeListener = new Shake({
          threshold: 15,
          timeout: 500
        })
        this.shakeListener.start()
        window.addEventListener('shake', () => { this.rollDiceAction() }, false)
      }
    },
    $_loadPIXI () {
      // Loding Image
      PIXI.utils.skipHello()
      this.loader = new PIXI.Loader()
      this.loader.add('Background', this.isMobile ? BackgroundMobile : BackgroundPC)
        .add('Dice1', Dice1)
        .add('Dice2', Dice2)
        .add('Dice3', Dice3)
        .add('Dice4', Dice4)
        .add('Dice5', Dice5)
        .add('Dice6', Dice6)
        .add('Banner', Banner)
        .add('Eagle', Eagle)
        .add('CoinA', CoinA)
        .add('CoinB', CoinB)
        .add('WinAgain', WinAgain)
        .add('LoseAgain', LoseAgain)

      this.loader.onProgress.add(loader => {
        this.loadingStatus = Math.floor(loader.progress * 0.90)
      })

      this.loader.load(() => {
        this.$_loadPlayerData()
        this.$_loadPIXIApp()
      })
    },
    $_loadPIXIApp () {
      this.pixiHeight = Math.min((this.isMobile ? document.getElementById('app').scrollHeight : (document.getElementById('app').scrollHeight - 60)), window.screen.availHeight, window.innerHeight)
      this.pixiWidth = Math.min(document.getElementById('app').scrollWidth, window.screen.availWidth, Math.floor(this.pixiHeight / 0.5625))

      if (this.isIeBrowser) {
        this.pixiApp = new PIXI.Application({
          width: this.pixiWidth,
          height: this.pixiHeight,
          antialias: true,
          forceCanvas: true
        })
      } else {
        this.pixiApp = new PIXI.Application({
          width: this.pixiWidth,
          height: this.pixiHeight,
          antialias: true
        })
      }
      console.log(this.pixiHeight, this.pixiWidth)
      if (this.isMobile) {
        this.pixiApp.renderer.view.style.position = 'absolute'
        this.pixiApp.renderer.view.style.display = 'block'
      }
      this.$refs.square.appendChild(this.pixiApp.view)
      this.pixiApp.stage = new PIXI.Container()

      this.vibrateTicker = new PIXI.Ticker()
      this.$_setBackground()
      this.$_setBanner()
      this.$_setEagle()
      this.$_setCoin()
      this.$_setPlayerDice()
      this.$_setBankerDice()
      this.$_setRollDiceText()
    },
    $_setBackground () {
      const background = new PIXI.Sprite.from(this.loader.resources.Background.texture)
      background.width = this.pixiWidth
      background.height = this.pixiHeight
      this.pixiApp.stage.addChildAt(background, 0)
    },
    $_setBanner () {
      this.bannerScalePercent = this.isMobile ? 0.5 : 0.65
      const banner = new PIXI.Sprite.from(this.loader.resources.Banner.texture)

      if (Math.floor(456 * this.bannerScalePercent) > Math.floor(this.pixiHeight * 0.35) && this.isMobile) {
        this.bannerScalePercent = (this.pixiHeight * 0.35) / 456
      }

      banner.scale.set(this.bannerScalePercent, this.bannerScalePercent)
      banner.position.set(Math.floor((this.pixiWidth - this.bannerScalePercent * 612) / 2), -10)
      TweenMax.to(banner, 10, {
        repeat: 2,
        ease: Elastic.easeOut.config(2.5, 0.1),
        y: -5
      })
      this.pixiApp.stage.addChildAt(banner, 1)
    },
    $_setEagle () {
      const scalePercent = this.isMobile ? 0.35 : 0.6
      const eagle = new PIXI.Sprite.from(this.loader.resources.Eagle.texture)

      eagle.scale.set(scalePercent, scalePercent)
      eagle.position.x = this.isMobile ? -100 : this.pixiWidth
      eagle.position.y = this.pixiHeight - 462 * scalePercent
      TweenMax.to(eagle, 1.5, {
        x: this.isMobile ? 5 : (this.pixiWidth - (scalePercent * 520) - 100),
        ease: Circ.easeIn
      })

      this.pixiApp.stage.addChildAt(eagle, 2)
    },
    $_setCoin () {
      const coinContainer = new PIXI.Container()
      const scalePercent = this.isMobile ? 0.35 : 0.7
      const coinB = new PIXI.Sprite(this.loader.resources.CoinB.texture)
      coinB.scale.set(scalePercent, scalePercent)
      if (this.isMobile) {
        coinB.position.set(this.pixiWidth - 412 * scalePercent - 70, this.pixiHeight - 412 * scalePercent)
      } else {
        const coinA = new PIXI.Sprite(this.loader.resources.CoinA.texture)
        coinA.scale.set(scalePercent, scalePercent)
        coinA.position.set(70, -40)
        coinB.position.set(this.pixiWidth - 412 * scalePercent - 70, -25)

        TweenMax.to(coinB, 4, {
          repeat: -1,
          yoyo: true,
          ease: Back.easeOut.config(2),
          y: 0
        })

        TweenMax.to(coinA, 5, {
          repeat: -1,
          yoyo: true,
          ease: Back.easeOut.config(1.5),
          y: 0
        })

        coinContainer.addChild(coinA)
      }
      coinContainer.addChild(coinB)
      this.pixiApp.stage.addChildAt(coinContainer, 3)
    },
    $_setPlayerDice () {
      const scalePercent = 0.3
      const diceContainer = new PIXI.Container()
      const rand = Math.floor(Math.random() * 6)
      const diceArray = ['Dice1', 'Dice2', 'Dice3', 'Dice4', 'Dice5', 'Dice6']
      const diceSprite = new PIXI.Sprite.from(this.loader.resources[diceArray[rand]].texture)

      if (this.isMobile) {
        diceContainer.position.set(this.pixiWidth * 0.6, this.pixiHeight * 0.5)
        diceSprite.anchor.set(0.55)
      } else {
        diceContainer.position.set(this.pixiWidth * 0.33 + 412 * scalePercent * 0.25, this.pixiHeight * 0.6)
        diceSprite.anchor.set(0.7)
      }

      diceSprite.scale.set(scalePercent, scalePercent)

      diceContainer.visible = false
      diceContainer.addChildAt(diceSprite, 0)
      this.pixiApp.stage.addChildAt(diceContainer, 4)
    },
    $_setBankerDice () {
      const scalePercent = 0.3
      const diceContainer = new PIXI.Container()
      const rand = Math.floor(Math.random() * 6)
      const diceArray = ['Dice1', 'Dice2', 'Dice3', 'Dice4', 'Dice5', 'Dice6']
      const diceSprite = new PIXI.Sprite.from(this.loader.resources[diceArray[rand]].texture)

      if (this.isMobile) {
        diceContainer.position.set(this.pixiWidth * 0.6, this.pixiHeight * 0.7)
        diceSprite.anchor.set(0.55)
      } else {
        diceContainer.position.set(this.pixiWidth * 0.65 + 412 * scalePercent * 0.25, this.pixiHeight * 0.6)
        diceSprite.anchor.set(0.7)
      }

      diceSprite.scale.set(scalePercent, scalePercent)

      diceContainer.visible = false
      diceContainer.addChildAt(diceSprite, 0)
      this.pixiApp.stage.addChildAt(diceContainer, 5)
    },
    $_setRollDiceText () {
      /**
       * IE 上style 只能用px 不能用em
       */
      const textContainer = new PIXI.Container()
      const diceScalePercent = 0.3
      const textStyle = new PIXI.TextStyle({
        fontFamily: ['Microsoft JhengHei', 'Heiti TC', 'serif'],
        fontSize: (this.isIeBrowser ? '28' : '2em'),
        fill: 0xffffff,
        align: 'center'
      })
      const gameHintString = this.hasDeviceOrientation ? '請點擊骰子或晃動您的裝置開始遊戲' : '請點擊骰子開始遊戲'
      const playerPoint = new PIXI.Text('您的點數', textStyle)
      const bankerPoint = new PIXI.Text('莊家點數', textStyle)
      const gameHint = new PIXI.Text(gameHintString, textStyle)
      gameHint.position.set(this.pixiWidth * 0.5 - gameHint.width * 0.5, 465 * this.bannerScalePercent - 5)

      if (this.isMobile) {
        playerPoint.position.set(this.pixiWidth * 0.3 - (412 * 0.2 * 0.5), this.pixiHeight * 0.4)
        bankerPoint.position.set(this.pixiWidth * 0.3 - (412 * 0.2 * 0.5), this.pixiHeight * 0.6)
      } else {
        playerPoint.position.set(this.pixiWidth * 0.33 - (412 * diceScalePercent * 1.5), this.pixiHeight * 0.5)
        bankerPoint.position.set(this.pixiWidth * 0.65 - (412 * diceScalePercent * 1.5), this.pixiHeight * 0.5)
      }

      textContainer.addChildAt(gameHint, 0)
      textContainer.addChild(playerPoint)
      textContainer.addChild(bankerPoint)
      textContainer.visible = false
      this.pixiApp.stage.addChildAt(textContainer, 6)
    },
    $_setBackToStep1Button () {
      const backToStep1Container = new PIXI.Container()
      const scalePercent = 0.7
      const buttonType = this.isBankerWinner ? 'LoseAgain' : 'WinAgain'
      const buttonSprite = new PIXI.Sprite.from(this.loader.resources[buttonType].texture)
      buttonSprite.position.set(this.pixiWidth * 0.5 - 271 * scalePercent * 0.5, 465 * this.bannerScalePercent)
      buttonSprite.scale.set(scalePercent, scalePercent)
      buttonSprite.interactive = true
      buttonSprite.buttonMode = true
      buttonSprite.on('pointerdown', () => {
        this.backToStep1()
      })
      const bg = new PIXI.Sprite(PIXI.Texture.WHITE)
      bg.width = this.pixiWidth
      bg.height = this.pixiHeight
      bg.tint = 0x000000
      bg.alpha = 0.55
      bg.position.set(0, 0)
      backToStep1Container.addChildAt(bg, 0)
      backToStep1Container.addChildAt(buttonSprite, 1)
      this.pixiApp.stage.addChildAt(backToStep1Container, 7)
    },
    $_resetDice () {
      // backToStep1
      this.pixiApp.stage.removeChildAt(7)
      this.pixiApp.stage.removeChildAt(5)
      this.pixiApp.stage.removeChildAt(4)
      this.$_setPlayerDice()
      this.$_setBankerDice()
      // dice text
      this.pixiApp.stage.getChildAt(6).visible = false
    },
    tryItNow () {
      if (this.useCoin < 1 || this.useCoin === '') {
        this.vibrateInput()
        return
      }
      if (this.isEventEnd) {
        alert('感謝您熱情參與，活動時間已結束')
        return
      }
      this.gameStep = 2
      this.hasChanceRollDice = true
      this.showDice()
    },
    showDice () {
      const dicePlayer = this.pixiApp.stage.getChildAt(4)
      const diceBanker = this.pixiApp.stage.getChildAt(5)
      const tagTextContainer = this.pixiApp.stage.getChildAt(6)
      const diceEaseIn = () => {
        TweenMax.to(dicePlayer, 0.7, {
          alpha: 1,
          ease: Circ.easeIn
        })
        TweenMax.to(diceBanker, 0.7, {
          alpha: 1,
          ease: Circ.easeIn
        })
      }
      dicePlayer.alpha = 0
      diceBanker.alpha = 0
      diceBanker.visible = true
      dicePlayer.visible = true
      tagTextContainer.visible = true
      tagTextContainer.getChildAt(0).visible = true

      diceEaseIn()

      window.setTimeout(() => {
        dicePlayer.interactive = true
        dicePlayer.buttonMode = true
        dicePlayer.on('pointerdown', () => {
          this.rollDiceAction()
        })
        diceBanker.interactive = true
        diceBanker.buttonMode = true
        diceBanker.on('pointerdown', () => {
          this.rollDiceAction()
        })
      }, 700)
    },
    showResult () {
      this.gameStep = 3
      this.$emit('show-iron-man', { layout: 'Normal', resultType: this.winner })
    },
    backToStep1 () {
      this.loadingStatus = 0
      this.$_resetDice()
      this.gameStep = 1
      window.setTimeout(() => { this.loadingStatus = 97 }, 200)
      window.setTimeout(() => { this.loadingStatus = 99 }, 400)
      window.setTimeout(() => { this.loadingStatus = 100 }, 500)
    },
    rollDiceAction () {
      if (this.hasChanceRollDice) {
        this.hasChanceRollDice = false
        this.rollDiceHintFadeOut()
        this.rollPlayerDiceAnimation()
        this.rollBankerDiceAnimation()
        this.vibrateTicker.start()
        getCasinoResult(this.account, this.useCoin)
          .then(({ isWon, amount }) => {
          // eslint-disable-next-line
          this.winner = Boolean(isWon) ? 'Player' : 'Banker'
            this.maxCoin = (Number(amount) < (this.userCoin * 2)) ? 5000 : this.maxCoin + amount - this.useCoin
            this.checkUseCoin(this.useCoin)
            this.stopRollDiceAnimation()

            setTimeout(() => this.showResult(), 5000)
            setTimeout(() => this.$_setBackToStep1Button(), 5500)
          })
          .catch(error => {
            this.stopRollDiceAnimation()
            this.loadingStatus = 1
            window.setTimeout(() => { this.loadingStatus = 10 }, 100)
            window.setTimeout(() => { this.loadingStatus = 50 }, 200)
            window.setTimeout(() => { this.loadingStatus = 90 }, 300)
            if (error === 'CoinNotEnough') {
              this.$emit('show-iron-man', { layout: 'Normal', resultType: 'CoinNotEnough' })
              getUserCoinTotal(this.account)
                .then(({ total }) => {
                  this.loadingStatus = 100
                  this.maxCoin = total
                })
                .catch(() => { this.loadingStatus = 100 })
            } else if (error === 'EventEnd') {
              window.setTimeout(() => { this.loadingStatus = 100 }, 400)
              this.isEventEnd = true
            }
          })
      }
    },
    rollPlayerDiceAnimation () {
      let vibrating = 30
      const diceContainer = this.pixiApp.stage.getChildAt(4)

      diceContainer.interactive = false
      diceContainer.buttonMode = false

      TweenMax.to(diceContainer, 4.5, {
        ease: Power0.easeOut,
        rotation: Math.floor(Math.random() * 100 + 300)
      })

      this.vibrateTicker.add(() => {
        vibrating = -vibrating
        diceContainer.position.x += vibrating
      })
    },
    rollBankerDiceAnimation () {
      let vibrating = 30
      const diceContainer = this.pixiApp.stage.getChildAt(5)

      diceContainer.interactive = false
      diceContainer.buttonMode = false

      TweenMax.to(diceContainer, 4.5, {
        ease: Power0.easeOut,
        rotation: Math.floor(Math.random() * 100 + 300)
      })

      this.vibrateTicker.add(() => {
        vibrating = -vibrating
        diceContainer.position.x += vibrating
      })
    },
    stopRollDiceAnimation () {
      const scalePercent = 0.3
      const alphaTicker = new PIXI.Ticker()
      const diceArray = ['Dice1', 'Dice2', 'Dice3', 'Dice4', 'Dice5', 'Dice6']
      const resultDicePoint = this.getDicePoint()
      const playerDiceContainer = this.pixiApp.stage.getChildAt(4)
      const bankerDiceContainer = this.pixiApp.stage.getChildAt(5)
      const playerOriDice = playerDiceContainer.getChildAt(0)
      const bankerOriDice = bankerDiceContainer.getChildAt(0)
      const playerDiceSprite = new PIXI.Sprite.from(this.loader.resources[diceArray[resultDicePoint.player - 1]].texture)
      const bankerDiceSprite = new PIXI.Sprite.from(this.loader.resources[diceArray[resultDicePoint.banker - 1]].texture)

      playerDiceSprite.scale.set(scalePercent, scalePercent)
      bankerDiceSprite.scale.set(scalePercent, scalePercent)

      playerDiceSprite.alpha = 0
      bankerDiceSprite.alpha = 0

      if (this.isMobile) {
        playerDiceSprite.anchor.set(0.5)
        bankerDiceSprite.anchor.set(0.5)
      } else {
        playerDiceSprite.anchor.set(0.95)
        bankerDiceSprite.anchor.set(0.95)
      }

      playerDiceContainer.addChildAt(playerDiceSprite, 1)
      bankerDiceContainer.addChildAt(bankerDiceSprite, 1)

      // 顯示最後骰子
      TweenMax.to(playerDiceContainer, 4.5, {
        ease: Power2.easeOut,
        rotation: Math.floor(Math.random() * 100 + 300)
      })

      TweenMax.to(bankerDiceContainer, 4.5, {
        ease: Power2.easeOut,
        rotation: Math.floor(Math.random() * 100 + 300)
      })

      setTimeout(() => { this.vibrateTicker.stop() }, 3000)

      alphaTicker.autoStart = false
      alphaTicker.add(() => {
        playerDiceSprite.alpha += 0.006
        bankerDiceSprite.alpha += 0.006
        playerOriDice.alpha -= 0.006
        bankerOriDice.alpha -= 0.006
      })
      alphaTicker.start()
      setTimeout(() => {
        alphaTicker.stop()
        playerDiceSprite.alpha = 1
        bankerDiceSprite.alpha = 1
        playerOriDice.alpha = 0
        bankerOriDice.alpha = 0
      }, 4500)
    },
    rollDiceHintFadeOut () {
      const gameHint = this.pixiApp.stage.getChildAt(6).getChildAt(0)
      TweenMax.to(gameHint, 0.7, {
        alpha: 0,
        ease: Circ.easeIn
      })
      window.setTimeout(() => {
        gameHint.visible = false
        gameHint.alpha = 1
      }, 1000)
    },
    getDicePoint () {
      const winnerDice = Math.floor(Math.random() * (6 - 1) + 2)
      const loser = Math.round(Math.random() * (winnerDice - 2) + 1)
      return this.isBankerWinner ? { banker: winnerDice, player: loser } : { banker: loser, player: winnerDice }
    },
    vibrateInput () {
      this.showInputVibrate = true
      window.setTimeout(() => { this.showInputVibrate = false }, 700)
    },
    checkUseCoin (useCoin) {
      if (useCoin === '') {

      } else if (this.maxCoin > 0 && useCoin <= 1) {
        this.useCoin = 1
      } else if (this.maxCoin === 0 && useCoin < 0) {
        this.useCoin = 0
      } else if (useCoin > this.maxCoin) {
        this.useCoin = this.maxCoin
      } else {
        this.useCoin = useCoin
      }
    }
  },
  computed: {
    isStep1 () { return this.gameStep === 1 },
    isStep2 () { return this.gameStep >= 2 },
    isStep3 () { return this.gameStep === 3 },
    isBankerWinner () { return this.winner === 'Banker' },
    contentTop () { return `${Number(this.bannerScalePercent * 465)}px` },
    inputCoin: {
      set (val) {
        this.checkUseCoin(Number(val))
      },
      get () {
        return this.useCoin
      }
    }
  }
}
</script>

<style scoped lang="scss">
.playground-wrap {
  position: relative;
  margin: 0 auto;
}
.square {
  position: relative;
  text-align: center;
  margin: 0 auto;
}
.playground-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  width: inherit;
  margin: 0 auto;
  z-index: 9;
}
.playground-content-step {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: inherit;
}
.playground-content-input-block {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.playground-content-input {
  background-color: #fafafa;
  font-family: monospace, Microsoft JhengHei, Heiti TC, serif;;
  border: none;
  border-radius: 0;
  width: 7rem;
  height: 2rem;
  padding: 10px;
  font-size: 2rem;
  text-align: center;
  &::placeholder {
    font-size: 1rem;
    height: 2rem;
    line-height: 2rem;
    padding: 0.5rem 0;
    text-align: left;
  }
}
.playground-content-input-action {
  user-select: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.8rem;
  text-align: center;
  color: #fff;
  background-color: #00e0ef;
  font-family: monospace;
  border: none;
  height: calc(2rem + 20px);
  width: calc(2rem + 20px);
  &:nth-child(2n-1) {
    border-radius: 0 5px 5px 0;
    border-left: solid 1px #730000;
  }
  &:first-child {
    border-radius: 5px 0 0 5px;
    border-right: solid 1px #730000;
    background: #f51b1b;
  }
}
.playground-content-descrpition {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  color: #ffffff;
  font-size: 1.6em;
  margin: 0 0 2rem 0;

  .title {
    width: max-content;
    margin: 0;
  }
  .max {
    font-size: 0.6em;
  }
}
.playground-content-gamehint {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #ffffff;
  font-size: 1.2em;
  margin: 0px;
}
.playground-content-button-block {
  margin: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.playground-content-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 8em;
  height: 3em;
  border-radius: 5px;
  border: #ffffff 1px solid;
  background: #ffffff;
  user-select: none;
  text-align: center;
  font-size: 1em;
  box-shadow: 1px 1px 20px #ffffff;
  cursor: pointer;
  &:active {
    width: 7.99em;
    height: 2.99em;
    font-size: 0.9em;
    box-shadow: 1px 1px 80px #ffffff;
  }
}
.loading-block {
  z-index: 999;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #004310;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
.loading-text {
  color: #FFF;
  font-size: 5em;
  font-family: monospace;
}

.zoomout-leave-active {
  transition-property: opacity;
  transition-duration: 1s;
  transition-delay: 0.6s;
  transition-timing-function: ease;
}
.zoomout-leave-to {
  opacity: 0;
}
.vibrate {
  animation: vibrating 0.07s linear infinite;
}
@keyframes vibrating {
  from{transform: translateX(-5px);}
  to{transform: translateX(5px);}
}

@media screen and (orientation: landscape) {
  .landscape-alert {
    font-family: Microsoft JhengHei, Heiti TC, serif;
    display: flex !important;
    justify-content: center;
    align-items: center;
    z-index: 999;
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    color: #ffffff;
    background-color: #004310;
  }
}
</style>
