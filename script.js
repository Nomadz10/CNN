
const matrixValues = {
    option1: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
    option2: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
    option3: [[1/9, 1/9, 1/9], [1/9, 1/9, 1/9], [1/9, 1/9, 1/9]],
    option4: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
    option5: [[1/16, 2/16, 1/16], [2/16, 4/16, 2/16], [1/16, 2/16, 1/16]],
    option6: [[-1,-2,-1],[0,0,0],[1,2,1]],
    option7: [[-1,0,1],[-2,0,2],[-1,0,1]],
};

const selectElement = document.getElementById('options');
const matrixInputs = document.querySelectorAll('#convolution-matrix input');

selectElement.addEventListener('change', function() {
    const selectedOption = this.value;
    if (selectedOption in matrixValues) {
        const selectedMatrix = matrixValues[selectedOption];
        for (let i = 0; i < selectedMatrix.length; i++) {
            for (let j = 0; j < selectedMatrix[i].length; j++) {
                const inputElement = document.getElementById(`matrix-${i}-${j}`);
                inputElement.value = selectedMatrix[i][j];
            }
        }
    } else {
        for (let i = 0; i < matrixInputs.length; i++) {
            matrixInputs[i].value = '';
        }
    }
});




const iterationsInput = document.getElementById("iterations");
const convolveButton = document.getElementById("convolve-button");
const initialCanvas = document.getElementById("initial-canvas");
let inputImageData;

function convertToGrayscale(imageData) {
    let grayscaleMatrix = [];
    for (let i = 0; i < imageData.height; i++) {
        grayscaleMatrix[i] = [];
        for (let j = 0; j < imageData.width; j++) {
            let index = (i * 4) * imageData.width + (j * 4);
            let r = imageData.data[index];
            let g = imageData.data[index + 1];
            let b = imageData.data[index + 2];
            grayscaleMatrix[i][j] = 0.3 * r + 0.59 * g + 0.11 * b;
        }
    }
return grayscaleMatrix;
}



function convolution2D(largeMatrix, smallMatrix) {
    let result = [];
    for (let i = 0; i < largeMatrix.length - 2; i++) {
        result[i] = [];
        for (let j = 0; j < largeMatrix[i].length - 2; j++) {
            let sum = 0;
            for (let k = 0; k < 3; k++) {
                for (let l = 0; l < 3; l++) {
                    sum += (largeMatrix[i + k][j + l] * smallMatrix[k][l]);
                }
            }
            result[i][j] = sum;
            if (result[i][j] < 0) {
                result[i][j] *= -1;
            }
            if (result[i][j] > 255) {
                let added = sum / 255;
                result[i][j] = (sum % 255) + added;
            }

        }
    }
return result;
}

const inputImage = document.getElementById("input-image");
const canvas = document.createElement('canvas');
const w = 700;
const h = 800;
inputImage.addEventListener("change", function(event) {
    let canvasDiv = document.getElementById('output-canvas');
    canvasDiv.innerHTML = '';
    let reader = new FileReader();
    reader.onload = function(event) {
    let image = new Image();
    image.onload = function() {
        initialCanvas.width = image.width;
        initialCanvas.height = image.height;
        if (initialCanvas.width > w) {
            initialCanvas.height *= w / initialCanvas.width;
            initialCanvas.width = w;
        } else {
            if (initialCanvas.height > h) {
                initialCanvas.width *= h / initialCanvas.height;
                initialCanvas.height = h;
            }
        }
        canvas.width = initialCanvas.width;
        canvas.height = initialCanvas.height;
        let context = initialCanvas.getContext("2d");
        context.drawImage(image, 0, 0, initialCanvas.width, initialCanvas.height );
        inputImageData = context.getImageData(0, 0, initialCanvas.width, initialCanvas.height);

    };
    image.src = event.target.result;
};
reader.readAsDataURL(event.target.files[0]);
});


convolveButton.addEventListener("click", function(event) {
    event.preventDefault();
    if (!inputImageData) {
        return alert("Please select an image.");
    }

    //NUMBER OF ITERATIONS
    let iterations = parseInt(iterationsInput.value);
    //GETTING GRAYSCALED MATRIX
    let finMatrix = convertToGrayscale(inputImageData);

    //DEFAULT CONV MATRIX
    let convMatrix = [[-1,-1,-1],[-1,2,-1],[-1,-1,-1]]
    //GETTING THE CONVOLUTION MATRIX
    convMatrix[0][0] = parseFloat((document.getElementById("matrix-0-0")).value)
    convMatrix[0][1] = parseFloat((document.getElementById("matrix-0-1")).value)
    convMatrix[0][2] = parseFloat((document.getElementById("matrix-0-2")).value)
    convMatrix[1][0] = parseFloat((document.getElementById("matrix-1-0")).value)
    convMatrix[1][1] = parseFloat((document.getElementById("matrix-1-1")).value)
    convMatrix[1][2] = parseFloat((document.getElementById("matrix-1-2")).value)
    convMatrix[2][0] = parseFloat((document.getElementById("matrix-2-0")).value)
    convMatrix[2][1] = parseFloat((document.getElementById("matrix-2-1")).value)
    convMatrix[2][2] = parseFloat((document.getElementById("matrix-2-2")).value)
    //IF EMPTY MATRIX IS ENTERED THIS GIVES IDENTITY
    if (Number.isNaN(convMatrix[0][0])) {
        convMatrix = [[0,0,0],[0,1,0],[0,0,0]]
    }

    //ACTUAL CONVOLUTIONS HAPPENING
    for (let i = 0; i < iterations; i++) {
        //ADDING PADDING
        let size = finMatrix[0].length;
        const zerosArray = new Array(size).fill(0);
        finMatrix.unshift(zerosArray);
        finMatrix.push(zerosArray);
        finMatrix = finMatrix.map(row => [0,...row, 0]);
        console.log(finMatrix)
        finMatrix = convolution2D(finMatrix,convMatrix);
    }
    console.log(finMatrix)
    let canvas = document.createElement('canvas')
    let canvasDiv = document.getElementById('output-canvas');
    canvasDiv.innerHTML = '';
    canvas.width = finMatrix[0].length;
    canvas.height = finMatrix.length;
    canvasDiv.appendChild(canvas);


    let context = canvas.getContext('2d');
    let finImgData = context.createImageData(canvas.width, canvas.height)

    for (let y = 0; y < finMatrix.length; y++) {
        for (let x = 0; x < finMatrix[0].length; x++) {
            const index = 4 * (x + y * finMatrix[0].length);
            finImgData.data[index] = finMatrix[y][x];
            finImgData.data[index + 1] = finMatrix[y][x];
            finImgData.data[index + 2] = finMatrix[y][x];
            finImgData.data[index + 3] = 255;
        }
    }
    context.putImageData(finImgData, 0, 0);
});
const saveButton = document.getElementById("save-button");
saveButton.addEventListener("click", () => {
    const dataURL = canvas.toDataURL("image/png"); // convert canvas content to data URL
    const downloadLink = document.createElement("a"); // create a new download link
    downloadLink.href = dataURL; // set the href of the link to the data URL
    downloadLink.download = "matrix-image.png"; // set the download filename
    document.body.appendChild(downloadLink); // append the link to the document body
    downloadLink.click(); // simulate a click on the link to trigger the download
    document.body.removeChild(downloadLink); // remove the link from the document body
});