import type { Context } from "telegraf";

export const getCommandName = (context: Context) => {
    if (context === undefined || context === null) {
        return "";
    }

    const message: any = context?.message;

    if (!message.text || !message.text.startsWith("/")) {
        return "";
    }

    const command = message?.text
        .substring(1)
        .split(/\s/)
        .at(0);

    if (command === undefined) {
        return "";
    }

    return command.replace(`@${context.me}`, "");
}