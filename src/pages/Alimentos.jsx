import React, { useEffect, useState } from "react";
import style from "./Alimentos.module.css";

const Alimentos = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("https://codcoz-api-postgres.koyeb.app/produto/listar/estoque/3")
            .then((response) => response.json())
            .then((data) => {
                setProducts(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Erro ao buscar produtos:", error);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Carregando...</p>;

    console.log(products)
    return (
        <div className={style["table-container"]}>
            <table className={style['custom-table']}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Código EAN</th>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>Quantidade</th>
                        <th>Marca</th>
                        <th>Validade</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.codigoEan}</td>
                            <td>{p.nome}</td>
                            <td>{p.descricao}</td>
                            <td>{p.quantidade}</td>
                            <td>{p.marca}</td>
                            <td>{p.validade}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    );
};

export default Alimentos;