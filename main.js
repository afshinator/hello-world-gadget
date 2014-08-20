(function(){
  /* global VersalPlayerAPI, ChallengesIframeApi */

  // Declare a gadget class.
  var Gadget = function(options) {
    // versal interface which fires most events
    //   https://github.com/Versal/player-api
    this.vi = new VersalPlayerAPI();

    // the main DOM element used in the gadget
    //   - to be used as the container element for the gadget
    this.el = options.el;

    // the selected word which displays the `chosenWord` attribute
    this.wordEl = this.el.querySelector('span.adjective');

    // the gadget's configuration:
    //  - consistent for anyone viewing each instance of this gadget
    this.config = {
      chosenColor: 'green',
      chosenWord: 'green'
    };

    // Internal state of the gadget. Only authors can edit gadgets
    //   - When editing, config can be changed by the author
    this.isEditable = false;

    // State of the gadget, unique to the gadget instance AND each specific learner using the gadget
    this.learnerState = {
      isBold: false
    };

    this.initialize();
  };

  // Configure the property sheet after attaching gadget.
  //   - these attributes will be accessible through
  //   - the property sheet that displays on the gear icon
  //     - Only when player recognizes gadget as editable
  Gadget.prototype.setupPropertySheet = function() {
    // set up a property sheet for word and color selection.
    this.vi.setPropertySheetAttributes({
      chosenColor: { type: 'Color' },
      chosenWord: { type: 'Text' }
    });
  };

  // Initialize: before the gadget is attached to the lesson's DOM.
  Gadget.prototype.initialize = function() {
    // listen to events
    this.vi.on('editableChanged', this.editableChanged.bind(this));
    this.vi.on('attributesChanged', this.attributesChanged.bind(this));
    this.vi.on('learnerStateChanged', this.learnerStateChanged.bind(this));

    this.setupPropertySheet();

    // Tell Versal the gadget is ready to begin communicating
    //  - this will trigger the initial events for the gagdet
    this.vi.startListening();

    // add click listener to toggle bold font.
    this.wordEl.onclick = this.toggleBoldWord.bind(this);

    // set up a callback for asset uploads
    this.vi.on('assetSelected', function(assetData){
      var assetUrl = this.vi.assetUrl(assetData.asset.representations[0].id);

      //change local image
      this.setImagePath({
        url: assetUrl
      });

      //persist
      this.vi.setAttributes({
        chosenImage : {
          url: assetUrl,
          assetObj: assetData
        }
      });
    }.bind(this));

    // add click listener to upload new asset.
    this.el.querySelector('.button-upload-image').onclick = this.requestUpload.bind(this);

    // set gadget height.
    this.vi.setHeight(600);

    //watch body height and adjust gadget height accordingly
    // - Note that this will use document.body.offsetHeight to calculate the gadget's height
    this.vi.watchBodyHeight();
  };

  Gadget.prototype.requestUpload = function() {
    this.vi.requestAsset({
      type: 'image'
    });
  };

  Gadget.prototype.editableChanged = function(jsonData) {
    this.isEditable = jsonData.editable;

    // some elements have class 'authoring-only' and need to be hidden when we are in non-editable mode.
    // use css to hide those elements
    // IE10+
    if(this.isEditable) {
      this.el.classList.add('editable');
    } else {
      this.el.classList.remove('editable');
    }
  };


  Gadget.prototype.attributesChanged = function(jsonData) {
    // we expect to receive some subset of the attributes:
    //   'chosenColor', 'chosenWord', 'chosenImage'.
    if (jsonData.chosenColor) {
      this.config.chosenColor = jsonData.chosenColor;
      this.wordEl.setAttribute('style', 'color: ' + this.config.chosenColor);
    }
    if (jsonData.chosenWord) {
      this.config.chosenWord = jsonData.chosenWord;
      this.wordEl.innerHTML = this.config.chosenWord;
    }
    if (jsonData.chosenImage) {
      this.config.asset = jsonData.chosenImage;
      this.setImagePath(jsonData.chosenImage);
    }

  };

  Gadget.prototype.learnerStateChanged = function(jsonData) {
    if (jsonData && jsonData.isBold) {
      this.learnerState.isBold = jsonData.isBold;
      this.updateBoldWord();
    }
  };

  Gadget.prototype.setImagePath = function(jsonData) {
    var imageUrl = jsonData.url;
    // Set the image src attribute to this url.
    this.el.querySelector('.sample-image').setAttribute('src', imageUrl);
  };

  Gadget.prototype.updateBoldWord = function() {
    if (this.learnerState.isBold) {
      this.el.classList.add('bold');
    } else {
      this.el.classList.remove('bold');
    }
  };

  Gadget.prototype.toggleBoldWord = function() {
    this.learnerState.isBold = !this.learnerState.isBold;

    this.vi.setLearnerState({
      isBold: this.learnerState.isBold
    });

    this.updateBoldWord();
  };

  /*
   * END GADGET FUNCTIONS
   */


  /*
   * Challenges API
   */
  var challengesApi = new ChallengesIframeApi(function(response){
    document.querySelector('.response').textContent = (response.scoring.totalScore || 0);
  });

  var challenges = [
    {
      prompt: 'What is the color of the sky?',
      answers: 'blue',
      scoring: 'strict'
    }
  ];

  // Set Challenges to default
  challengesApi.setChallenges(challenges);

  document.querySelector('.prompt').textContent = challenges[0].prompt;
  document.querySelector('.submit-challenge').addEventListener('click', function(){
    challengesApi.scoreChallenges( [document.querySelector('.my-text-area').value] );
  });



  // Instantiate the gadget, passing it the DOM element
  new Gadget({ el: document.querySelector('body') });

  // This gadget instance will remain active because it has added itself as a listener to the window.

})();
