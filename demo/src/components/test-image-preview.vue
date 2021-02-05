<template>
  <div>
    <img v-preview src='https://igame-10037599.cos.ap-shanghai.myqcloud.com/82a8ddce-4a3a-8157-dd18-fd11a0f24746' style="width: 200px;" />
  </div>
</template>
<script>
// import VImagePreview from 'v-image-preview';
import Vue from 'vue';
import VImagePreview2 from '../../../lib/v-image-preview.common';
import test from './test';

console.log('ttt', test)
console.log(VImagePreview2)
Vue.use(VImagePreview2);

// Vue.use(VImagePreview);

export default {
  
}
</script>