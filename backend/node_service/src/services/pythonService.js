import axios from 'axios';
import FormData from 'form-data';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:5001';

export const uploadToPythonService = async (fileBuffer, originalname, mimetype) => {
    try {
        const formData = new FormData();
        formData.append('image', fileBuffer, {
            filename: originalname,
            contentType: mimetype,
        });

        const response = await axios.post(`${PYTHON_SERVICE_URL}/upload`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            timeout: 600000,
        });

        return response.data;
    } catch (error) {
        console.error('Error connecting to Python service (/upload):', error.message);
        throw error;
    }
};

/**
 * Sends a search image and a list of links to Python for similarity verification.
 */
export const analyzeSimilarities = async (fileBuffer, originalname, mimetype, links) => {
    console.log(`[Python Service] Forwarding ${links.length} links for deep analysis...`);
    try {
        const formData = new FormData();
        formData.append('image', fileBuffer, {
            filename: originalname,
            contentType: mimetype,
        });
        formData.append('links', JSON.stringify(links));

        const response = await axios.post(`${PYTHON_SERVICE_URL}/analyze`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
            timeout: 45000, // 45 second timeout for deep scan to allow fast fallback
        });

        return response.data;
    } catch (error) {
        console.error('❌ [Python Service] Analysis connection error:', error.message);
        throw error;
    }
};

export const sendNoticeThroughPython = async (noticeData) => {
    try {
        const response = await axios.post(`${PYTHON_SERVICE_URL}/send-notice`, noticeData);
        return response.data;
    } catch (error) {
        console.error('Error connecting to Python service (/send-notice):', error.message);
        throw error;
    }
};
