import React, { useRef, useState } from 'react';
import { optimizeImage, fileToBase64 } from '../src/features/core/utils/imageOptimizer';

interface ImageUploadProps {
    currentImage?: string;
    onImageSelected: (base64: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ currentImage, onImageSelected }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | undefined>(currentImage);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Otimização padrão com WebP
            const optimizedFile = await optimizeImage(file, {
                maxWidth: 400,
                maxHeight: 400,
                quality: 0.6,
                mimeType: 'image/webp'
            });

            // Converter para Base64 pois o backend antigo pode exigir
            const base64 = await fileToBase64(optimizedFile);
            setPreview(base64);
            onImageSelected(base64);
        } catch (error) {
            console.error("Erro na otimização de imagem padrão:", error);
        }
    };

    return (
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {preview ? (
                <img
                    src={preview}
                    alt="Foto do Apoiador"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-xl transition-transform group-hover:scale-105"
                />
            ) : (
                <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-xl flex flex-col items-center justify-center gap-1 transition-transform group-hover:scale-105">
                    <span className="material-symbols-outlined text-slate-400 text-5xl">person</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Sem Foto</span>
                </div>
            )}
            <div className="absolute inset-0 bg-navy-dark/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
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
