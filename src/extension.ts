import * as vscode from "vscode";
import { Iparams, IQuery, fileTextData, Iconfig } from "./types/index";
const translate = require("@vitalets/google-translate-api");
const chalk = require("chalk");
const request = require("co-request");
const { stringify } = require("query-string");
const stringifyPretty = require("json-stringify-pretty-compact");

async function googleWords(
  q: string,
  params: { from: string; to: string; tld: string }
) {
  return translate(q, params)
    .then((res: { text: string }) => res.text)
    .catch((err: any) => console.log(err));
}

async function google(query: { q: string }): Promise<string | null> {
  let { q } = query;
  const from = "zh-CN",
    to = "en",
    tld = "cn";
  const result = await googleWords(q, { from, to, tld });
  console.log(chalk.yellow(`${q}:${result}`));
  return result;
}

async function words(params: Iparams): Promise<string | null> {
  const url = "http://fanyi.youdao.com/translate";
  try {
    //http://fanyi.youdao.com/translate?smartresult=dict&smartresult=rule&sessionFrom=https://www.baidu.com/link&from=AUTO&to=AUTO&smartresult=dict&client=fanyideskweb&salt=1500092479607&sign=c98235a85b213d482b8e65f6b1065e26&doctype=json&version=2.1&keyfrom=fanyi.web&action=FY_BY_CL1CKBUTTON&typoResult=true&i=hello
    let data = {
      smartresult: "dict",
      sessionFrom: "https://www.baidu.com/link",
      from: "AUTO",
      to: "AUTO",
      client: "fanyideskweb",
      salt: "1500092479607",
      sign: "c98235a85b213d482b8e65f6b1065e26",
      doctype: "json",
      version: "2.1",
      keyfrom: "fanyi.web",
      action: "FY_BY_CL1CKBUTTON",
      typoResult: "true",
      i: params.q,
    };
    const { body } = (await request(`${url}?${stringify(data)}`)) as any;
    return JSON.parse(body).translateResult[0][0]["tgt"];
  } catch (e) {
    console.log(e);
  }
  console.log(
    chalk.yellow(
      "youdao:apikey is forbidden, apply another in http://fanyi.youdao.com/openapi?path=data-mode"
    )
  );
  return null;
}
async function youdao(query: IQuery): Promise<string | null> {
  let { apiname, apikey, q } = query;
  if (apikey === "") {
    vscode.window.showInformationMessage(
      "请先配置有道的api相关账号和密钥！"
    );
    return "请先配置有道的api相关账号和密钥！";
  }
  const result = await words({
    keyfrom: apiname,
    key: apikey,
    type: "data",
    doctype: "json",
    version: "1.1",
    q,
  });
  console.log(chalk.yellow(`${q}:${result}`));
  return result;
}

function getProxyConfig(): Iconfig {
  const config = vscode.workspace.getConfiguration("codeTranslator");
  return {
    apikey: config.get("youdaoApiKey") || "",
    apiname: config.get("youdaoApiName") || "",
    useGoogleApi: config.get("useGoogleApi") || false,
  };
}

function trans(params: { q: string }) {
  const { useGoogleApi, apikey, apiname } = getProxyConfig();
  return useGoogleApi ? google(params) : youdao({ ...params, apikey, apiname });
}

export function activate(context: vscode.ExtensionContext) {
  let disposable1 = vscode.commands.registerCommand(
    "extension.everest.fanyi1",
    async () => {
      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No open text editor
      }
      let document = editor.document;
      let selection = editor.selection;
      let text = editor.document.getText(selection);

      //有选中翻译选中的词
      if (text.length) {
        const newWords = await trans({ q: text });
        editor!.edit((builder) => {
          builder.replace(selection, newWords!);
        });
        //vscode.window.showInformationMessage("translate result: " + newWords);
      }
    }
  );

  let disposable2 = vscode.commands.registerCommand(
    "extension.everest.fanyi2",
    async () => {
      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No open text editor
      }
      let document = editor.document;
      let selection = editor.selection;
      let text = editor.document.getText(selection);

      //有选中翻译选中的词
      if (text.length) {
        const newWords = await trans({ q: text });
        editor!.edit((builder) => {
          builder.replace(selection, newWords!);
        });
        //vscode.window.showInformationMessage("translate result: " + newWords);
      }
    }
  );

  let disposable3 = vscode.commands.registerCommand(
    "extension.everest.fanyi3",
    async () => {
      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No open text editor
      }
      let document = editor.document;
      let selection = editor.selection;
      let text = editor.document.getText(selection);

      //有选中翻译选中的词
      if (text.length) {
        const newWords = await trans({ q: text });
        editor!.edit((builder) => {
          builder.replace(selection, newWords!);
        });
        //vscode.window.showInformationMessage("translate result: " + newWords);
      }
    }
  );

  let disposable4 = vscode.commands.registerCommand(
    "extension.everest.fanyi4",
    async () => {
      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No open text editor
      }
      let document = editor.document;
      let selection = editor.selection;
      let text = editor.document.getText(selection);

      //有选中翻译选中的词
      if (text.length) {
        const newWords = await trans({ q: text });
        editor!.edit((builder) => {
          builder.replace(selection, newWords!);
        });
        //vscode.window.showInformationMessage("translate result: " + newWords);
      }
    }
  );

  vscode.languages.registerHoverProvider("*", {
    async provideHover(document, position, token) {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No open text editor
      }

      const selection = editor.selection;
      const text = document.getText(selection);
      if (!text) {
        return;
      }

      //TODO 延时响应

      const res = await trans({ q: text });

      const markdownString = new vscode.MarkdownString();

      markdownString.appendMarkdown(`#### 翻译 \n\n ${res} \n\n`);

      return new vscode.Hover(markdownString);
    },
  });

  context.subscriptions.push(disposable1);
  context.subscriptions.push(disposable2);
  context.subscriptions.push(disposable3);
  context.subscriptions.push(disposable4);
}

export function deactivate() {}
