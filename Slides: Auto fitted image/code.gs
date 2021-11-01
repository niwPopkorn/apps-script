function myFunction(docId,startSlide,endSlide) {
  var slides = SlidesApp.SlidesApp.openById(docId).getSlides();

  var targetSlides = slides.slice(startSlide,endSlide);
  
  //TO-DO
  //getPagesize and set to variable
  
  targetSlides.map(function (slide){
    var images = slide.getImages();
    image = images[0];
    image.setLeft(0).setTop(0).setWidth(720).setHeight(405);

  });
  
}

// require Slides advanced service
function getPageSize(docId){
  var slides = Slides.Presentations.get(docId);
  return slides.pageSize;
}
