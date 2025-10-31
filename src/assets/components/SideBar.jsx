import { useState } from 'react';
import styles from './SideBar.module.css'

const items = [
    { key: 'home', label: 'Home', icon: '/images/home-icon.svg' },
    { key: 'colaboradores', label: 'Colaboradores', icon: '/images/colaborators-icon.svg' },
    { key: 'tarefas', label: 'Tarefas', icon: '/images/tasks-icon.svg' },
    { key: 'alimentos', label: 'Alimentos', icon: '/images/aliments-icon.svg' },
    { key: 'gastronomia', label: 'Gastronomia', icon: '/images/gastronomy-icon.svg' },
    { key: 'xml', label: 'Entrada de XML', icon: '/images/import-icon.svg' },
    { key: 'relatórios', label: 'Relatórios', icon: '/images/stock-icon.svg' },
]

const SideBar = ({ onNavigate }) => {
    // track which item index is active; default to 0 (first item)
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className={styles.sidebar}>
            {items.map((it, i) => (
                <div
                    key={it.key}
                    className={styles.item}
                    role="button"
                    tabIndex={0}
                    onClick={() => { setActiveIndex(i); if (onNavigate) onNavigate(it.key); console.log(styles.sidebar) }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setActiveIndex(i); if (onNavigate) onNavigate(it.key); } }}
                >
                    <div className={i === activeIndex ? styles.active : styles.inactive}>
                        <img src={it.icon} alt={it.label} />
                    </div>
                    <p>{it.label}</p>
                </div>
            ))
            }
        </div >
    )
}

export default SideBar;