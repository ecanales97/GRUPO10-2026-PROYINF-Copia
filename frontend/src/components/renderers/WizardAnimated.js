import { AnimatePresence, motion } from "framer-motion";

import useWizard from "context/wizardContext";

const defaultVariants = {
    enter: (dir) => ({ x: dir === 1 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir === 1 ? -100 : 100, opacity: 0 }),
};

const WizardAnimated = ({
    index,
    direction,
    duration = 0.15,
    variants,
    children,
    className = "d-flex flex-column gap-3 flex-grow-1 justify-content-center",
}) => {
    const wizard = useWizard();
    index ??= wizard.index;
    direction ??= wizard.direction;

    return (
        <AnimatePresence mode="wait" custom={direction}>
            <motion.div
                key={index}
                custom={direction}
                variants={variants ?? defaultVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration }}
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

export default WizardAnimated;
