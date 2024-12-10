export interface alertDialogFireOptions {
    title?: string;
    text?: string;
    icon?: 'question' | 'error' | 'info';
    showCloseButton?: boolean;
    confirmButtonText?: string;
    focusConfirm?: boolean;
    confirmButtonColor?: 'error' | 'info' | 'inherit' | 'primary' | 'secondary' | 'success' | 'warning';
    confirmButtonCb?: () => void;
    showCancelButton?: boolean;
    cancelButtonText?: string;
    focusCancel?: boolean;
    cancelButtonColor?: 'error' | 'info' | 'inherit' | 'primary' | 'secondary' | 'success' | 'warning';
    cancelButtonCb?: () => void;
    showDenyButton?: boolean;
    denyButtonText?: string;
    focusDeny?: boolean;
    denyButtonColor?: 'error' | 'info' | 'inherit' | 'primary' | 'secondary' | 'success' | 'warning';
    denyButtonCb?: () => void;
    reverseButtons?: boolean;
}
