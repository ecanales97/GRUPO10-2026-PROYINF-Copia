import {
    useCallback,
    useRef,
    useState,
    useEffect
} from "react";

import Modal from "components/Modal";

export const useModal = (
    initialActive = false
) => {
    const [active, setActive] = useState(initialActive);
    const [loading, setLoading] = useState(false);
    const resolverRef = useRef(null);

    useEffect(() => {
        if (active) {
            document.body.style.overflow =
                "hidden";
        } else {
            document.body.style.overflow =
                "";
        }

        return () => {
            document.body.style.overflow =
                "";
        };
    }, [active]);

    const open = useCallback(() => {
        setActive(true);

        return new Promise((resolve) => {
            resolverRef.current = resolve;
        });
    }, []);

    const close = useCallback(() => {
        setActive(false);
        setLoading(false);

        if (resolverRef.current) {
            resolverRef.current({
                ok: false,
                data: null,
            });

            resolverRef.current = null;
        }
    }, []);

    const confirm = useCallback((data = null) => {
        setActive(false);
        setLoading(false);

        if (resolverRef.current) {
            resolverRef.current({
                ok: true,
                data,
            });

            resolverRef.current = null;
        }
    }, []);

    const toggle = useCallback(() => {
        setActive((prev) => !prev);
    }, []);

    const reset = useCallback(() => {
        setActive(initialActive);
        setLoading(false);
        resolverRef.current = null;
    }, [initialActive]);

    return {
        active,
        loading,

        open,
        close,
        confirm,
        toggle,
        reset,

        setLoading,

        Modal: (props) => (
            <Modal
                active={active}
                loading={loading}
                onClose={close}
                onConfirm={confirm}
                {...props}
            />
        ),
    };
};