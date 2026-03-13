import { YoutubeTranscript } from 'https://cdn.jsdelivr.net/npm/youtube-transcript@1.0.0/dist/index.min.js';

const apiKey = "YOUR_GEMINI_API_KEY"; // Replace with your API Key

function getVideoId(url) {
    const match = url.match(/v=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}

async function fetchTranscript(videoId) {
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        return transcript.map(t => t.text).join(' ');
    } catch (err) {
        return "Transcript not available for this video.";
    }
}

async function generateNotes() {
    const link = document.getElementById("ytlink").value;
    const videoId = getVideoId(link);
    if(!videoId) {
        document.getElementById("output").innerText = "Invalid YouTube link!";
        return;
    }

    document.getElementById("output").innerText = "Fetching transcript...";
    const transcript = await fetchTranscript(videoId);

    document.getElementById("output").innerText = "Generating notes...";

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta2/models/gemini-2.0-flash:generateText?key=${apiKey}`,
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                "prompt": `You are Yousif's NoteLab AI. Use ONLY the following transcript to create professional academic study notes. Do not add anything extra.\nTranscript:\n${transcript}\n\nFormat as:\n- Lecture Overview\n- Chapter-wise Notes\n- Key Terms Table\n- Self-Assessment Questions\n- Key Takeaways`,
                "temperature": 0.2,
                "maxOutputTokens": 2000
            })
        }
    );

    const data = await response.json();
    const notes = data.candidates && data.candidates[0] ? data.candidates[0].content : "Error generating notes.";
    document.getElementById("output").innerText = notes;
          }
