import { alertDialogFireOptions } from 'src/interfaces';

interface Props {}

export const useAlertDialog = (props?: Props) => {
    function alertDialogFire(message: string): void;
    function alertDialogFire(options: alertDialogFireOptions): void;
    function alertDialogFire(data: string | alertDialogFireOptions) {
        (window as any).alertDialogFire(data);
    }

    return { alertDialogFire };
};
