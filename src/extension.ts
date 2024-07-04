import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('markdownJpToEn');
    const isEnabled = config.get<boolean>('enable',true);
    if (!isEnabled) {
        return;
    }

    let previousLine = -1;

    vscode.window.onDidChangeTextEditorSelection(event => {
        const document = event.textEditor.document;
        if (document.languageId === 'markdown') {
            const editor = event.textEditor;
            if (editor && editor.document === document) {
     


                const position = editor.selection.active;
                if (position.line !== previousLine) {
                    if (previousLine >= 0) {
                        const line = document.lineAt(previousLine);
                        let text = line.text;

                        const replacements = getReplacements();
                        replacements.forEach(replacement => {
                            text = text.replace(new RegExp(replacement.jp, 'g'), replacement.en);
                        });

                        editor.edit(editBuilder => {
                            editBuilder.replace(line.range, text);
                        }, {
                            undoStopBefore: false,
                            undoStopAfter: false
                        });
                    }
                    previousLine = position.line;
                }
            }
        }
    });

    context.subscriptions.push(vscode.commands.registerCommand('extension.convertJPToEN', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            let text = document.getText(selection);

            const replacements = getReplacements();
            replacements.forEach(replacement => {
                text = text.replace(new RegExp(replacement.jp, 'g'), replacement.en);
            });

            editor.edit(editBuilder => {
                editBuilder.replace(selection, text);
            });
        }
    }));
}
function getReplacements(): { jp: string, en: string }[] {
    const configuration = vscode.workspace.getConfiguration('markdownJpToEn');
    return configuration.get('replacements') || [];
}

export function deactivate() {}
