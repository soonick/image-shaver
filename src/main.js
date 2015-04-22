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

  /**
   * Node that is being used to resize the crop area
   * @type {array}
   */
  this.resizeNode = null;

  /**
   * Index of the node that is being used to resize. 0 = top-left, 1: top-right,
   * 2: bottom-right, 3: bottom-left
   * @type {number}
   */
  this.resizeNodeIndex = null;

  /**
   * Array that represents the current state of the cropping rectangle.
   * [left, top, width, height]
   * @type {array}
   */
  this.cropRectangle = null;

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
 * Class we will add to the canvas when crop area is hovered
 * @type {string}
 */
ImageShaver.prototype.CROP_HOVERED_CLASS = 'shaver-crop-hovered';

/**
 * Destroys the contents of the shaver container and creates it again
 */
ImageShaver.prototype.createDom = function() {
  this.original = document.createElement('CANVAS');
  this.originalCtx = this.original.getContext('2d');
  this.preview = document.createElement('CANVAS');
  this.previewCtx = this.preview.getContext('2d');
  this.original.className = 'shaver-original';
  this.preview.className = 'shaver-preview';

  this.container.innerHTML = '';
  this.container.appendChild(this.original);
  this.container.appendChild(this.preview);

  // For canvas to correctly resize its contents you have to use width and
  // height attributes to specify its height
  this.original.setAttribute('height', this.original.clientHeight);
  this.original.setAttribute('width', this.original.clientWidth);
  this.preview.setAttribute('height', this.preview.clientHeight);
  this.preview.setAttribute('width', this.preview.clientWidth);

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
  image.onload = function() {
    this.drawHiddenImage();
    this.showCropRectangle();
  }.bind(this);
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
 * Updates preview picture with contents inside the crop rectangle
 */
ImageShaver.prototype.updatePreview = function() {
  this.previewCtx.drawImage(
    this.original,
    this.cropRectangle[0],
    this.cropRectangle[1],
    this.cropRectangle[2],
    this.cropRectangle[3],
    0,
    0,
    this.preview.width,
    this.preview.height
  );
};

/**
 * Shows crop rectangle on top of the original image. Crop rectangle will always
 * have the same ratio, but the user can move it around and resize it
 */
ImageShaver.prototype.showCropRectangle = function() {
  if (!this.cropRectangle) {
    this.cropRectangle = this.calculateLargestRectangle();
  }
  var rect = this.cropRectangle;
  this.updatePreview();
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
  this.original.addEventListener(
    'mousemove',
    this.handleMouseMove.bind(this)
  );
  this.original.addEventListener(
    'mousedown',
    this.activateMoveOrResizeMode.bind(this)
  );
};

/**
 * Handle mouse move
 * @param {object} e - event from mouse
 */
ImageShaver.prototype.handleMouseMove = function(e) {
  this.addCropAreaMoveClass(e);
  this.highlightHoveredNode(e);
};

/**
 * If mouse is over crop area add class to canvas
 * @param {object} e - mouse event
 */
ImageShaver.prototype.addCropAreaMoveClass = function(e) {
  if (this.isEventOnRectangle(e, this.cropRectangle)) {
    this.original.classList.add(this.CROP_HOVERED_CLASS);
  } else {
    this.original.classList.remove(this.CROP_HOVERED_CLASS);
  }
};

/**
 * Returns true if the given event was triggered on the given rectangle
 * @param {object} e - mouse event
 * @param {array} rect - [left, top, width, height]
 * @returns {boolean} true if event happened inside rectangle
 */
ImageShaver.prototype.isEventOnRectangle = function(e, rect) {
  if (e.offsetX >= rect[0] && e.offsetX <= (rect[0] + rect[2]) &&
      e.offsetY >= rect[1] && e.offsetY <= (rect[1] + rect[3])) {
    return true;
  } else {
    return false;
  }
};

/**
 * Returns a node if the given event was triggered on top of a node
 * @param {obejct} e - mouse event
 * @returns {array} node - Either an array representing a node, or undefined
 */
ImageShaver.prototype.isEventOnNode = function(e) {
  for (var i = 0; i < this.resizeNodes.length; i++) {
    if (this.isEventOnRectangle(e, this.resizeNodes[i])) {
      return this.resizeNodes[i];
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
    this.original.width = this.original.width;
    this.drawHiddenImage();
    this.showCropRectangle();
  }
};

/**
 * Activates move or resize mode depending on where the mousedown event was
 * triggered
 * @param {object} e - mousedown event
 */
ImageShaver.prototype.activateMoveOrResizeMode = function(e) {
  var activated = false;
  this.resizeNode = this.isEventOnNode(e);
  if (this.resizeNode) {
    activated = true;
    this.resizeNodeIndex = this.resizeNodes.indexOf(this.resizeNode);
    this.mouseMoveListener = this.resizeCropArea.bind(this);
  } else if (this.isEventOnRectangle(e, this.cropRectangle)) {
    activated = true;
    this.previousPosition = [e.offsetX, e.offsetY];
    this.mouseMoveListener = this.moveCropArea.bind(this);
  }

  if (activated) {
    this.mouseOutListener = this.deactivateMoveOrResizeMode.bind(this);
    this.mouseUpListener = this.deactivateMoveOrResizeMode.bind(this);
    this.original.addEventListener('mousemove', this.mouseMoveListener);
    this.original.addEventListener('mouseout', this.mouseOutListener);
    this.original.addEventListener('mouseup', this.mouseUpListener);
  }
};

ImageShaver.prototype.moveCropArea = function(e) {
  var newRect = [
    this.cropRectangle[0] - (this.previousPosition[0] - e.offsetX),
    this.cropRectangle[1] - (this.previousPosition[1] - e.offsetY),
    this.cropRectangle[2],
    this.cropRectangle[3]
  ];
  this.previousPosition = [e.offsetX, e.offsetY];

  this.cropRectangle = newRect;
  this.original.width = this.original.width;
  this.drawHiddenImage();
  this.showCropRectangle();
};

/**
 * Removes listeners that were set when mousedown was triggered on a node or in
 * the crop area
 */
ImageShaver.prototype.deactivateMoveOrResizeMode = function() {
  this.original.removeEventListener('mousemove', this.mouseMoveListener);
  this.original.removeEventListener('mouseout', this.mouseOutListener);
  this.original.removeEventListener('mouseup', this.mouseUpListener);
  this.resizeNode = null;
  this.previousPosition = null;
};

/**
 * Calculates the new size for the crop rectangle based on the new position for
 * a given corner.
 * @param {number} corner - 0 = top-left, 1: top-right, 2: bottom-right,
 *                  3: bottom-left
 * @param {array} newPos- Array containing new X and Y for given corner
 * @returns {array} Array with values for new crop rectangle:
 *                [left, top, width, height]
 */
ImageShaver.prototype.calculateCropRectangleSize = function(corner, newPos) {
  var ratio = this.options.ratio;

  var leftDif;
  var newLeft;
  var newTop;
  var newWidth;
  var newHeight;

  switch (corner) {
    case 0:
      leftDif = this.cropRectangle[0] - newPos[0];
      newLeft = newPos[0];
      newWidth = this.cropRectangle[2] + leftDif;
      newHeight = parseInt((newWidth * ratio[1]) / ratio[0], 10);
      newTop = this.cropRectangle[1] + (this.cropRectangle[3] - newHeight);
      break;
    case 3:
      leftDif = this.cropRectangle[0] - newPos[0];
      newLeft = newPos[0];
      newWidth = this.cropRectangle[2] + leftDif;
      newHeight = parseInt((newWidth * ratio[1]) / ratio[0], 10);
      newTop = this.cropRectangle[1];
      break;
    case 1:
      leftDif = (this.cropRectangle[0] + this.cropRectangle[2]) - newPos[0];
      newLeft = this.cropRectangle[0];
      newWidth = this.cropRectangle[2] - leftDif;
      newHeight = parseInt((newWidth * ratio[1]) / ratio[0], 10);
      newTop = this.cropRectangle[1] + (this.cropRectangle[3] - newHeight);
      break;
    case 2:
      leftDif = (this.cropRectangle[0] + this.cropRectangle[2]) - newPos[0];
      newLeft = this.cropRectangle[0];
      newWidth = this.cropRectangle[2] - leftDif;
      newHeight = parseInt((newWidth * ratio[1]) / ratio[0], 10);
      newTop = this.cropRectangle[1];
      break;
  }

  return [newLeft, newTop, newWidth, newHeight];
};

/**
 * Resizes the rectangle that represents the crop area
 * @param {object} e - mouse move event
 */
ImageShaver.prototype.resizeCropArea = function(e) {
  var newRect = this.calculateCropRectangleSize(
    this.resizeNodeIndex,
    [e.offsetX, e.offsetY]
  );

  this.original.width = this.original.width;
  this.drawHiddenImage();
  this.cropRectangle = newRect;
  this.showCropRectangle();
};
