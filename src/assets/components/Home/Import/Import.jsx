import styles from './Import.module.css';
const Import = () => {
    return (
        <div className={styles.import}>
            <div className={styles['import-container']}>
                <div className={styles["import-texts"]}>
                    <h1 className={styles['import-title']}>Importar Nota Fiscal (XML)</h1>
                    <span className={styles['import-sub']}>Importe os arquivos XML recebidos de fornecedores para manter o controle atualizado de todas as notas fiscais.</span>
                </div>
                <button className={styles['import-button']}>Importar</button>
            </div>
        </div>
    );
}

export default Import;