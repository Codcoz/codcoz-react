import styles from './ImportsBox.module.css';
const ImportsBox = () => {
    const value = 3 //pegar do backend;

    return (
        <div className={styles.box}>
            <div className={styles['box-container']}>

                <div className={styles['box-label']}>
                    <img className={'box-icon'} src="/public/images/import-box-icon.svg" alt="" />
                    <span className={styles['box-title']}>Importações</span>
                </div>

                <div className={styles['box-value']}>{value}</div>
            </div>
        </div>
    );
}

export default ImportsBox;