import { createCanvas, Image } from 'canvas';
import GIFEncoder from 'gifencoder';
import { decode } from 'base64-arraybuffer';

export default async function(req, res) {
    // Ensure the request is a POST request
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { frames } = req.body;
        const encoder = new GIFEncoder(600, 600); // Assuming fixed canvas size, adjust as needed
        encoder.start();
        encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
        encoder.setDelay(100); // Frame delay in milliseconds
        encoder.setQuality(10); // Image quality. 1 - 30

        const canvas = createCanvas(600, 600);
        const ctx = canvas.getContext('2d');

        for (const frame of frames) {
            const img = new Image();
            img.src = decode(frame.split(',')[1]); // Decode base64 to ArrayBuffer and set as source
            
            await new Promise((resolve) => {
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                    encoder.addFrame(ctx);
                    resolve();
                };
            });
        }

        encoder.finish();

        const buffer = encoder.out.getData(); // Get GIF binary data
        res.setHeader('Content-Type', 'image/gif');
        res.send(buffer);
    } catch (error) {
        console.error('Failed to generate GIF:', error);
        res.status(500).json({ error: 'Failed to generate GIF' });
    }
}
