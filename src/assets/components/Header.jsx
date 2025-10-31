import styles from './Header.module.css'
const Header = () => {
  return (
    <div className={styles.header}>
      <div className={styles['left-container']}>
        <div className={styles['logo-container']}>
          <img src="/public/images/c_codcoz.svg" alt="logo" />
        </div>
        <div className={styles['search-bar']}>
          <img src="/public/images/search-icon.svg" alt="logo" />
          <p className={styles['search-text']}>Pesquisar</p>
        </div>
      </div>

      <div className={styles['right-container']}>
        <img src="/public/images/settings-icon.svg" alt="logo" />
        <div className={styles['profile-view']}>B</div>
      </div>
    </div>
  )
}

export default Header