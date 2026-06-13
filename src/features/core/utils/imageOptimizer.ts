export interface OptimizeImageOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    mimeType?: string;
}

/**
 * Otimiza uma imagem no client-side utilizando a Canvas API.
 * Redimensiona e comprime a imagem para reduzir o payload antes de uploads.
 */
export const optimizeImage = async (file: File, options: OptimizeImageOptions = {}): Promise<File> => {
    const {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 0.8,
        mimeType = 'image/webp' // Padrão moderno, leve e suportado na web
    } = options;

    // Se o arquivo já não for uma imagem (ex: PDF ou documento), retorna como está
    if (!file.type.startsWith('image/')) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                try {
                    let { width, height } = img;

                    // Calcula o aspecto e reduz se necessário
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        return reject(new Error('Falha ao obter contexto do canvas para otimização de imagem.'));
                    }

                    // Fundo branco caso haja transparência e o destino seja JPEG
                    if (mimeType === 'image/jpeg') {
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, width, height);
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            // Converte de volta para File com a extensão ajustada
                            const newFileName = file.name.replace(/\.[^/.]+$/, "") + (mimeType === 'image/webp' ? '.webp' : '.jpg');
                            const optimizedFile = new File([blob], newFileName, {
                                type: mimeType,
                                lastModified: Date.now()
                            });
                            resolve(optimizedFile);
                        } else {
                            reject(new Error('A conversão do Canvas para Blob falhou.'));
                        }
                    }, mimeType, quality);

                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => reject(new Error('Falha ao carregar a imagem para o otimizador.'));
            img.src = e.target?.result as string;
        };

        reader.onerror = () => reject(new Error('Falha na leitura do arquivo original.'));
        reader.readAsDataURL(file);
    });
};

/**
 * Converte um objeto File ou Blob para Base64 string.
 */
export const fileToBase64 = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};
