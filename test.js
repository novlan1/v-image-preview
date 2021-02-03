
const { readFileSync }  = require('fs-extra');
const { transformAsync } = require('@babel/core');

const compileJS = function (filePath) {
  const code = readFileSync(filePath, 'utf-8');

  transformAsync(code, { filename: filePath })
    .then((res) => {
      console.log(res);
    });
  // console.log(res);
};

compileJS('./index.js');
