import { editor } from 'monaco-editor';
/**
 * 本模块：基于 Monaco Editor 构建自定义右键上下文子菜单功能。
 *
 * 设计思路：
 * 1) 通过 editor.addAction 注册一组 action；
 * 2) 从默认的 EditorContext 菜单中“拿走”这些 action 的菜单项；
 * 3) 创建一个自定义子菜单（MenuId），将上述菜单项塞入该子菜单；
 * 4) 再把子菜单挂回 EditorContext，使其以分组和排序的形式呈现。
 *
 * 风险与注意：此实现依赖 Monaco 的内部 API（如 MenuRegistry._menuItems、LinkedList 的内部字段），
 * 在 Monaco 升级时可能失效或行为变化，升级需回归验证。
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { LinkedList } from 'monaco-editor/esm/vs/base/common/linkedList';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { MenuId, MenuRegistry } from 'monaco-editor/esm/vs/platform/actions/common/actions';

/**
 * 从指定链表中移除并返回 command.id 匹配的菜单项。
 *
 * 说明：依赖 LinkedList 的内部结构（_first、_remove、node.next）。
 * @param items  菜单链表（如 EditorContext 对应的 _menuItems 列表）
 * @param id     需要匹配的 command id（editor 支持的 action id）
 * @returns      若找到则返回该菜单元素；未找到返回 undefined
 */
function popItem(items: LinkedList, id: string): any {
    let node: any = items._first;
    do {
        if (node.element?.command?.id === id) {
            items._remove(node);
            return node.element;
        }
        node = node.next;
    } while (node !== undefined);
}

// function removeAllMenus() {
//     /**
//      * 清空 EditorContext 下的所有菜单项。
//      * 警告：会移除编辑器默认菜单，通常只在完全自定义菜单或调试时使用。
//      */
//     const contextMenuEntry = MenuRegistry._menuItems.get(MenuId.EditorContext);
//     let node: any = contextMenuEntry._first;
//     do {
//         if (node.element) {
//             contextMenuEntry._remove(node);
//         }
//         node = node.next;
//     } while (node !== undefined);
// }

/**
 * 将一组 actions 注册到编辑器，并用子菜单进行分组展示。
 *
 * 流程：
 * - 先注册 action（editor.addAction）；
 * - 在 supported actions 中获取最终 action id；
 * - 从默认 EditorContext 菜单中“弹出”对应菜单项，
 * - 推入我们新建的子菜单的 LinkedList；
 * - 最后把子菜单自身挂到 EditorContext 中（控制 group 与 order）。
 */
const addActionWithSubmenus = (
    editor: editor.IStandaloneCodeEditor,
    descriptor: {
        id: string;
        title: string;
        // context: string;
        contextMenuGroupId: string;
        contextMenuOrder: number;
        actions: { run: (editor: editor.IStandaloneCodeEditor) => void; label: string; id: string }[];
    }
) => {
    // 为子菜单创建唯一的 MenuId，并准备其承载项的链表结构
    const submenu = new MenuId(descriptor.contextMenuGroupId);
    const list = new LinkedList();
    MenuRegistry._menuItems.set(submenu, list);

    for (let i = 0; i < descriptor.actions.length; i++) {
        const action = descriptor.actions[i];
        // 1) 注册 action 到编辑器，使其成为可支持的操作
        editor.addAction({
            id: action.id,
            label: action.label,
            run: action.run,
            contextMenuOrder: descriptor.contextMenuOrder,
            contextMenuGroupId: descriptor.contextMenuGroupId,
        });
        // 2) 获取运行时的实际 action id（通常会附带前缀，这里使用末尾匹配）
        const actionId = editor
            .getSupportedActions()
            .find(a => a.label === action.label && a.id.endsWith(action.id))!.id;

        // 3) 从默认 EditorContext 菜单中弹出该 action 对应菜单项，塞到子菜单链表
        const items = MenuRegistry._menuItems.get(MenuId.EditorContext) as LinkedList;
        const item = popItem(items, actionId);
        if (item) {
            list.push(item);
        }
    }

    // 4) 将子菜单挂载到 EditorContext，使其以分组、排序的方式展示在右键菜单中
    MenuRegistry._menuItems.get(MenuId.EditorContext).push({
        group: descriptor.contextMenuGroupId,
        order: descriptor.contextMenuOrder,
        submenu: submenu,
        title: descriptor.title,
    });
};

/**
 * 初始化并增强传入编辑器实例的上下文菜单。
 * 集成所有编辑器功能到统一的右键菜单系统中。
 */
export const setupContextMenuFeature = (
    editor: editor.IStandaloneCodeEditor,
    options: {
        copolitRef?: React.RefObject<any>;
    } = {}
) => {
    const { copolitRef } = options;
    
    // removeAllMenus(); // 若需彻底移除默认菜单，仅保留自定义菜单，可启用此行（谨慎使用）

    // 基础编辑功能子菜单
    addActionWithSubmenus(editor, {
        id: 'EditorActions',
        title: '编辑操作',
        contextMenuGroupId: '0_EditorActions',
        contextMenuOrder: 0,
        actions: [
            {
                id: 'convert-to-lowercase',
                label: '转换关键字为小写',
                run: (editor) => {
                    const selection = editor.getSelection();
                    if (!selection || selection.isEmpty()) return;
                    const value = editor.getModel()?.getValueInRange(selection);
                    if (!value) return;
                    editor.executeEdits("", [
                        {
                            range: selection,
                            text: value.toLowerCase(),
                            forceMoveMarkers: true,
                        },
                    ]);
                },
            },
            {
                id: 'convert-to-uppercase',
                label: '转换关键字为大写',
                run: (editor) => {
                    const selection = editor.getSelection();
                    if (!selection || selection.isEmpty()) return;
                    const value = editor.getModel()?.getValueInRange(selection);
                    if (!value) return;
                    editor.executeEdits("", [
                        {
                            range: selection,
                            text: value.toUpperCase(),
                            forceMoveMarkers: true,
                        },
                    ]);
                },
            },
            {
                id: 'Generate-annotations',
                label: '生成注释',
                run: (editor) => {
                    const selection = editor.getSelection();
                    if (!selection || selection.isEmpty()) return;

                    const selectedText = editor.getModel()?.getValueInRange(selection);
                    if (!selectedText) return;

                    // 生成随机注释
                    const randomComment = '随机注释';

                    // 在选中文本前插入注释
                    const commentText = `-- ${randomComment}\n${selectedText}`;

                    editor.executeEdits("", [
                        {
                            range: selection,
                            text: commentText,
                            forceMoveMarkers: true,
                        },
                    ]);
                },
            },
        ],
    });

    // SQL 执行功能子菜单
    addActionWithSubmenus(editor, {
        id: 'SQLExecution',
        title: 'SQL 执行',
        contextMenuGroupId: '1_SQLExecution',
        contextMenuOrder: 1,
        actions: [
            {
                id: 'validate-selection',
                label: '校验选择',
                run: async (editor) => {
                    const selection = editor.getSelection();
                    const value =
                        selection?.isEmpty() || selection === null
                            ? editor.getValue()
                            : editor.getModel()?.getValueInRange(selection);
                    if (!value) return;
                    // --- 校验选择 ---
                    console.log(value, '<- 打印 校验选择');
                },
            },
            {
                id: 'run-selection',
                label: '运行选择',
                run: (editor) => {
                    const selection = editor.getSelection();
                    const value =
                        selection?.isEmpty() || selection === null
                            ? editor.getValue()
                            : editor.getModel()?.getValueInRange(selection);
                    if (!value) return;
                    // --- 运行选择 ---
                    console.log(value, '<- 打印 运行选择');
                },
            },
        ],
    });

    // Copilot AI 功能子菜单
    addActionWithSubmenus(editor, {
        id: 'Copolit',
        title: 'Copolit AI',
        contextMenuGroupId: '2_Copolit',
        contextMenuOrder: 2,
        actions: [
            {
                id: 'Generate-SQL',
                label: 'SQL 生成',
                run: (editor) => {
                    const selection = editor.getSelection();
                    const selectedText =
                        selection?.isEmpty() || selection === null
                            ? editor.getValue()
                            : editor.getModel()?.getValueInRange(selection);

                    if (copolitRef?.current?.isCollapsed()) {
                        copolitRef.current?.expand();
                        copolitRef.current?.resize(20);
                    }

                    const event = new CustomEvent("copolit-text-selected", {
                        detail: { text: selectedText, action: "generate-sql" },
                    });
                    window.dispatchEvent(event);
                },
            },
            {
                id: 'SQL-Error-Correction',
                label: 'SQL 纠错',
                run: (editor) => {
                    const selection = editor.getSelection();
                    const selectedText =
                        selection?.isEmpty() || selection === null
                            ? editor.getValue()
                            : editor.getModel()?.getValueInRange(selection);

                    if (copolitRef?.current?.isCollapsed()) {
                        copolitRef.current?.expand();
                        copolitRef.current?.resize(20);
                    }

                    const event = new CustomEvent("copolit-text-selected", {
                        detail: { text: selectedText, action: "sql-error-correction" },
                    });
                    window.dispatchEvent(event);
                },
            },
            {
                id: 'SQL-Rewriting',
                label: 'SQL 改写',
                run: (editor) => {
                    const selection = editor.getSelection();
                    const selectedText =
                        selection?.isEmpty() || selection === null
                            ? editor.getValue()
                            : editor.getModel()?.getValueInRange(selection);

                    if (copolitRef?.current?.isCollapsed()) {
                        copolitRef.current?.expand();
                        copolitRef.current?.resize(20);
                    }

                    const event = new CustomEvent("copolit-text-selected", {
                        detail: { text: selectedText, action: "sql-rewriting" },
                    });
                    window.dispatchEvent(event);
                },
            },
        ],
    });
};

