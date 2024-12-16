const images = import.meta.glob('../assets/**/*.{png,jpg,jpeg,svg,mp4,pdf}', { eager: true });

console.log(images); // Log the keys to see the paths Vite generates

export default images;
