<template>
  <div
    ref="imgViewWrap"
    class="v-image-preview-wrap"
    @click="onClose"
    :style="{...wrapStyle}"
  >
    <div class="v-loading-wrap" v-show="loading">
     <v-loading />
    </div>
    <div class="image-view-inner" v-show="!loading" ref="imgViewInner">
      <img
        ref="image"
        :key="realSrc"
        :src="realSrc"
        :style="{...imageStyle}"
      >
    </div>
  </div>
</template>
<script>

import VLoading from './loading-spinner';
import {
  DEFAULT_ANIMA_DURATION,
  DEFAULT_MAX_WAIT_TIME,
  DEFAULT_IMG_MAX_WIDTH,
  DEFAULT_MASK_BACKGROUND
} from './config'

export default {
  components: {
    VLoading
  },
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
      naturalWidth: '', // 原始图片的真实宽度

      // 衍生信息
      loading: false, // 是否正在加载
      isLazyImg: false,
      realSrc: '',
      imageStyle: {
        transformOrigin: '0 0',
      },
      wrapStyle: {}
    };
  },
  computed: {
    animaDurationSec() {
      return (this.animaDuration / 1000).toFixed(2)
    },
  },
  beforeMount() {
    this.getOriginTransform();
    this.setWrapStyle();
  },
  async mounted() {
    if (this.isLazyImg) {
      this.loading = true;
      await this.loadImage();
    }
    this.getTransform();
  },
  methods: {
    insertCSS(newStyle) {
      const newElement = document.createElement("style");
      newElement.innerHTML = newStyle;
      document.body.appendChild(newElement);
    },
    // 设置wrap样式，如果懒加载图片，没有背景色动画，如果不是懒加载的图片，有背景色动画
    setWrapStyle() {
      this.wrapStyle = {
         '-webkit-transition': `background-color ${this.animaDurationSec}s ease-in-out`,
        transition: `background-color ${this.animaDurationSec}s ease-in-out`,
      }
      this.$nextTick(() => {
        this.wrapStyle.background = this.maskBackground
      })
    },
    // 获取恢复的transform信息
    getOriginTransform() {
      const { animaDurationSec } = this;

      this.imageStyle = {
        ...this.imageStyle,
        transition: `transform ${animaDurationSec}s ease-in-out`, 
        '-webkit-transition': `-webkit-transform ${animaDurationSec}s ease-in-out`,
      };

      const { width, originRatio } = this.onResetBaseWidth(this.target);

      this.originRatio = originRatio;
      this.minImgWidth = width;

      this.realSrc = this.src && this.src.split('?')[0];
      this.isLazyImg = this.realSrc !== this.src
    },
    // 获取图片最小宽度，如果用户设置了最小宽度，要用它再比较一次
    getMinWidth(...args){
      let res = Math.min(...args);

      if (this.imgMaxWidth !== 0) {
        res = Math.min(res, this.imgMaxWidth);
      }

      return res;
    },
    // 获取缩小用的transform信息
    onResetBaseWidth(target) {
      const { naturalWidth, naturalHeight } = target;
      const imageClientRect = this.target.getClientRects()[0];
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
        width: `${baseWidth}px`,
        transform: originTransform,
      };
      this.originTransform = originTransform;
      this.baseWidth = baseWidth;
      this.naturalWidth = naturalWidth;

      return {
        originRatio,
        width
      }
    },
    // 加载原始图片
    loadImage() {
      return new Promise((resolve) => {
        const image = document.createElement('img');
        image.src = this.realSrc;

        image.onload = () => {
          this.loading = false;
          this.onResetBaseWidth(image);
          resolve();
        };

        setTimeout(() => {
          if (this.loading) {
            this.realSrc = this.src;
            this.loading = false;
          }
          resolve();
        }, this.maxWaitTime);
      });
    },
    // 获取放大用的transform
    getTransform() {
      const { baseWidth, originRatio, minImgWidth, naturalWidth } = this;

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

      this.$nextTick(() => { 
        this.imageStyle = {
          ...this.imageStyle,
          transform,
        };
      })
    },
    // 若关闭弹窗时向下滑动了一段距离，将其加到transform上
    onJudgeCloseScollTop() {
      if (this.$refs.imgViewInner) {
        const { scrollTop } = this.$refs.imgViewInner;
        if (scrollTop) {
          this.originTransform = this.originTransform.replace(/(.*?),\s?(.*?)px(.*)/, (s, s1,s2,s3) => {
            return `${s1},${parseInt(s2)+scrollTop}px${s3}`
          })
        }
      }
    },
    // 关闭弹窗
    onClose() {
      // 若加载图片中就再次点击，直接emit(close)
      if (this.loading) {
        this.$emit('close');
        return 
      }

      this.wrapStyle.background = 'none'
      this.onJudgeCloseScollTop();

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
.v-image-preview-wrap .v-loading-wrap {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
