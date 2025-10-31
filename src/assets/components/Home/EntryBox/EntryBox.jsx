import styles from './EntryBox.module.css';
const EntryBox = () => {

    const value = 240 //pegar do backend;

    return (
        <div className={styles.box}>
            <div className={styles['box-container']}>
                <div className={styles['box-label']}>
                    <img className={styles['box-icon']} src="/public/images/entry-box-icon.svg" alt="" />
                    <span className={styles['box-title']}>Entrada de itens</span>
                </div>

                <div className={styles['box-value']}>{value}</div>
            </div>
        </div>
    );
}

export default EntryBox;