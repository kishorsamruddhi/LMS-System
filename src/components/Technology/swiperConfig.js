import { FreeMode, Navigation, EffectCards } from "swiper/modules";

export const moduleCardsConfig = {
  spaceBetween: 10,
  slidesPerView: 1.5,
  freeMode: true,
  navigation: {
    nextEl: "#sub_next",
    prevEl: "#sub_prev",
  },
  modules: [Navigation, FreeMode],
  breakpoints: {
    640: {
      slidesPerView: 1.5,
      spaceBetween: 10,
    },
    768: {
      slidesPerView: 3.5,
      spaceBetween: 10,
    },
    1024: {
      slidesPerView: 4.5,
      spaceBetween: 20,
    },
    1400: {
      slidesPerView: 5.5,
    },
  },
};

export const coursesCardConfig = {
  effect: "cards",
  grabCursor: true,
  initialSlide: 0,
  speed: 500,
  loop: true,
  rotate: true,
  mousewheel: {
    invert: false,
  },
  modules: [EffectCards, Navigation],
  navigation: {
    nextEl: "#next",
    prevEl: "#prev",
  },
};
