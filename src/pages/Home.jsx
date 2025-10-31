import styles from './Home.module.css';
import ProfileBanner from '../assets/components/Home/ProfileBanner/ProfileBanner.jsx';
import Import from '../assets/components/Home/Import/Import.jsx';
import Recents from '../assets/components/Home/Recents/Recents.jsx';
import Links from '../assets/components/Home/Links/Links.jsx';
import NextTasks from '../assets/components/Home/NextTasks/NextTasks.jsx';
import EntryBox from '../assets/components/Home/EntryBox/EntryBox.jsx';
import ExitBox from '../assets/components/Home/ExitBox/ExitBox.jsx';
import ImportsBox from '../assets/components/Home/ImportsBox/ImportsBox.jsx';
import CostsBox from '../assets/components/Home/CostBox/CostsBox.jsx';

const Home = () => {
    return (
        <div className={styles['home-container']}>

            <ProfileBanner />

            <div className={styles['main-container']}>
                <div className={styles['left-container']}>

                    <div className={styles.blocks}>
                        <EntryBox />
                        <ExitBox />
                        <ImportsBox />
                        <CostsBox />
                    </div>

                    <Import />
                    <Recents />

                </div>

                <div className={styles['right-container']}>
                    <NextTasks />
                    <Links />
                </div>
            </div>
        </div>
    )
}

export default Home;

{/*
    nigga
1648 107
66 margin left from the blue box
41 margin bottom of the container

left-container

w243 h168
gap 16 entre os 4 obj

h gap = 32 entre todos os obj


import obj

w1018 h210

w1018 h291



right-container
w611 h243
    */}