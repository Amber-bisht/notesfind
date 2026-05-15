/**
 * Custom Image Service Client
 * Connects to the own-hosted Bun Image Server
 */

const IMAGE_SERVER_URL = process.env.IMAGE_SERVER_URL || 'http://localhost:4000';
const IMAGE_SERVER_SECRET = process.env.IMAGE_SERVER_SECRET;

export const uploadImage = async (file: File): Promise<string> => {
    if (!IMAGE_SERVER_SECRET) {
        throw new Error('IMAGE_SERVER_SECRET is not configured');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${IMAGE_SERVER_URL}/upload`, {
        method: 'POST',
        headers: {
            'x-api-key': IMAGE_SERVER_SECRET,
        },
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image to custom server');
    }

    // The Bun server returns { success: true, url: "..." }
    return data.url;
};
