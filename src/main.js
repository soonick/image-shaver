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
  this.options = options || {};

  this.container = container;
  this.createDom();
  this.showOriginalImage();
};

/**
 * Destroys the contents of the shaver container and creates it again
 */
ImageShaver.prototype.createDom = function() {
  this.original = document.createElement('CANVAS');
  this.originalCtx = this.original.getContext('2d');
  this.preview = document.createElement('DIV');
  this.original.className = 'shaver-original';
  this.preview.className = 'shaver-preview';

  this.container.innerHTML = '';
  this.container.appendChild(this.original);
  this.container.appendChild(this.preview);

  // For canvas to correctly resize its contents you have to use width and
  // height attributes to specify its height
  this.original.setAttribute('height', this.original.offsetHeight);
  this.original.setAttribute('width', this.original.offsetWidth);
};

/**
 * Shows the given image in the original container
 */
ImageShaver.prototype.showOriginalImage = function() {
  if (!this.options.image) {
    return;
  }

  var image = document.createElement('IMG');
  image.setAttribute('src', this.options.image);
  image.className = 'shaver-hidden-image';
  this.container.appendChild(image);
  this.hiddenImage = image;
  this.drawHiddenImage();
};

/**
 * Draws hiddenImage on canvas
 */
ImageShaver.prototype.drawHiddenImage = function() {
  this.originalCtx.drawImage(this.hiddenImage, 0, 0, this.original.offsetWidth,
      this.original.offsetHeight);
};
