<template>
  <header :class="['header', {'header-mobile': isMobile, 'header-pc': !isMobile }]">
    <div class="header-inner" v-if="!isMobile">
      <a href="https://www.ruten.com.tw" target="_blank"><span class="logo logo-pc"></span></a>
    </div>
    <a href="https://www.ruten.com.tw" target="_blank" v-if="isMobile" class="logo-link-mobile"><span class="logo logo-mobile"></span></a>
  </header>
</template>
<script>
export default {
  name: 'LogoHeader',
  props: ['isMobile']
}
</script>
<style lang="scss" scoped>
.header {
  position: relative;
  text-align: center;
}
.header-mobile {
  background-color: rgba(0,0,0,0);
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
}
.header-pc {
  width: 100vw;
  height: 50px;
  background-color: rgba(255,255,255,0.1);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.3);
  transition: background 0.3s ease;
  &:hover {
    background-color: rgba(255,255,255,0.99);
    .logo-pc {
      width: 108px;
      height: 46px;
      margin: 0;
      background-image: url('../assets/pclogo.png');
    }
  }
}

.header-inner {
  margin: 0 auto;
  text-align: left;
  width: 1280px;
  height: 100%;
}
.logo {
  display: inline-block;;
  background-size: contain;
  background-repeat: no-repeat;
}
.logo-pc {
  margin-top: 4px;
  margin-left: 13px;
  width: 85px;
  height: 37px;
  background-image: url('../assets/mlogo.png');
}
.logo-mobile {
  width: 67px;
  height: 31px;
  background-image: url('../assets/mlogo.png');
  margin: 10px;
}
.logo-link-mobile {
  position: absolute;
  top: 5px;
  left: 5px;
  z-index: 99;
}
</style>
