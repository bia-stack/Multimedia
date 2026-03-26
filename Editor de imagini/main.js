    'use strict';

    let originalImage = null;

    const canvas = document.getElementById("visibleCanvas");
    const context = canvas.getContext("2d");

    const blue = document.getElementById("blue");
    const fileBrowser = document.getElementById("fileBrowser");

    const reseteaza = document.getElementById("reseteaza");

    const grayscale = document.getElementById("grayscale");

    const sepia = document.getElementById("sepia");
    
    const negative = document.getElementById("negative");
    
    const download = document.getElementById("download");

    const pixelate = document.getElementById("pixelate");

    const colorBox = document.getElementById("colorBox");
    const colorValue = document.getElementById("colorValue");


    fileBrowser.addEventListener("change", function (e) {
        const reader = new FileReader();

        reader.addEventListener("load", function (e) {
            const dataUrl = e.target.result;
            const img = document.createElement("img");

            img.addEventListener("load", function () {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                context.drawImage(img, 0, 0);

                originalImage = context.getImageData(0, 0, canvas.width, canvas.height);
                blue.disabled = false;
                reseteaza.disabled = false;
                grayscale.disabled = false;
                sepia.disabled = false;
                negative.disabled = false;
                download.disabled = false;
                pixelate.disabled = false;
            });

            img.src = dataUrl;
        });

        reader.readAsDataURL(e.target.files[0]);
    });

    blue.addEventListener("click", function () {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i]     = 0; 
            data[i + 1] = 0; 
     
        }

        context.putImageData(imageData, 0, 0);
    });

    
  
    


    reseteaza.addEventListener("click", function (){
        if (originalImage){
            context.putImageData(originalImage, 0, 0);
        }
    });


    grayscale.addEventListener("click" , function (){
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
           const r = data[i];
           const g = data[i+2];
           const b = data[i+2];

           const y = 0.2126 * r + 0.7152 * g + 0.0722 * b; 

            data[i] = data[i+1] = data[i+2] = y;
        }
        context.putImageData(imageData, 0, 0);
    });

    sepia.addEventListener("click", function () {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
           const r = data[i];
           const g = data[i+2];
           const b = data[i+2];

           let rosu = Math.min(0.393 * r + 0.769 * g + 0.189 * b,255);
           let verde = Math.min(0.349 * r + 0.686 * g + 0.168 * b,255);
           let albastru = Math.min(0.272 * r + 0.534 * g + 0.131 * b,255);
            
           data[i] = rosu;
           data[i+1] = verde;
           data[i+2] = albastru;
        }
        context.putImageData(imageData, 0, 0);
    });

    negative.addEventListener("click", function () {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
           const r = data[i];
           const g = data[i+1];
           const b = data[i+2];

           let rd = 255 - r;
           let gn = 255 - g;
           let bl = 255 - b;

           data[i] = rd;
           data[i+1] = gn;
           data[i+2] = bl;
        }
        context.putImageData(imageData, 0, 0);
    });

    download.addEventListener("click", function (){
        const link = document.createElement("a");
        link.download = "Untitled";
        link.href = canvas.toDataURL("image/jpg");
        link.click();
    });

    const slider = document.querySelector("input[type='range']");
    const counter = document.querySelector("span");
    
    slider.addEventListener("input", function() {
        counter.textContent = slider.value;
    
        if (!originalImage) return;
    
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const origData = originalImage.data;
    
        const factor = slider.value / 100;
    
        for (let i = 0; i < data.length; i += 4) {
           data[i]     = Math.min(255, origData[i] * factor);
           data[i + 1] = Math.min(255, origData[i + 1] * factor);
           data[i + 2] = Math.min(255, origData[i + 2] * factor);
        }
    
    context.putImageData(imageData, 0, 0);
});

pixelate.addEventListener("click", function() {
    const blocksize = 8;
    
    for (let x = 0; x < canvas.width; x += blocksize) {
        for (let y = 0; y < canvas.height; y += blocksize) {
            const pixel = context.getImageData(x, y, 1, 1).data;
            context.fillStyle = "rgb(" + pixel[0] + "," + pixel[1] + "," + pixel[2] + ")";
            context.fillRect(x, y, blocksize, blocksize);
        }
    }
});

canvas.addEventListener("mousemove", function(e){
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    const pixel = context.getImageData(x, y, 1, 1).data;
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];

    colorBox.style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";
    colorValue.textContent = "RGB(" + r + "," + g + "," + b + ")";
});

        
    

    