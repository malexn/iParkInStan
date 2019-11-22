function debounce(innerFunc, ms = 0) {
  let timer = null;
  let resolves = [];
  return function (...args) {  
    clearTimeout(timer);
    timer = setTimeout(() => {
      const innerFuncResult = innerFunc(...args);
      resolves.forEach(r => r(innerFuncResult));
      resolves = [];
    }, ms);
    return new Promise(r => resolves.push(r));
  };
}

export default debounce;
