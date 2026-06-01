import axios from 'axios';
const SERP_API_KEY = "1b95936cad36a631f65641107670464ada508c9632be71250421689eeb382cbc";
const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png";

async function run() {
    try {
        const params = {
            engine: "google_lens",
            url: imageUrl,
            api_key: SERP_API_KEY
        }
        console.log("Trying lens with url")
        let r = await axios.get("https://serpapi.com/search", { params })
        if (r.data.error) console.log("error:", r.data.error)
        else console.log("Lens visual matches:", (r.data.visual_matches || []).length)
    } catch(e) { console.log(e.response ? e.response.data : e.message) }

    try {
        const params = {
            engine: "google_reverse_image",
            image_url: imageUrl,
            api_key: SERP_API_KEY
        }
        console.log("Trying rev with image_url")
        let r = await axios.get("https://serpapi.com/search", { params })
        if (r.data.error) console.log("error:", r.data.error)
        else {
            console.log("Rev image matches:", (r.data.image_results || []).length)
            console.log("Rev pages matching:", (r.data.pages_with_matching_images || []).length)
        }
    } catch(e) { console.log(e.response ? e.response.data : e.message) }
}
run();
