import { motion } from 'framer-motion'

/**
 * TimeSelector component for selecting time availability
 */
export default function TimeSelector({
  timeOptions,
  selectedTime,
  onTimeSelect
}) {
  // Animation variants for buttons
  const buttonVariants = {
    hover: { y: -5 },
    tap: { scale: 0.95 }
  }

  return (
    <div className="time-selector">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {timeOptions.map((time) => (
          <motion.button
            key={time}
            className={`p-4 rounded-lg border-2 ${
              selectedTime === time 
                ? 'border-primary dark:border-primary bg-primary/10 dark:bg-primary/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary'
            } transition-colors`}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => onTimeSelect(time)}
          >
            {time}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
