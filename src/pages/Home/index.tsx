import { useModel } from '@umijs/max';

import Playground from '@/components/playground';

import { SessionProvider } from '@/context/session/provider';

import { EditorProvider } from '@/context/editor/provider';

import { EditorSettingsProvider } from '@/context/editor-settings/provider';

import { DbProvider } from '@/context/db/provider';

import { QueryProvider } from '@/context/query/provider';

import { cn } from "@/lib/utils";

const HomePage: React.FC = () => {
    const { name } = useModel('global');

    // --
    console.log(name, '<- global name');

    return (
        <div className={cn(
            "home-container"
        )}>
            <SessionProvider>
                <DbProvider>
                    <QueryProvider>
                        <EditorProvider>
                            <EditorSettingsProvider>
                                <Playground />
                            </EditorSettingsProvider>
                        </EditorProvider>
                    </QueryProvider>
                </DbProvider>
            </SessionProvider>
        </div>
    );
};

export default HomePage;
