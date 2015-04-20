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

  /**
   * Flag that tells us if a resize node is currently hovered
   * @type {boolean}
   */
  this.nodeHovered = false;

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
 * How much bigger will the hovered node be compared to the unhovered node. This
 * value is in pixels.
 * @type {number}
 */
ImageShaver.prototype.NODE_INCREASE = 6;

/**
 * Class we will add to the canvas to know when a node is hovered
 * @type {string}
 */
ImageShaver.prototype.NODE_HOVERED_CLASS = 'shaver-node-hovered';

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

  this.addListeners();
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

/**
 * Add different event listeners to canvas so you can interact with it
 */
ImageShaver.prototype.addListeners = function() {
  this.attachNodeListeners();
};

/**
 * Add listeners to resize nodes so the user can move them around
 */
ImageShaver.prototype.attachNodeListeners = function() {
  this.original.addEventListener(
    'mousemove',
    this.highlightHoveredNode.bind(this)
  );
  this.original.addEventListener(
    'mousedown',
    this.activateResizeMode.bind(this)
  );
};

/**
 * Returns a node if the given event was triggered on top of a node
 * @param {obejct} e - mouse event
 * @returns {array} node - Either an array representing a node, or undefined
 */
ImageShaver.prototype.isEventOnNode = function(e) {
  var node;

  for (var i = 0; i < this.resizeNodes.length; i++) {
    node = this.resizeNodes[i];
    if (e.offsetX >= node[0] && e.offsetX <= (node[0] + node[2]) &&
        e.offsetY >= node[1] && e.offsetY <= (node[1] + node[3])) {
      return node;
    }
  }
};

/**
 * If mouse is over a resize node, it increases the size of the node and changes
 * mouse cursor
 * @param {obejct} e - event from mouseon
 */
ImageShaver.prototype.highlightHoveredNode = function(e) {
  var node = this.isEventOnNode(e);
  if (node) {
    this.originalCtx.fillRect(
      node[0] - parseInt(this.NODE_INCREASE / 2, 10),
      node[1] - parseInt(this.NODE_INCREASE / 2, 10),
      node[2] + this.NODE_INCREASE,
      node[3] + this.NODE_INCREASE
    );
    this.nodeHovered = true;
    this.original.classList.add(this.NODE_HOVERED_CLASS);
    return;
  }

  if (this.nodeHovered) {
    this.nodeHovered = false;
    this.original.classList.remove(this.NODE_HOVERED_CLASS);
    this.originalCtx.clearRect(0, 0, this.original.width, this.original.height);
    this.drawHiddenImage();
  }
};

/**
 * Handles crop area resize using the resize nodes
 * @param {object} e - mousedown event
 */
ImageShaver.prototype.activateResizeMode = function(e) {
  if (this.isEventOnNode(e)) {
    this.mouseMoveListener = this.resizeCropArea.bind(this);
    this.mouseOutListener = this.deactivateResizeMode.bind(this);
    this.mouseUpListener = this.deactivateResizeMode.bind(this);
    this.original.addEventListener('mousemove', this.mouseMoveListener);
    this.original.addEventListener('mouseout', this.mouseOutListener);
    this.original.addEventListener('mouseup', this.mouseUpListener);
  }
};

/**
 * Removes listeners that were set when mousedown was triggered on a node
 */
ImageShaver.prototype.deactivateResizeMode = function() {
  this.original.removeEventListener('mousemove', this.mouseMoveListener);
  this.original.removeEventListener('mouseout', this.mouseOutListener);
  this.original.removeEventListener('mouseup', this.mouseUpListener);
};

/**
 * Resizes the rectangle that represents the crop area
 */
ImageShaver.prototype.resizeCropArea = function() {

};
