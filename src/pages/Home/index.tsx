
import { useModel } from '@umijs/max';

import styles from './index.less';

const HomePage: React.FC = () => {
    const { name } = useModel('global');

    // --
    console.log(name, '<- global name');

    return (
        <div className={styles.container}>
            xxxx
        </div>
    );
};

export default HomePage;
