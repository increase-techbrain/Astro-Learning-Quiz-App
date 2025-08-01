/*window.addEventListener("load", () => {
  const elements = document.querySelectorAll(".slide-in");
  elements.forEach(el => {
    el.classList.add("show");
  });
});

function scrollToSection() {
  alert("This would scroll or navigate to another section.");
}*/

window.addEventListener("load", () => {
  const elements = document.querySelectorAll(".animate");
  elements.forEach(el => el.classList.add("show"));
});

let currentSlide = 0;
const slides = document.querySelectorAll(".slide");

function showNextSlide() {
  slides[currentSlide].classList.remove("show");
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].classList.add("show");
}

setInterval(showNextSlide, 3000); // every 4 seconds

