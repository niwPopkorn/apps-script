//To-do
//deploy as add-on

function onOpen(e) {
  SlidesApp.getUi()
      .createAddonMenu()
      .addItem('Fit image', 'main')
      .addItem('About', 'showAbout')
      .addToUi();
}

function main(){
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
  var pageSize = getPageSize(docId);
  
  pageRange.map(function (slide){
    var images = slide.getImages();
    image = images[0];
    
    var imgWidth = image.getWidth();
    var imgHeight = image.getHeight();

    if(imgWidth > imgHeight){
      console.log('run full width');
      var targetWidth = convertEMUtoPt(pageSize.width.magnitude);
      var targetHeight = targetWidth*imgHeight/imgWidth;
      image.setLeft(0).setWidth(targetWidth).setHeight(targetHeight).alignOnPage(SlidesApp.AlignmentPosition.CENTER); 
    }else{
      console.log('run full height');
      var targetHeight = convertEMUtoPt(pageSize.height.magnitude);
      var targetWidth = targetHeight*imgWidth/imgHeight;
      image.setTop(0).setHeight(targetHeight).setWidth(targetWidth).alignOnPage(SlidesApp.AlignmentPosition.CENTER);
    }
  });
}

// require Slides advanced service
function getPageSize(docId){
  var slides = Slides.Presentations.get(docId);
  return slides.pageSize;
}

function convertEMUtoPt(emu){
  return emu/12700;
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
