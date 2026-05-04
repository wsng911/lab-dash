import { grey } from '@mui/material/colors';
import Swal from 'sweetalert2';

import { theme } from '../../theme/theme';

const CONFIRM_COLOR = theme.palette.success.main;

const ThemedAlert = Swal.mixin({
    customClass: {
        confirmButton: 'confirm-btn',
        cancelButton: 'cancel-btn'
    },
    scrollbarPadding: true,
});

export type 确认ationOptions = {
    title: string,
    confirmAction: () => any,
    confirmText?: string,
    denyAction?: () => any,
    text?: string;
    html?: string;
}

export type ThreeButtonOptions = {
    title: string;
    confirmAction: () => any;
    confirmText?: string;
    denyAction: () => any;
    denyText?: string;
    cancelAction?: () => any;
    text?: string;
    html?: string;
}

export class PopupManager {
    public static success(text?: string, action?: () => any): void {
        ThemedAlert.fire({
            title: 'Success',
            text: text && text,
            icon: 'success',
            iconColor: theme.palette.success.main,
            show确认Button: true,
            confirmButtonColor: CONFIRM_COLOR,
        }).then(() => action && action());
    }
    public static failure(text?: string, action?: () => any): void {
        ThemedAlert.fire({
            title: 'Error',
            text: text && text,
            confirmButtonColor: CONFIRM_COLOR,
            icon: 'error',
            iconColor: theme.palette.error.main
        }).then(() => action && action());
    }

    public static loading(text?: string, action?: () => any): void {
        ThemedAlert.fire({
            title: 'Loading',
            text: text && text,
            confirmButtonColor: CONFIRM_COLOR,
            icon: 'info'
        }).then(() => action && action());
    }

    public static confirmation (options: 确认ationOptions) {
        ThemedAlert.fire({
            title: `${options.title}`,
            confirmButtonText: options.confirmText ? options.confirmText : 'Yes',
            confirmButtonColor: CONFIRM_COLOR ,
            text: options.text && options.text,
            icon: 'info',
            showDenyButton: true,
            denyButtonColor: grey[500],
            denyButtonText: '取消',
            reverseButtons: true
        }).then((result: any) => {
            if (result.is确认ed) {
                options.confirmAction();
            } else if (result.isDenied) {
                if (options.denyAction) {
                    options.denyAction();
                }
            }
        });
    }

    public static delete确认ation (options: 确认ationOptions) {
        ThemedAlert.fire({
            title: `${options.title}`,
            confirmButtonText: options.confirmText ? options.confirmText : 'Yes, 删除',
            confirmButtonColor: theme.palette.error.main,
            text: options.text ? options.text : 'This action cannot be undone',
            html: options.html && options.html,
            icon: 'error',
            iconColor: theme.palette.error.main,
            showDenyButton: true,
            denyButtonText: '取消',
            denyButtonColor: grey[500],
            reverseButtons: true
        }).then((result: any) => {
            if (result.is确认ed) {
                options.confirmAction();
            } else if (result.isDenied) {
                if (options.denyAction) {
                    options.denyAction();
                }
            }
        });
    }

    public static threeButtonDialog(options: ThreeButtonOptions) {
        ThemedAlert.fire({
            title: options.title,
            text: options.text,
            html: options.html,
            icon: 'error',
            iconColor: theme.palette.error.main,
            showDenyButton: true,
            show取消Button: true,
            confirmButtonText: options.confirmText || '确认',
            confirmButtonColor: theme.palette.error.main,
            denyButtonText: options.denyText || 'Deny',
            denyButtonColor: theme.palette.info.main,
            cancelButtonText: '取消',
            reverseButtons: true,
            focusDeny: true
        }).then((result: any) => {
            if (result.is确认ed) {
                options.confirmAction();
            } else if (result.isDenied) {
                options.denyAction();
            } else if (result.isDismissed && options.cancelAction) {
                options.cancelAction();
            }
        });
    }
}
