<template>
  <div
    ref="imgViewWrap"
    class="v-image-preview-wrap"
    @click="onClose"
    :style="{...wrapStyle}"
  >
    <div class="image-view-inner">
      <img
        v-if="loadedImg"
        ref="image"
        :key="realSrc"
        :src="realSrc"
        :style="{...imageStyle}"
      >
    </div>
  </div>
</template>
<script>


import {
  DEFAULT_ANIMA_DURATION,
  DEFAULT_MAX_WAIT_TIME,
  DEFAULT_IMG_MAX_WIDTH,
  DEFAULT_MASK_BACKGROUND
} from './config'

export default {
  props: {
    src: {
      type: String,
      required: true,
    },
    target: {
      type: HTMLImageElement,
      required: true,
    },
    // 遮罩背景
    maskBackground: {
      type: String,
      dafault: DEFAULT_MASK_BACKGROUND,
      required: false,
    },
    // 动画持续时间
    animaDuration: {
      type: Number,
      dafault: DEFAULT_ANIMA_DURATION,
      required: false,
    },
    // 图片最大宽度
    imgMaxWidth: {
      type: Number,
      dafault: DEFAULT_IMG_MAX_WIDTH,
      required: false,
    },
    // 之前使用的懒加载，请求真实图片最大等待时间
    maxWaitTime: {
      type: Number,
      dafault: DEFAULT_MAX_WAIT_TIME,
      required: false,
    },
  },
  data() {
    return {
      // 图片信息
      originRatio: '',
      originTransform: '',
      baseWidth: '',
      minImgWidth: '',

      // 衍生信息
      loadedImg: false,
      realSrc: '',
      imageStyle: {
        transformOrigin: '0 0',
      },
    };
  },
  computed: {
    animaDurationSec() {
      return (this.animaDuration / 1000).toFixed(2)
    },
    wrapStyle() {
      return {
        '-webkit-transition': `background-color ${this.animaDurationSec}s ease-in-out`,
        transition: `background-color ${this.animaDurationSec}s ease-in-out`,
      }
    }
  },
  beforeMount() {
    this.getOriginTransform();
    this.setWrapActiveStyle();
  },
  async mounted() {
    await this.loadImage();
    this.getAnimation();
  },
  methods: {
    insertCSS(newStyle) {
      const newElement = document.createElement("style");
      newElement.innerHTML = newStyle;
      document.body.appendChild(newElement);
    },
    setWrapActiveStyle() {
      this.insertCSS(`.v-image-preview-wrap.is-active{ background-color: ${this.maskBackground}; }`)
    },
    getOriginTransform() {
      const { animaDurationSec } = this;
      const imageClientRect = this.target.getClientRects()[0];
      const { naturalWidth, naturalHeight } = this.target;
      const { width, height, left, top } = imageClientRect;
      
      // 原始比例
      const originRatio = naturalWidth / naturalHeight;

      // 基准宽度
      const baseWidth = this.getMinWidth(690, naturalWidth)
      // x轴恢复比例
      const originScaleX = width / baseWidth;

      // 基准高度
      const baseHeight = baseWidth / originRatio;
      // y轴恢复比例
      const originScaleY = height / baseHeight;

      // 恢复transform
      const originTransform = `translate3d(${left}px, ${top}px, 0px) scale3d(${originScaleX}, ${originScaleY}, 1)`;

      this.imageStyle = {
        ...this.imageStyle,
        transition: `transform ${animaDurationSec}s ease-in-out`, 
        '-webkit-transition': `-webkit-transform ${animaDurationSec}s ease-in-out`,
        width: `${baseWidth}px`,
        transform: originTransform,

      };
      this.minImgWidth = width;
      this.originRatio = originRatio;
      this.baseWidth = baseWidth;
      this.originTransform = originTransform;
      this.realSrc = this.src.split('?')[0];
    },
    getMinWidth(...args){
      let res = Math.min(...args);

      if (this.imgMaxWidth !== 0) {
        res = Math.min(res, this.imgMaxWidth);
      }

      return res;
    },
    getAnimation() {
      this.imgViewRef = this.$refs.imgViewWrap;
      this.$nextTick(() => {
        this.imgViewRef.classList.add('is-active');
        this.getTransform();
      });
    },
    loadImage() {
      return new Promise((resolve) => {
        const image = new Image();
        image.src = this.realSrc;

        image.onload = () => {
          resolve();
          this.loadedImg = true;
        };

        setTimeout(() => {
          if (!this.loadedImg) {
            this.realSrc = this.src;
            this.loadedImg = true;
          }
          resolve();
        }, this.maxWaitTime);
      });
    },
    getTransform() {
      const { baseWidth, originRatio, minImgWidth } = this;
      const { naturalWidth } = this.$refs.image;

      const documentoffsetWidth = document.documentElement.offsetWidth;
      const documentoffsetHeight = document.documentElement.offsetHeight;
      // 图片最后宽度
      let afterWidth = this.getMinWidth(documentoffsetWidth - 20, naturalWidth);

      if (afterWidth < minImgWidth) {
        afterWidth = minImgWidth;
      }
      
      // 图片最后高度
      const afterHeight = afterWidth / originRatio;

      // 图片最后的translateX
      const afterTranslateX = (documentoffsetWidth - afterWidth) / 2;

      // 图片最后的translateY
      let afterTranslateY = (documentoffsetHeight - afterHeight) / 2;

      afterTranslateY = Math.max(10, afterTranslateY);

      // 图片最后的比例
      const afterScale =  afterWidth / baseWidth;

      document.body.style = 'overflow: hidden';
      const transform = `translate3d(${afterTranslateX}px, ${afterTranslateY}px, 0px) scale3d(${afterScale}, ${afterScale}, 1)`;

      setTimeout(() => {
        this.imageStyle = {
          ...this.imageStyle,
          transform,
        };
      }, 0);
    },
    onClose() {
      if (this.imgViewRef && this.imgViewRef.classList) {
        this.imgViewRef.classList.remove('is-active');
      }
      this.imageStyle = {
        ...this.imageStyle,
        transform: this.originTransform,
      };
      setTimeout(() => {
        document.body.style = '';
        this.$emit('close');
      }, this.animaDuration);
    },
  },
};
</script>
<style scoped lang='scss'>
.v-image-preview-wrap {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 101;
  overflow: hidden;
  padding-bottom: 10px;
  .image-view-inner {
    height: 100%;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    overflow-y: auto;
    overflow-x: hidden;
    img {
      cursor: -webkit-zoom-out;
      cursor: zoom-out;
    }
  }
}
</style>
