<template>
  <div class="color-picker-large">
    <div class="options" v-if="!isOptionOpen">
      <div class="option" @click="openImgOption">
        <div class="img photos-img"></div>
        <div class="title">Photos</div>
      </div>
      <div class="option" @click="openColorOption">
        <div class="img colors-img"></div>
        <div class="title">Colors</div>
      </div>
    </div>

    <button v-if="isOptionOpen" @click="backToOptions" class="add-btn">Back</button>
    <div class="options-bgc" v-if="isOptionColorOpen">
      <div
        class="bgc"
        v-for="color in colors"
        :key="color"
        :style="{backgroundColor: color}"
        @click="setBgc('color',color)"
      ></div>
    </div>

    <div class="options-bgc" v-if="isOptionImgOpen">
      <div
        class="bgc"
        v-for="img in imgs"
        :key="img"
        :style="{ 'background-image': 'url(' + img + ')' }"
        @click="setBgc('url', img)"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      colors: [
        "rgb(0, 121, 191)",
        "rgb(0, 174, 204)",
        "rgb(174, 212, 255)",
        "rgb(137, 96, 158)",
        "rgb(221, 170, 255)",
        "rgb(255, 198, 198)",
        "rgb(205, 90, 145)",
        "rgb(176, 70, 50)",
        "rgb(210, 144, 52)",
        "rgb(254, 255, 174)",
        "rgb(81, 152, 57)",
        "rgb(75, 191, 107)",
        "rgb(183, 255, 174)",
        "rgb(131, 140, 145)",
        "#ebecf0",
        "#111"
      ],
      imgs: [
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585210331/bgc/1.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585210935/bgc/2.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585210885/bgc/3.webp",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585210885/bgc/4.webp",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585210885/bgc/5.webp",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211744/bgc/6.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211748/bgc/7.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211764/bgc/9.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211772/bgc/10.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211796/bgc/11.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211804/bgc/12.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211804/bgc/13.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211814/bgc/14.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211819/bgc/15.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211840/bgc/16.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211860/bgc/17.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211868/bgc/18.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211874/bgc/20.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211877/bgc/21.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211889/bgc/22.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211894/bgc/23.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211903/bgc/25.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211904/bgc/26.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211914/bgc/27.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211929/bgc/28.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211933/bgc/29.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211954/bgc/30.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211970/bgc/31.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211972/bgc/32.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585211979/bgc/33.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585212001/bgc/34.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585212004/bgc/35.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585215368/bgc/36.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585215369/bgc/37.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585215374/bgc/38.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585215375/bgc/39.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585215376/bgc/40.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585215381/bgc/41.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585215383/bgc/42.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585215387/bgc/43.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585215390/bgc/44.jpg",
        "https://res.cloudinary.com/dgmwynlbw/image/upload/v1585215393/bgc/45.jpg"
      ],
      isOptionOpen: false,
      isOptionColorOpen: false,
      isOptionImgOpen: false,
      currBgc: null
    };
  },
  methods: {
    openColorOption() {
      this.isOptionOpen = true;
      this.isOptionColorOpen = true;
      this.isOptionImgOpen = false;
    },
    openImgOption() {
      this.isOptionOpen = true;
      this.isOptionColorOpen = false;
      this.isOptionImgOpen = true;
    },
    backToOptions() {
      this.isOptionOpen = false;
      this.isOptionColorOpen = false;
      this.isOptionImgOpen = false;
    },
    setBgc(type, value) {
      this.currBgc = {
        color: "",
        url: ""
      };
      this.currBgc[type] = value;
      this.$emit("set-bgc", this.currBgc);
    }
  }
};
</script>