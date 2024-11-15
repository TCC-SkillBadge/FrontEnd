import { confirmDialog } from 'primereact/confirmdialog';

export const jwtExpirationHandler = () => {
    confirmDialog({
        message: (
            <>
            <nobr>Your session has expired</nobr> <br/>
            <nobr>Please login again</nobr>
            </>
        ),
        header: 'Session Expired',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            sessionStorage.clear();
            window.location.href = '/login';
        },
        acceptLabel: 'Ok',
        rejectClassName: 'hidden',
    });
};