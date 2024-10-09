new Vue({
  el: "#app",
  data: {
    canvas: null,
    image: null,
    brightness: 100,
    rotation: 0,
    isGreyscale: false,
    isInverted: false,
    isControlsPanelOpen: false,
  },
  mounted() {
    this.initializeCanvas();
  },
  methods: {
    initializeCanvas() {
      this.canvas = new fabric.Canvas("canvas");
      this.resizeCanvas();
      window.addEventListener("resize", this.resizeCanvas);
    },
    resizeCanvas() {
      const container = this.canvas.wrapperEl.parentNode;
      const ratio = window.devicePixelRatio;
      this.canvas.setDimensions({
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
      this.canvas.setZoom(ratio);
      if (this.image) {
        this.fitImageToCanvas();
      }
    },
    onFileChange(e) {
      const file = e.target.files[0];
      this.fileName = file.name.split(".").slice(0, -1).join(".");
      if (file) {
        const fileSizeMb = file.size / (1024 * 1024);
        if (fileSizeMb > 1) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Ukuran gambar maksimal adalah 1MB",
          });
          return;
        }
        const reader = new FileReader();
        reader.onload = (f) => {
          fabric.Image.fromURL(f.target.result, (img) => {
            this.canvas.clear();
            this.image = img;
            this.canvas.add(img);
            this.fitImageToCanvas();
            this.canvas.renderAll();
            this.image.filters = [];
            this.brightness = 100;
            this.rotation = 0;
            this.isGreyscale = false;
            this.isInverted = false;
          });
        };

        reader.readAsDataURL(file);
      }
    },
    fitImageToCanvas() {
      if (!this.image) return;
      const canvasWidth = this.canvas.getWidth();
      const canvasHeight = this.canvas.getHeight();
      const imgRatio = this.image.width / this.image.height;
      const canvasRatio = canvasWidth / canvasHeight;
      let scaleFactor;

      if (imgRatio > canvasRatio) {
        scaleFactor = (canvasWidth * 0.5) / this.image.width;
      } else {
        scaleFactor = (canvasHeight * 0.5) / this.image.height;
      }

      this.image.scale(scaleFactor);
      this.image.set({
        left: canvasWidth * 0.35,
        top: canvasHeight * 0.35,
        originX: "center",
        originY: "center",
      });
      this.canvas.renderAll();
    },
    applyBrightness() {
      if (!this.image) return;
      this.image.filters = this.image.filters.filter(
        (filter) => !(filter instanceof fabric.Image.filters.Brightness)
      );
      this.image.filters.push(
        new fabric.Image.filters.Brightness({
          brightness: (this.brightness - 100) / 100,
        })
      );
      this.image.applyFilters();
      this.canvas.renderAll();
    },
    applyRotation() {
      if (!this.image) return;
      this.image.rotate(this.rotation);
      this.canvas.renderAll();
    },
    applyFlip(direction) {
      if (!this.image) return;
      if (direction === "horizontal") {
        this.image.set("flipX", !this.image.flipX);
      } else {
        this.image.set("flipY", !this.image.flipY);
      }
      this.canvas.renderAll();
    },
    applyGreyscale() {
      if (!this.image) return;
      this.image.filters = this.image.filters.filter(
        (filter) => !(filter instanceof fabric.Image.filters.Grayscale)
      );
      if (this.isGreyscale) {
        this.image.filters.push(new fabric.Image.filters.Grayscale());
      }
      this.image.applyFilters();
      this.canvas.renderAll();
    },
    applyInvert() {
      if (!this.image) return;
      this.image.filters = this.image.filters.filter(
        (filter) => !(filter instanceof fabric.Image.filters.Invert)
      );
      if (this.isInverted) {
        this.image.filters.push(new fabric.Image.filters.Invert());
      }
      this.image.applyFilters();
      this.canvas.renderAll();
    },
    resetImage() {
      if (!this.image) return;
      this.image.filters = [];
      this.image.set({
        flipX: false,
        flipY: false,
        angle: 0,
        opacity: 1,
      });
      this.brightness = 100;
      this.rotation = 0;
      this.isGreyscale = false;
      this.isInverted = false;
      this.fitImageToCanvas();
      this.image.applyFilters();
      this.canvas.renderAll();
    },
    downloadImage() {
      if (!this.image) return;

      // Create a new canvas with only the image
      const tempCanvas = new fabric.Canvas(document.createElement("canvas"));
      tempCanvas.setDimensions({
        width: this.canvas.getWidth(),
        height: this.canvas.getHeight(),
      });

      // Clone the image with all its properties
      const clonedImage = fabric.util.object.clone(this.image);
      clonedImage.set({
        left: tempCanvas.width * 0.5,
        top: tempCanvas.height * 0.5,
        originX: "center",
        originY: "center",
        scaleX: 0.35,
        scaleY: 0.35,
      });

      // Add the cloned image to the temporary canvas
      tempCanvas.add(clonedImage);
      tempCanvas.renderAll();

      // Convert the canvas to a data URL
      const dataURL = tempCanvas.toDataURL({
        format: "png",
        quality: 1,
      });

      // Create and trigger the download
      const link = document.createElement("a");
      link.download = `${this.fileName}-edit.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      tempCanvas.dispose();
    },
    toggleControlsPanel() {
      this.isControlsPanelOpen = !this.isControlsPanelOpen;
    },
  },
});
