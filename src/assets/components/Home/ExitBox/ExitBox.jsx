import styles from './ExitBox.module.css';
const ExitBox = () => {
    const value = 190 //pegar do backend;

    return (
        <div className={styles.box}>
            <div className={styles['box-container']}>
                <div className={styles['box-label']}>
                    <img className={'box-icon'} src="/public/images/exit-box-icon.svg" alt="" />
                    <span className={styles['box-title']}>Saída de itens</span>
                </div>

                <div className={styles['box-value']}>{value}</div>
            </div>
        </div>
    );
}

export default ExitBox;