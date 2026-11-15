// This function is called an Async Handler. It is commonly used in Node.js and Express.js applications to handle errors from asynchronous functions automatically.
//manually try/catch user kore manual error  through korte hoina autometic handle kore.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
