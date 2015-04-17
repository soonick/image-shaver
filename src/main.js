/**
 * Library that allows you to easily create a UI for croping images inside the
 * browser
 */

/**
 * Create shaver object and initialize shaver UI
 * @param {object} container - Container for the shaver UI
 * @param {object} options - Configuration options
 */
var ImageShaver = function(container) {
  this.container = container;
  this.createDom();
};

/**
 * Destroys the contents of the shaver container and creates it again
 */
ImageShaver.prototype.createDom = function() {
};
