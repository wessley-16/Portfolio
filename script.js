let slideIndex = 1;
      showSlides(slideIndex);

      // Next/previous controls
      function plusSlides(n) {
        showSlides(slideIndex += n);
      }

      // Thumbnail image controls
      function currentSlide(n) {
        showSlides(slideIndex = n);
      }

      function showSlides(n) {
        let i;
        let slides = document.getElementsByClassName("mySlides");
        let dots = document.getElementsByClassName("demo");
        let captionText = document.getElementById("caption");
        if (n > slides.length) {slideIndex = 1}
        if (n < 1) {slideIndex = slides.length}
        for (i = 0; i < slides.length; i++) {
          slides[i].style.display = "none";
        }
        for (i = 0; i < dots.length; i++) {
          dots[i].className = dots[i].className.replace(" active", "");
        }
        slides[slideIndex-1].style.display = "block";
        dots[slideIndex-1].className += " active";
      }

      // SCIA slideshow (isolated) -------------------------------------------------
      let slideIndex2 = 1;
      showSlides2(slideIndex2);

      function plusSlides2(n) {
        showSlides2(slideIndex2 += n);
      }

      function currentSlide2(n) {
        showSlides2(slideIndex2 = n);
      }

      function showSlides2(n) {
        let i;
        let slides = document.getElementsByClassName("mySlides2");
        let dots = document.getElementsByClassName("demo2");
        let captionText = document.getElementById("caption2");
        if (n > slides.length) {slideIndex2 = 1}
        if (n < 1) {slideIndex2 = slides.length}
        for (i = 0; i < slides.length; i++) {
          slides[i].style.display = "none";
        }
        for (i = 0; i < dots.length; i++) {
          dots[i].className = dots[i].className.replace(" active", "");
        }
        if(slides.length){
          slides[slideIndex2-1].style.display = "block";
        }
        if(dots.length){
          dots[slideIndex2-1].className += " active";
        }
      }

      (function(){
        var y = new Date().getFullYear();
        var el = document.getElementById('year');
        if(el) el.textContent = y;
      })();