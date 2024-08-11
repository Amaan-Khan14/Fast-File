import  { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const TypingText = ({ message, className }: { message: string, className: string }) => {
    const [displayedText, setDisplayedText] = useState('');
    const controls = useAnimation();

    useEffect(() => {
        const animateText = () => {
            setDisplayedText('');
            let currentIndex = 0;
            const typingInterval = setInterval(() => {
                if (currentIndex <= message.length) {
                    setDisplayedText(message.slice(0, currentIndex));
                    currentIndex++;
                } else {
                    clearInterval(typingInterval);
                    setTimeout(animateText, 1000);
                }
            }, 100);
        };

        animateText();

        return () => {
            setDisplayedText('');
        };
    }, [message]);

    useEffect(() => {
        controls.start({ opacity: 1, transition: { duration: 0.5 } });
    }, [controls]);

    return (
        <motion.h1
            className={className}
            initial={{ opacity: 0 }}
            animate={controls}
        >
            {displayedText}
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            >
                |
            </motion.span>
        </motion.h1>
    );
};

export default TypingText;