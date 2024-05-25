import { createWorker, PSM } from 'tesseract.js';

export async function extractTxtFromImg(imgBuffer: Buffer) {
    const worker = await createWorker('ind');
    await worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO,
    });

    const resp = await worker.recognize(imgBuffer);
    await worker.terminate();

    return resp.data.text;
}