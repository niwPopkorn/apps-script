//To-do
//deploy as add-on

function onOpen(e) {
  SlidesApp.getUi()
      .createAddonMenu()
      .addItem('All slide', 'allSlide')
      .addItem('Selected slide', 'selectedSlide')
      .addItem('About', 'showAbout')
      .addToUi();
}

/**
 * Runs when the add-on is installed.
 *
 * @param {object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE).
 */
function onInstall(e) {
  onOpen(e);
}

function allSlide(){
  var slide = SlidesApp.getActivePresentation();
  var docId = slide.getId();
  
  var slides = slide.getSlides();

  processSlides(docId,slides);
}

function selectedSlide(){
  var slide = SlidesApp.getActivePresentation();
  var docId = slide.getId();
  var selection = slide.getSelection();
  var selectionType = selection.getSelectionType();
  if (selectionType == SlidesApp.SelectionType.PAGE) {
    var pageRange = selection.getPageRange();
    processSlides(docId,pageRange.getPages());
  }
}

function processSlides(docId,pageRange) {
  var slide = SlidesApp.getActivePresentation();
  // var pageSize = getPageSize(docId);
  
  pageRange.map(function (page){
    var images = page.getImages();
    image = images[0];
    
    var imgWidth = image.getWidth();
    var imgHeight = image.getHeight();

    if(imgWidth > imgHeight){
      console.log('run full width');
      var targetWidth = slide.getPageWidth();
      var targetHeight = targetWidth*imgHeight/imgWidth;
      image.setLeft(0).setWidth(targetWidth).setHeight(targetHeight).alignOnPage(SlidesApp.AlignmentPosition.CENTER); 
    }else{
      console.log('run full height');
      var targetHeight = slide.getPageHeight();
      var targetWidth = targetHeight*imgWidth/imgHeight;
      image.setTop(0).setHeight(targetHeight).setWidth(targetWidth).alignOnPage(SlidesApp.AlignmentPosition.CENTER);
    }
  });
}

/**
 * Opens a purely-informational dialog in the form explaining details about
 * this add-on.
 */
function showAbout() {
  var ui = HtmlService.createHtmlOutputFromFile('about')
      .setWidth(420)
      .setHeight(270);
  SlidesApp.getUi().showModalDialog(ui, 'About Auto Fitted Image');
}
