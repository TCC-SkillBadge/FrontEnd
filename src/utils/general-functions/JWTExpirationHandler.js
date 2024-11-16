import { confirmDialog } from 'primereact/confirmdialog';
import '../../styles/GlobalStylings.css';
import '../../styles/JWTExpirationModal.css';

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
        closable: false,
        draggable: false,
        acceptLabel: 'OK',
        acceptClassName: 'confirm-relogin-btn',
        rejectClassName: 'hidden',
        pt: {
            root: {className: 'p-cd-jwth-container'},
            header: {className: 'p-cd-jwth-header'},
            footer: {className: 'p-cd-jwth-footer'},
            message: {className: 'p-cd-jwth-message'},
            content: {className: 'p-cd-jwth-content'},
        },
    });
};