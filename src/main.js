/**
 * Library that allows you to easily create a UI for croping images inside the
 * browser
 */

/**
 * Create shaver object and initialize shaver UI
 * @param {object} container - Container for the shaver UI
 * @param {object} options - Configuration options
 */
var ImageShaver = function(container, options) {
  options = options || {};

  this.container = container;
  this.createDom();
  this.showOriginalImage(options.image);
};

/**
 * Destroys the contents of the shaver container and creates it again
 */
ImageShaver.prototype.createDom = function() {
  this.original = document.createElement('DIV');
  this.preview = document.createElement('DIV');
  this.original.className = 'shaver-original';
  this.preview.className = 'shaver-preview';

  this.container.innerHTML = '';
  this.container.appendChild(this.original);
  this.container.appendChild(this.preview);
};

/**
 * Shows the given image in the original container
 * @param {string} url - image url
 */
ImageShaver.prototype.showOriginalImage = function(url) {
  if (!url) {
    return;
  }

  this.original.innerHTML = '<img src="' + url + '">';
};
