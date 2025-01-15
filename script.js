const get_data_btn = document.getElementById("get-data");
const inputImg = document.getElementById("input-img-url");
const formContainer = document.getElementById('form-container');
const imgPreview = document.getElementById("img-preview");
const ocrMainEl = document.getElementById("ocr-main");

get_data_btn.addEventListener("click", async () => {
    get_data_btn.classList.add("loadingBtn");
    get_data_btn.innerHTML = "Getting data.."
    get_data_btn.disabled = true;
    try {
        console.log(inputImg.value);
        if (!inputImg.value) {
            alert("Please provide a valid image url!");
            get_data_btn.disabled = false;
            get_data_btn.classList.remove("loadingBtn");
            get_data_btn.innerHTML = "Get data";
            return;
        }

        const rawDataFromGoogleAi = await getDataFromGoogleVisionAi(inputImg.value);

        console.log("rawDataFromGoogleAi: ", rawDataFromGoogleAi.extracted_data);

        if (!rawDataFromGoogleAi.extracted_data) {
            alert("There's no extracted_data from google vision ai");
            return;
        }

        const extractedRawDataFromGoogleAi = rawDataFromGoogleAi.extracted_data;

        const rawDataFromGemini = await getDataFromGemini(extractedRawDataFromGoogleAi);

        console.log("rawDataFromGemini: ", rawDataFromGemini);

        if (!rawDataFromGemini) {
            alert("There's no raw data from gemini");
            return;
        }

        const rawTextFromGemini = rawDataFromGemini.candidates[0].content.parts[0].text;

        const cleanedTextFromGemini = rawTextFromGemini.replace(/```json\n|```/g, '');

        const cleanedTextToJson = JSON.parse(cleanedTextFromGemini);

        populateExtractedData(cleanedTextToJson);

        console.log("cleanedTextToJson: ", cleanedTextToJson);

        get_data_btn.disabled = false;
        get_data_btn.classList.remove("loadingBtn");
        get_data_btn.innerHTML = "Get data";
    } catch (error) {
        console.error(error);
        alert(error.message);
        get_data_btn.disabled = false;
        get_data_btn.classList.remove("loadingBtn");
        get_data_btn.innerHTML = "Get data";
    }
})

/**
 * 
 * @param {*} url Type "String" Image url 
 * @returns It returns all the text fields from the image.
 */

async function getDataFromGoogleVisionAi(url) {

    if (!url) {
        alert("Please provide a valid image url!")
        return;
    }

    let image_uri = {
        "image_uri": url
    }

    try {
        console.log("Getting image data...")
        const response = await fetch("https://6711-43-231-237-194.ngrok-free.app/api/google_vision_text", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(image_uri)
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error:", error);
    }
}

/**
 * 
 * @param {*} data This is the data we get from google vision ai. 
 * @returns It returns a organized data based on our needs from gemini api.
 */

async function getDataFromGemini(data) {
    let extracted_data = {
        "extracted_data": data
    }

    try {
        console.log("Getting Organized data...")
        const response = await fetch("https://6711-43-231-237-194.ngrok-free.app/api/gemini_text", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(extracted_data)
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error:", error);
    }
}

/**
 * 
 * @param {*} data This is the extracted_data in json we got from gemini ai
 * @returns It will return HTML file to show all data fields 
 */

function populateExtractedData(data) {
    const extractedDataContainer = document.createElement("div");
    extractedDataContainer.classList.add("extracted-data-container");

    ocrMainEl.appendChild(extractedDataContainer);

    extractedDataContainer.innerHTML = `
            <div key="data-name" class="data-item">
                <span class="extracted-data-title">Name: </span>
                <span class="extracted-data-value">${data.Name}</span>
            </div>
            <div key="data-designation" class="data-item">
                <span class="extracted-data-title">Designation: </span>
                <span class="extracted-data-value">${data.Designation}</span>
            </div>
            <div key="data-company-name" class="data-item">
                <span class="extracted-data-title">CompanyName: </span>
                <span class="extracted-data-value">${data.CompanyName}</span>
            </div>
            <div key="data-address" class="data-item">
                <span class="extracted-data-title">Address: </span>
                <span class="extracted-data-value">${data.Address}</span>
            </div>
            <div key="data-telephone" class="data-item">
                <span class="extracted-data-title">Telephone: </span>
                <span class="extracted-data-value">${data.Telephone}</span>
            </div>
            <div key="data-mobile" class="data-item">
                <span class="extracted-data-title">Mobile: </span>
                <span class="extracted-data-value">${data.Mobile}</span>
            </div>
            <div key="data-email" class="data-item">
                <span class="extracted-data-title">Email: </span>
                <span class="extracted-data-value">${data.Email}</span>
            </div>
            <div key="data-website-url" class="data-item">
                <span class="extracted-data-title">WebsiteURL: </span>
                <span class="extracted-data-value">${data.WebsiteURL}</span>
            </div>
    `;
}