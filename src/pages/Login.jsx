// src/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export default function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, senha);

            // salva o email no sessionStorage
            sessionStorage.setItem("userEmail", userCred.user.email);

            // notifica o App.jsx que o usuário logou
            if (onLogin) onLogin(userCred.user.email);
            window.location.reload();
            console.log("Logado:", userCred.user.email);
        } catch (err) {
            setErro("Erro ao fazer login: " + err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
                required
            />
            <input
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha"
                type="password"
                required
            />
            <button type="submit">Entrar</button>
            {erro && <p style={{ color: "red" }}>{erro}</p>}
        </form>
    );
}
