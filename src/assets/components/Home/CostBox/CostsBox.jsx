import styles from './CostsBox.module.css';
const CostsBox = () => {
    const value = 240 //pegar do backend;

    return (
        <div className={styles.box}>
            <div className={styles['box-container']}>
                <div className={styles['box-label']}>
                    <img className={'box-icon'} src="/public/images/costs-box-icon.svg" alt="" />
                    <span className={styles['box-title']}>Custo total</span>
                </div>

                <div className={styles['box-value']}>{value}</div>
            </div>
        </div>
    );
}

export default CostsBox;