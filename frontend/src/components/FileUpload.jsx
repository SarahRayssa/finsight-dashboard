import axios from "axios";
import { useState } from "react";


export default function Upload() {
const [file, setFile] = useState();


const send = async () => {
const fd = new FormData();
fd.append("file", file);
await axios.post("http://localhost:4000/upload", fd);
alert("Arquivo enviado e processado!");
};


return (
<div className="mb-6">
<input type="file" onChange={(e) => setFile(e.target.files[0])} />
<button onClick={send} className="ml-2 bg-[#2563EB] px-3 py-2 rounded">
Enviar
</button>
</div>
);
}