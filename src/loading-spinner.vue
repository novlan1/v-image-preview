<template>
  <div class="v-loading-spiner-wrap">
    <span class="v-loading-spiner-inner">
      <i v-for="(item, index) in new Array(12)" :key="index" />
    </span>
  </div>
</template>
<script>
export default {
  
}
</script>
<style scoped lang="scss">
$gray-5: #c8c9cc;
$loadingSpinnerSize: 30px;
$loadingSpinnerColor: $gray-5;
$loadingSpinnerAnimationDuraion: 0.8s;

.v-loading-spiner-wrap {
  position: relative;
  color: $loadingSpinnerColor;
  font-size: 0;
  vertical-align: middle;

  .v-loading-spiner-inner {
    position: relative;
    display: inline-block;
    width: $loadingSpinnerSize;
    max-width: 100%;
    height: $loadingSpinnerSize;
    max-height: 100%;
    vertical-align: middle;
    animation: v-rotate $loadingSpinnerAnimationDuraion linear infinite;
    animation-timing-function: steps(12);
    i {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      &::before {
        display: block;
        width: 2px;
        height: 25%;
        margin: 0 auto;
        background-color: currentColor;
        border-radius: 40%;
        content: " ";
      }
    }
  }
}

@keyframes v-rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@for $i from 1 through 12 {
  .v-loading-spiner-inner i:nth-of-type(#{$i}) {
    transform: rotate(#{$i * 30}deg);
    opacity: #{1 - (0.75 / 12) * ($i - 1)};
  }
}
</style>