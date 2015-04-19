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
  /**
   * Holds the nodes the user can use to resize the crop area. Each node is
   * represented by an array [left, top, width, height]. The nodes are in the
   * following order: topLeft, topRight, bottomRight, bottomLeft
   * @type {array}
   */
  this.resizeNodes = [];

  this.container = container;
  this.createDom();
  this.showOriginalImage();
};

/**
 * Size of the resize nodes that will be shown in the corners of the crop
 * rectangle
 * @type {number}
 */
ImageShaver.prototype.NODE_SIZE = 8;

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
  this.original.setAttribute('height', this.original.clientHeight);
  this.original.setAttribute('width', this.original.clientWidth);
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
  image.onload = this.drawHiddenImage.bind(this);
};

/**
 * Draws hiddenImage on canvas
 */
ImageShaver.prototype.drawHiddenImage = function() {
  var imgWidth = this.hiddenImage.clientWidth;
  var imgHeight = this.hiddenImage.clientHeight;
  var originalWidth = this.original.clientWidth;
  var originalHeight = this.original.clientHeight;

  if (imgWidth > originalWidth || imgHeight > originalHeight) {
    // Shrink
    var widthRatio = imgWidth / originalWidth;
    var heightRatio = imgHeight / originalHeight;
    if (widthRatio > heightRatio) {
      imgWidth = parseInt(imgWidth / widthRatio, 10);
      imgHeight = parseInt(imgHeight / widthRatio, 10);
    } else {
      imgWidth = parseInt(imgWidth / heightRatio, 10);
      imgHeight = parseInt(imgHeight / heightRatio, 10);
    }
  }
  var left = parseInt((originalWidth - imgWidth) / 2);
  var top = parseInt((originalHeight - imgHeight) / 2);

  this.originalCtx.drawImage(this.hiddenImage, left, top, imgWidth, imgHeight);
  this.showCropRectangle();
};

/**
 * Calculates the largest possible rectangle to draw inside the original
 * container, respecting the specified ratio
 * @returns {array} largest - Array containing 4 items: x coordinate, y
 *          coordinate, width and height of the resulting rectangle.
 */
ImageShaver.prototype.calculateLargestRectangle = function() {
  var ratio = this.options.ratio[0] / this.options.ratio[1];
  var height = this.original.clientHeight;
  var width = this.original.clientWidth;
  var originalRatio = width / height;
  var left = 0;
  var top = 0;

  if (ratio !== originalRatio) {
    if (ratio > originalRatio) {
      height = parseInt(width / ratio, 10);
      top = (this.original.clientHeight - height) / 2;
    } else {
      width = parseInt(height * ratio, 10);
      left = (this.original.clientWidth - width) / 2;
    }
  }

  return [left, top, width, height];
};

/**
 * Shows crop rectangle on top of the original image. Crop rectangle will always
 * have the same ratio, but the user can move it around and resize it
 */
ImageShaver.prototype.showCropRectangle = function() {
  var rect = this.calculateLargestRectangle();
  this.originalCtx.rect(rect[0], rect[1], rect[2], rect[3]);
  this.originalCtx.stroke();
  this.showResizeNodes(rect);
};

/**
 * Shows nodes at the corners of the crop rectangle that the user can use to
 * resize the crop box
 * @param {array} rect - Array containing 4 items: x coordinate, y coordinate,
 *        width and height of the resulting rectangle.
 */
ImageShaver.prototype.showResizeNodes = function(rect) {
  var ns = this.NODE_SIZE;
  var nodeDiff = parseInt(ns / 2, 10);
  var rn = [
    [rect[0] - nodeDiff, rect[1] - nodeDiff, ns, ns],
    [rect[0] + rect[2] - nodeDiff, rect[1] - nodeDiff, ns, ns],
    [rect[0] + rect[2] - nodeDiff, rect[1] + rect[3] - nodeDiff, ns, ns],
    [rect[0] - nodeDiff, rect[1] + rect[3] - nodeDiff, ns, ns]
  ];
  this.resizeNodes = rn;

  this.originalCtx.rect(rn[0][0], rn[0][1], rn[0][2], rn[0][3]);
  this.originalCtx.fillRect(rn[0][0], rn[0][1], rn[0][2], rn[0][3]);
  this.originalCtx.rect(rn[1][0], rn[1][1], rn[1][2], rn[1][3]);
  this.originalCtx.fillRect(rn[1][0], rn[1][1], rn[1][2], rn[1][3]);
  this.originalCtx.rect(rn[2][0], rn[2][1], rn[2][2], rn[2][3]);
  this.originalCtx.fillRect(rn[2][0], rn[2][1], rn[2][2], rn[2][3]);
  this.originalCtx.rect(rn[3][0], rn[3][1], rn[3][2], rn[3][3]);
  this.originalCtx.fillRect(rn[3][0], rn[3][1], rn[3][2], rn[3][3]);

  this.originalCtx.stroke();
};
