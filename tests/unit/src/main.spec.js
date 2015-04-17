describe('imageShaver', function() {
  beforeEach(function() {
    var container = document.createElement('DIV');
    this.instance = new ImageShaver(container);
    document.body.appendChild(this.instance.container);
    this.instance.container.innerHTML = '<p>Im text</p>';
  });

  afterEach(function() {
    document.body.removeChild(this.instance.container);
  });

  describe('createDom', function() {
    it('destroys the contents of the container and creates shaver and preview', function() {
      this.instance.createDom();

      var expected = '<div class="shaver-original"></div>' +
          '<div class="shaver-preview"></div>';
      proclaim.equal(expected, this.instance.container.innerHTML);
    });

    it('saves reference to original and preview', function() {
      this.instance.createDom();

      var c = this.instance.container;
      var expectedOriginal = c.getElementsByClassName('shaver-original')[0];
      var expectedPreview = c.getElementsByClassName('shaver-preview')[0];

      proclaim.equal(expectedOriginal, this.instance.original);
      proclaim.equal(expectedPreview, this.instance.preview);
    });
  });

  describe('showOriginalImage', function() {
    it('shows given image inside original container', function() {
      var url = '/base/tests/unit/fixtures/img/img.png';
      this.instance.showOriginalImage(url);

      var expected = '<img src="' + url + '">';
      proclaim.equal(expected, this.instance.original.innerHTML);
    });

    it('does not try to load image if no url was given', function() {
      this.instance.showOriginalImage();

      proclaim.equal('', this.instance.original.innerHTML);
    });
  });
});
