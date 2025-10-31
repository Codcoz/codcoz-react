import styles from './ProfileBanner.module.css';
const ProfileBanner = () => {

    const profileInitial = sessionStorage.getItem("userEmail")[0].toUpperCase();
    const name = "xxxxxxx"; //syncar com banco depois
    const mail = sessionStorage.getItem("userEmail");
    const userID = "xxxxxxx"; //syncar com banco depois

    return (
        <div className={styles.profile}>

            <div className={styles['left-container']}>
                <div className={styles['profile-picture']}>
                    <span>{profileInitial}</span>
                </div>

                <div className={styles.props}>
                    <div className={styles.prop}>
                        <p className={styles.title}> {name} </p>
                        <p className={styles.sub}> {mail} </p>
                    </div>

                    <div className={styles.line}></div>

                    <div className={styles.prop}>
                        <p className={styles.title}>Função</p>
                        <p className={styles.sub}>Gestor</p>
                    </div>

                    <div className={styles.line}></div>

                    <div className={styles.prop}>
                        <p className={styles.title}>ID usuário</p>
                        <p className={styles.sub}> {userID} </p>
                    </div>


                </div>
            </div>

            <div className={styles['right-container']}>
                <button className={styles['ver-mais-button']}>Ver mais</button>
            </div>
        </div>
    )
}

export default ProfileBanner;