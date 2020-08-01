<template>
  <a target="_blank" :class="['icon-block', {'icon-block-mobile': isMobile, 'icon-block-pc': !isMobile}]" href="https://pub.ruten.com.tw/20181111/">
    <span :class="['icon', {'icon-mobile': isMobile, 'icon-pc': !isMobile}]"></span>
  </a>
</template>

<script>
export default {
  name: 'IdiotIcon',
  props: ['isMobile']
}
</script>
<style scoped lang="scss">
.icon-block {
  z-index: 99;
  position: fixed;
}
.icon-block-pc {
  right: 20px;
  bottom: 20px;
}
.icon-block-mobile {
  right: 10px;
  bottom: 10px;
}

.icon {
  max-width: 100px;
  max-height: 100px;
  display: block;
  background-image: url('../assets/idiot.png');
  background-size: contain;
  background-repeat: no-repeat;
}

.icon-pc {
  width: 20vw;
  height: 20vw;
  opacity: 0.8;
  &:hover {
    opacity: 1;
  }
}
.icon-mobile {
  width: 17vw;
  height: 17vw;
  max-width: 70px;
  max-height: 70px;
}

</style>
