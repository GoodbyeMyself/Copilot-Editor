import { useModel } from '@umijs/max';

import Playground from './playground';

import { cn } from "@/lib/utils";

const HomePage: React.FC = () => {
    const { name } = useModel('global');

    // --
    console.log(name, '<- global name');

    return (
        <div className={cn(
            "home-container"
        )}>
            <Playground />
        </div>
    );
};

export default HomePage;
