import { motion } from 'framer-motion';

const WaveLines = () => {
    const lines = Array(30).fill(0);

    return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            {lines.map((_, index) => (
                <motion.path
                    key={index}
                    d={`M 0 ${50 + index * 1.5} Q 50 ${40 + Math.sin(index) * 20} 100 ${50 + index * 1.5}`}
                    stroke="rgba(0, 255, 255, 0.3)"
                    strokeWidth="0.2"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                        pathLength: 1,
                        opacity: 0.5,
                        y: [0, Math.sin(index) * 1, 0],
                    }}
                    transition={{
                        duration: 3,
                        y: {
                            repeat: Infinity,
                            duration: 2 + index * 0.1,
                            ease: "easeInOut",
                        }
                    }}
                />
            ))}
        </svg>
    );
};

export default WaveLines;