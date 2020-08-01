<template>
  <div class="message-wrap">
    <section class="layout ruru-style" v-if="!isStyleNormal">
      <span class="close-btn" @click.prevent="close"></span>
      <p class="opening-description">快來跟我賭一把！<br/>
        只要骰出比莊家大的點數~ 彩票就翻倍送給您！<br/>
        如果不幸骰出比莊家小...  嘿嘿  彩票就會被收走囉！
      </p>
    </section>

    <section class="layout normal-style" v-if="isStyleNormal">
      <span class="close-btn" @click.prevent="close"></span>
      <div class="infomation-block" v-if="isTypeCoinNotEnough">
        <p>您的彩券不夠玩遊戲喔！</p>
        <a href="https://pub.ruten.com.tw/20181111/index.html"><span class="action-btn coin-not-enough"></span></a>
      </div>
      <div class="infomation-block" v-if="isTypePlayerWin">
        <p>運氣不錯喔！<br/>雙倍彩票送你啦！</p>
        <span class="action-btn win-again" @click.prevent="backToStep1"></span>
      </div>
      <div class="infomation-block" v-if="isTypePlayerLose">
        <p>娃…拍拍<br/>這次輸惹唷~</p>
        <span class="action-btn lose-again" @click.prevent="backToStep1"></span>
      </div>
    </section>

  </div>
</template>

<script>
export default {
  name: 'IronManMessage',
  props: {
    ironStyle: {
      type: String,
      default: 'Normal'
    },
    ironType: {
      type: String
    }
  },
  methods: {
    close () { this.$emit('close') },
    backToStep1 () {
      this.$emit('iron-action', 'backToStep1')
      this.close()
    }
  },
  computed: {
    isStyleNormal () { return this.ironStyle === 'Normal' },
    isTypeCoinNotEnough () { return this.ironType === 'CoinNotEnough' },
    isTypePlayerWin () { return this.ironType === 'Player' },
    isTypePlayerLose () { return this.ironType === 'Banker' }
  }
}
</script>

<style lang="scss">
.message-wrap {
  color: #fff;
  z-index: 77;
  background-color: rgba(65, 65, 65, 0.6);
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.layout {
  width: 19rem;
  height: 27rem;
  background-repeat: no-repeat;
  background-size: contain;
  position: absolute;
  left: calc((100vw - 19rem) / 2);
  top: calc((100vh - 27rem) / 2);
}
.ruru-style {
  background-image: url(../assets/boardop.png);
}
.normal-style {
  background-image: url(../assets/board.png);
}
.opening-description {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 4rem auto;
  width: 16rem;
  font-size: 1.3rem;
}
.infomation-block {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5rem auto;
  width: 17rem;
  font-size: 1.5rem;
}
.action-btn {
  cursor: pointer;
  height: 3.6rem;
  width: 16.2rem;
  display: block;
  position: absolute;
  left: 1.3rem;
  bottom: 4rem;
  background-size: contain;
  background-repeat: no-repeat;
  &:active {
    box-shadow: 1px 1px 40px rgba(255, 0, 0, 0.7);
  }
}
.close-btn {
  position: absolute;
  user-select: none;
  cursor: pointer;
  top: -2rem;
  right: -2rem;
  display: block;
  background-color: rgba(75, 75, 75, 0.8);
  background-image: url(../assets/close-btn.svg);
  background-size: contain;
  background-repeat: no-repeat;
  border-radius: 99px;
  width: 5rem;
  height: 5rem;
  box-shadow: 1px 1px 20px rgba(255, 255, 255, 0.7);
  &:active {
    box-shadow: 1px 1px 40px rgba(255, 255, 255, 0.7);
  }
}
.coin-not-enough {
  background-image: url(../assets/coin-not-enough.png);
}
.win-again {
  background-image: url(../assets/win-again.png);
}
.lose-again {
  background-image: url(../assets/lose-again.png);
}
</style>
