//To-do
//get page range instead of specified page index https://developers.google.com/apps-script/reference/slides/selection#getPageRange()

function main(){
  var docId = 'xxx';
  var startSlide = 72;
  var endSlide = 74;

  processSlides(docId,startSlide,endSlide);

}

function processSlides(docId,startSlide,endSlide) {
  var slides = SlidesApp.openById(docId).getSlides();

  var targetSlides = slides.slice(startSlide,endSlide);
  
  //TO-DO
  var pageSize = getPageSize(docId);

  //getPagesize and set to variable
  
  targetSlides.map(function (slide){
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
