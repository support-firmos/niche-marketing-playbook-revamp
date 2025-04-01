'use client';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';

interface CardProps {
  title: string;
  icon: IconDefinition;
  onClick: () => void;
  delay: number;
}

export default function PageCard({ title, icon, onClick, delay }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: delay * 0.1,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="cursor-pointer bg-slate-800 rounded-xl p-1 flex flex-col items-center justify-center gap-4 
                 border border-slate-800 transition-colors duration-300
                 w-64 h-48 backdrop-blur-sm"
    >
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
        className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center"
      >
        <FontAwesomeIcon icon={icon} className="w-6 h-6 text-green-500" />
      </motion.div>
      <h3 className="text-lg font-semibold text-white text-center">{title}</h3>
    </motion.div>
  );
}