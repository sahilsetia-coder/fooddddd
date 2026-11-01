// Add your NEW Gemini API key here.
// Do not use the previously exposed key.
const API_KEY = "AQ.Ab8RN6KpIxVb1FGeQoty5JPy7P9aMibHyTyXiKK9WIAnI9hPDg";

const MODEL = "gemini-2.5-flash";

const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const analyzeBtn = document.getElementById("analyzeBtn");
const result = document.getElementById("result");
const loading = document.getElementById("loading");

let selectedImage = null;


// Image upload
imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image.");
        return;
    }

    selectedImage = file;

    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";

    result.textContent = "Image uploaded successfully.";

});


// Convert image to Base64
function convertToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result.split(",")[1]);
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);

    });

}


// Analyze food
analyzeBtn.addEventListener("click", async function () {

    if (!selectedImage) {
        alert("Please upload an image first.");
        return;
    }

    if (!API_KEY || API_KEY === "YOUR_NEW_GEMINI_API_KEY") {
        alert("Please add your Gemini API key in script.js.");
        return;
    }

    loading.style.display = "block";
    analyzeBtn.disabled = true;

    result.textContent = "";

    try {

        const base64Image = await convertToBase64(selectedImage);

        const prompt = `
        Analyze this fruit or vegetable image.

        Identify:
        1. Food name
        2. Freshness condition
        3. Visible spoilage signs
        4. Possible reasons
        5. Recommendation

        Classify as Fresh, Spoiled, or Uncertain.

        Do not invent visual signs.

        If the image is unclear or does not show food,
        return Uncertain.

        Explain that image analysis cannot guarantee food safety.

        Return the result in this format:

        Food Name:
        Condition:
        Visible Spoilage Signs:
        Possible Reason:
        Recommendation:
        `;


        const response = await fetch(

            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,

            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": API_KEY
                },

                body: JSON.stringify({

                    contents: [{
                        parts: [
                            {
                                text: prompt
                            },
                            {
                                inline_data: {
                                    mime_type: selectedImage.type,
                                    data: base64Image
                                }
                            }
                        ]
                    }],

                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 700
                    }

                })

            }

        );


        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error?.message || "API request failed"
            );
        }

        const answer =
            data.candidates?.[0]?.content?.parts
                ?.map(part => part.text || "")
                .join("\n");

        if (!answer) {
            throw new Error("No result received from Gemini.");
        }

        result.textContent = answer;

    }

    catch (error) {

        result.textContent = "Error: " + error.message;

    }

    finally {

        loading.style.display = "none";
        analyzeBtn.disabled = false;

    }

});
