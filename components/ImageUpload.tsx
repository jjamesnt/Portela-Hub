import React, { useRef, useState } from 'react';

interface ImageUploadProps {
    currentImage?: string;
    onImageSelected: (base64: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ currentImage, onImageSelected }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | undefined>(currentImage);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // Redimensionar para no máximo 800px de largura
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.8); // Qualidade 80%
                setPreview(optimizedBase64);
                onImageSelected(optimizedBase64);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img
                src={preview || 'https://via.placeholder.com/150'}
                alt="Avatar do Assessor"
                className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-lg transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
            </div>
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />
        </div>
    );
};

export default ImageUpload;
