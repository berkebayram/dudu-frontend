'use client';

import { Pixelify_Sans } from "next/font/google";
import bg from "../public/bg.png";
import character from "../public/character.png";
import { useRef, useState } from "react";
import axios from "axios";

const pixelMono = Pixelify_Sans({
    subsets: ["latin"],
});

export default function Home() {
    const backendUrl = "http://154.53.160.194:3002";

    const [code, setCode] = useState("");
    const [siteState, setSiteState] = useState("upload");
    const [file, setFile] = useState(null);
    const [imgUrl, setImgUrl] = useState(null);

    const [progress, setProgress] = useState(0);

    const onNewUploadWanted = () => {
        setImgUrl("");
        setFile(null);
        setSiteState("upload");
    }

    const onUploadClicked = async () => {
        if (!file)
            return;
        const formData = new FormData();
        formData.append('image', file);

        try {
            setSiteState('progress');
            setProgress(0);

            const res = await axios.post(backendUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                    setSiteState(progress);
                },
            });

            setCode(res.data);
            setSiteState('success');
            setProgress(100);
        } catch (err) {
            console.log(err);
            setSiteState('upload');
            setFile(null);
            setImgUrl('');
            setProgress(0);
        }
    }

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <div style={{
                width: "100vw",
                height: '100vh',
                backgroundImage: `url(${bg.src})`,
                backgroundSize: "cover",
                position: "absolute",
                zIndex: 1,
            }}></div>
            <div style={{
                width: 600,
                height: 600,
                backgroundImage: `url(${character.src})`,
                backgroundSize: "cover",
                left: 50,
                position: "absolute",
                zIndex: 1,
            }}></div>
            <main className="flex flex-col row-start-2 items-center sm:items-start z-10">
                <div className="bg-[#ffffff] rounded-2xl flex flex-col p-6">
                    <div className="text-4xl text-black justify-center flex flex-1 mt-2">
                        <p className={pixelMono.className}>KAHVE YUKLE</p>
                    </div>
                    <div className=" text-black justify-center flex flex-1 pt-8 ">
                        {siteState === "success" && <ShowUploaded code={code} onNewUploadWanted={onNewUploadWanted} />}
                        {siteState === "upload" && <UploadScreen imgUrl={imgUrl} setImgUrl={setImgUrl} setFile={setFile} onUploadRequest={onUploadClicked} />}
                        {siteState === "progress" && <UploadingProgress uploadingProgress={progress} />}
                    </div>
                </div>
            </main>
        </div>
    );
}


const ShowUploaded = ({ code, onNewUploadWanted }) => {
    const unsecuredCopyToClipboard = (text) => { const textArea = document.createElement("textarea"); textArea.value = text; document.body.appendChild(textArea); textArea.focus(); textArea.select(); try { document.execCommand('copy') } catch (err) { console.error('Unable to copy to clipboard', err) } document.body.removeChild(textArea) };

    /**
     * Copies the text passed as param to the system clipboard
     * Check if using HTTPS and navigator.clipboard is available
     * Then uses standard clipboard API, otherwise uses fallback
    */
    const copyToClipboard = (content) => {
        if (window.isSecureContext && navigator.clipboard) {
            navigator.clipboard.writeText(content);
        } else {
            unsecuredCopyToClipboard(content);
        }
    };

    return (
        <div className="text-2xl">
            <div className="flex flex-row align-middle justify-center justify-items-center">
                <p className={pixelMono.className}>{code}</p>
                <button className="flex justify-center bg-orange-500 px-2  rounded text-white text-xl ml-4" onClick={() => {
                    copyToClipboard(code);
                }}>
                    <p className={pixelMono.className}>KOPYALA</p>
                </button>
            </div>

            <button className="flex justify-center bg-orange-500 p-2 mt-4 mx-20 rounded text-white text-xl" onClick={onNewUploadWanted}>
                <p className={pixelMono.className}>YENI FAL YUKLE</p>
            </button>
        </div>
    )
}

const UploadingProgress = ({ progress }) => {
    return (
        <div className="text-2xl">
            <p className={pixelMono.className}>FAL YUKLENIYOR {progress}%</p>
        </div>
    )
}

const UploadScreen = ({ setFile, setImgUrl, imgUrl, onUploadRequest }) => {
    const inputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files) {
            const selected = e.target.files[0];
            setFile(selected);
            setImgUrl(URL.createObjectURL(selected ? selected : ""));
        }
        else {
            setImgUrl("");
        }
    }

    return (
        <div className="flex flex-1 flex-col">
            <input ref={inputRef} type="file" accept="image/png" className="absolute hidden" onChange={handleFileChange} />
            {imgUrl
                && (<div className="flex justify-center ">
                    <div style={{
                        width: 300,
                        borderRadius: 4,
                        height: 300,
                        backgroundImage: `url(${imgUrl})`,
                        backgroundSize: "cover",
                    }}></div>
                </div>)
            }
            <button className="flex justify-center bg-orange-500 p-2 mx-20 my-4 rounded text-white text-xl" onClick={() => {
                inputRef.current?.click();
            }}>
                <p className={pixelMono.className}>RESIM SEC</p>
            </button>

            {imgUrl && (
                <button className="flex justify-center bg-orange-500 p-2 mx-20 rounded text-white text-xl" onClick={() => onUploadRequest()}>
                    <p className={pixelMono.className}>YUKLE</p>
                </button>
            )}
        </div>
    )
}
