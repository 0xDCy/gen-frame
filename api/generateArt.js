export default function(req, res) {
    // Generate two random colors
    const colors = [
        [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)],
        [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]
    ];

    // Respond with the generated colors in JSON format
    res.json({ colors });
}
