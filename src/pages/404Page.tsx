"use client"


import { useEffect } from "react"
import { motion } from "framer-motion"
import { BookOpenText, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/Components/ui/button"


export default function NotFoundPage() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  const bookVariants = {
    initial: { rotateY: 0 },
    animate: {
      rotateY: [0, 180, 0],
      transition: {
        duration: 2.5,
        repeat: Number.POSITIVE_INFINITY,
        repeatDelay: 5,
        ease: "easeInOut",
      },
    },
  }



  // Parallax effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const elements = document.querySelectorAll(".parallax")
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight

      elements.forEach((el) => {
        const element = el as HTMLElement
        const speed = Number.parseFloat(element.getAttribute("data-speed") || "0")
        const xOffset = (x - 0.5) * speed * 50
        const yOffset = (y - 0.5) * speed * 50

        element.style.transform = `translate(${xOffset}px, ${yOffset}px)`
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-[10%] left-[10%] opacity-5 parallax"
          data-speed="0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 1 }}
        >
          <BookOpenText size={200} />
        </motion.div>
        <motion.div
          className="absolute bottom-[10%] right-[10%] opacity-5 parallax"
          data-speed="0.7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 1 }}
        >
          <BookOpenText size={200} />
        </motion.div>
      </div>

      {/* Main content */}
      <motion.div
        className="max-w-md w-full z-10 flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Book icon with animation */}
        <motion.div className="mb-8" variants={bookVariants} initial="initial" animate="animate">
          <BookOpenText size={80} className="text-black" />
        </motion.div>

        {/* Error message */}
        <motion.h1 className="text-6xl font-bold mb-2 text-center" variants={itemVariants}>
          404
        </motion.h1>
        <motion.h2 className="text-2xl font-semibold mb-6 text-center" variants={itemVariants}>
          Page Not Found
        </motion.h2>
        <motion.p className="text-gray-600 mb-8 text-center" variants={itemVariants}>
          The book you're looking for seems to be missing from our shelves.
        </motion.p>


        {/* Navigation buttons */}
        <motion.div className="flex flex-col sm:flex-row gap-4 w-full" variants={itemVariants}>
          <Button
            className="flex-1 bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={18} />
            Go Back
          </Button>
          <Button
            className="flex-1 bg-white text-black border-2 border-black hover:bg-gray-100 flex items-center justify-center gap-2"
            onClick={() => (window.location.href = "/")}
          >
            <Home size={18} />
            Home Page
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
