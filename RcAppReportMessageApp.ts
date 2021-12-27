import {
    IAppAccessors,
    IConfigurationExtend,
    IEnvironmentRead,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import { UIActionButtonContext } from "@rocket.chat/apps-engine/definition/ui";
import {
    BlockType,
    ButtonStyle,
    IInputBlock,
    ISectionBlock,
    IUIKitInteractionHandler,
    IUIKitResponse,
    TextObjectType,
    UIKitActionButtonInteractionContext,
    UIKitViewSubmitInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";

export class RcAppReportMessageApp
    extends App
    implements IUIKitInteractionHandler
{
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }
    async extendConfiguration(
        configuration: IConfigurationExtend,
        environmentRead: IEnvironmentRead
    ): Promise<void> {
        configuration.ui.registerButton({
            actionId: "report-message", // this identifies your button in the interaction event
            labelI18n: "report-message", // key of the i18n string containing the name of the button
            context: UIActionButtonContext.MESSAGE_ACTION, // in what context the action button will be displayed in the UI
        });
    }

    public async executeViewSubmitHandler(
        context: UIKitViewSubmitInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ) {
        const data = context.getInteractionData();

        const {
            state,
        }: {
            state: {
                poll: {
                    question: string;
                    [option: string]: string;
                };
                config?: {
                    mode?: string;
                    visibility?: string;
                };
            };
        } = data.view as any;

        this.getLogger().info(state);
        if (!state) {
            return context.getInteractionResponder().viewErrorResponse({
                viewId: data.view.id,
                errors: {
                    question: "Error creating poll",
                },
            });
        }

        try {
        } catch (err) {
            return context.getInteractionResponder().viewErrorResponse({
                viewId: data.view.id,
                errors: err,
            });
        }

        return {
            success: true,
        };
    }
    public async executeActionButtonHandler(
        context: UIKitActionButtonInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<IUIKitResponse> {
        const { buttonContext, actionId, triggerId, user, room, message } =
            context.getInteractionData();

        this.getLogger().info(context.getInteractionData());

        if (actionId === "report-message") {
            const block = modify.getCreator().getBlockBuilder();

            block.addInputBlock({
                blockId: "report-message",
                element: block.newPlainTextInputElement({
                    actionId: "reason",
                    multiline: true,
                }),
                label: block.newPlainTextObject("Reason"),
            });

            return context.getInteractionResponder().openModalViewResponse({
                title: block.newPlainTextObject("Report message"),
                submit: block.newButtonElement({
                    style: ButtonStyle.DANGER,
                    text: block.newPlainTextObject("Report"),
                }),
                close: block.newButtonElement({
                    text: block.newPlainTextObject("Dismiss"),
                }),
                state: {
                    mid: message?.id,
                },
                blocks: block.getBlocks(),
            });
        }

        return context.getInteractionResponder().successResponse();
    }
}
