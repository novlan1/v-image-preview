import Vue from 'vue';
import ImageDialog from './src/preview.vue';
import {
  DEFAULT_ANIMA_DURATION,
  DEFAULT_MAX_WAIT_TIME,
  DEFAULT_IMG_MAX_WIDTH,
  DEFAULT_MASK_BACKGROUND
} from './src/config'


let instance;
let userOptions = {};

function isInDocument(element) {
  return document.body.contains(element);
}

function initInstance(options) {

  if (!options.src) {
    return;
  }

  if (instance) {
    instance.$destory();
  }

  const dialogDiv = document.createElement('div');
  // 先appendChild，再用new创建实例
  document.body.appendChild(dialogDiv);

  instance = new (Vue.extend(ImageDialog))({
    el: dialogDiv,
    propsData: {
      ...Dialog.defaultOptions,
      ...options,
    },
  });

  instance.$on('close', () => {
    close();
  });
}

function Dialog(options) {
  return new Promise((resolve, reject) => {
    if (!instance || !isInDocument(instance.$el)) {
      initInstance(options);
    }

    Object.assign(instance, Dialog.currentOptions, options, {
      resolve,
      reject,
    });
  });
}

Dialog.defaultOptions = {
  maskBackground: DEFAULT_MASK_BACKGROUND,
  animaDuration: DEFAULT_ANIMA_DURATION,
  imgMaxWidth: DEFAULT_IMG_MAX_WIDTH,
  maxWaitTime: DEFAULT_MAX_WAIT_TIME
};

function close() {
  instance.$destroy();
  document.body.removeChild(instance.$el);
  instance = null;
}

Dialog.close = () => {
  close();
};

Dialog.setDefaultOptions = (options) => {
  Object.assign(Dialog.currentOptions, options);
};

Dialog.resetDefaultOptions = () => {
  Dialog.currentOptions = { ...Dialog.defaultOptions };
};

Dialog.resetDefaultOptions();


const test = {
  // componentUpdated(el) {
  //   const image = new Image();
  //   let { src } = el;

  //   if (el.dataset && el.dataset.src) {
  //     src = el.dataset.src;
  //   }

  //   if (src) {
  //     setTimeout(() => {
  //       // 加载原始大小图片
  //       image.src = src.split('?')[0];
  //     }, 100);
  //   }
  // },
  bind(el) {
    el.addEventListener('click', () => {
      Dialog({
        src: el.src,
        target: el,
        ...userOptions,
      });
    });
  }, 
};

Dialog.install = (Vue, options) => {
  userOptions = options || {};
  Vue.directive('preview', test);
};

Dialog.Component = ImageDialog;

export default Dialog;
