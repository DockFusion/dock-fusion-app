import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import { alertDialogFireOptions } from 'src/renderer/interfaces';

export function AlertDialog() {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<alertDialogFireOptions>({});

    const handleClose = () => {
        setOpen(false);
    };

    function alertDialogFire(message: string): void;
    function alertDialogFire(options: alertDialogFireOptions): void;
    function alertDialogFire(data: string | alertDialogFireOptions) {
        let options = {};

        if (typeof data === 'string') {
            options = {
                text: data,
            };
        } else {
            options = data;
        }

        setOptions(options);
        setOpen(true);
    }

    useEffect(() => {
        (window as any).alertDialogFire = alertDialogFire;

        return () => {
            delete (window as any).alertDialogFire;
        };
    });

    return (
        <Dialog open={open} onClose={handleClose}>
            {options.title && <DialogTitle>{options.title}</DialogTitle>}
            {options.text && (
                <DialogContent>
                    <DialogContentText>{options.text}</DialogContentText>
                </DialogContent>
            )}
            <DialogActions>
                {[
                    { o: 0, t: 'deny' },
                    { o: 1, t: 'confirm' },
                    { o: 2, t: 'cancel' },
                ]
                    .sort((a, b) => (options.reverseButtons ? b.o - a.o : a.o - b.o))
                    .map((obj) => {
                        switch (obj.t) {
                            case 'deny':
                                return <Fragment key={obj.o}></Fragment>;

                            case 'confirm':
                                return (
                                    <Button
                                        key={obj.o}
                                        onClick={() => {
                                            handleClose();
                                            options.confirmButtonCb && options.confirmButtonCb();
                                        }}
                                        color={options.confirmButtonColor}
                                        autoFocus={options.focusConfirm ?? true}
                                    >
                                        {options.confirmButtonText ?? 'Ok'}
                                    </Button>
                                );

                            case 'cancel':
                                return (
                                    <Fragment key={obj.o}>
                                        {options.showCancelButton && (
                                            <Button
                                                onClick={() => {
                                                    handleClose();
                                                    options.cancelButtonCb && options.cancelButtonCb();
                                                }}
                                                color={options.cancelButtonColor}
                                                autoFocus={options.focusCancel}
                                            >
                                                {options.cancelButtonText ?? 'Cancel'}
                                            </Button>
                                        )}
                                    </Fragment>
                                );

                            default:
                                return <Fragment key={obj.o}></Fragment>;
                        }
                    })}
            </DialogActions>
        </Dialog>
    );
}
